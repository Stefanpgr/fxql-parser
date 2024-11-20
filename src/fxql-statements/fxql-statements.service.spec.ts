import { Test, TestingModule } from '@nestjs/testing';
import { FxqlStatementsService } from './fxql-statements.service';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

describe('FxqlStatementsService', () => {
  let service: FxqlStatementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FxqlStatementsService, PrismaService],
    }).compile();

    service = module.get<FxqlStatementsService>(FxqlStatementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


    it('should throw error for missing required fields', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nCAP 1000\n}' // Missing SELL
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: Missing required fields in statement.')
      );
    });

    it('should throw error for invalid numeric values', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY abc\nSELL 1.2\nCAP 1000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException("Error in statement 1: 'abc' is not a valid numeric amount")
      );
    });

    it('should throw error for negative CAP value', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nSELL 1.2\nCAP -1000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: CAP value Must be a non-negative whole number.')
      );
    });

    it('should throw error for decimal CAP value', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nSELL 1.2\nCAP 1000.5\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: CAP value Must be a non-negative whole number.')
      );
    });

    it('should throw error for lowercase currency codes', async () => {
      const invalidInput = {
        FXQL: 'usd-EUR {\nBUY 1.1\nSELL 1.2\nCAP 1000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: Invalid currency pair format. Expected CURR1 to be all Uppercase')
      );
    });

    it('should throw error for empty statement', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: Missing required fields in statement.')
      );
    });

    it('should handle malformed block format', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR \nBUY 1.1\nSELL 1.2\nCAP 1000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException("Invalid format: Each FXQL statements must start with a properly formatted header like 'CURR1-CURR2 {'.")
      );
    });

    it('should handle invalid BUY/SELL format', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY: 1.1\nSELL 1.2\nCAP 1000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Error in statement 1: Invalid BUY/SELL format: BUY: 1.1')
      );
    });

    it('should throw error for multiple newlines between statements', async () => {
      const invalidInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nSELL 1.2\nCAP 1000\n}\n\n\nGBP-EUR {\nBUY 0.9\nSELL 1.0\nCAP 2000\n}'
      };

      await expect(service.parseAndSaveFXQL(invalidInput)).rejects.toThrow(
        new BadRequestException('Multiple newlines between FXQL statements are not allowed.')
      );
    });

    it('should successfully parse and save valid FXQL statements', async () => {
      const validInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nSELL 1.2\nCAP 1000\n}'
      };

      const mockUpsertResponse = [{
        id: 'mock-uuid',
        SourceCurrency: 'USD',
        DestinationCurrency: 'EUR',
        SellPrice: 1.2,
        BuyPrice: 1.1,
        CapAmount: 1000
      }];

      jest.spyOn(service['prismaService'].fxqlRecords, 'upsert')
        .mockResolvedValue(mockUpsertResponse[0]);

      const result = await service.parseAndSaveFXQL(validInput);

      expect(result).toEqual({
        message: 'Rates Parsed Successfully.',
        code: 'FXQL-200',
        data: [{
          EntryId: 'mock-uuid',
          SourceCurrency: 'USD',
          DestinationCurrency: 'EUR',
          SellPrice: 1.2,
          BuyPrice: 1.1,
          CapAmount: 1000
        }]
      });
    });

    it('should handle multiple valid FXQL statements', async () => {
      const validInput = {
        FXQL: 'USD-EUR {\nBUY 1.1\nSELL 1.2\nCAP 1000\n}\n\nGBP-EUR {\nBUY 0.9\nSELL 1.0\nCAP 2000\n}'
      };

      const mockUpsertResponses = [
        {
          id: 'mock-uuid-1',
          SourceCurrency: 'USD',
          DestinationCurrency: 'EUR',
          SellPrice: 1.2,
          BuyPrice: 1.1,
          CapAmount: 1000
        },
        {
          id: 'mock-uuid-2',
          SourceCurrency: 'GBP',
          DestinationCurrency: 'EUR',
          SellPrice: 1.0,
          BuyPrice: 0.9,
          CapAmount: 2000
        }
      ];

      jest.spyOn(service['prismaService'].fxqlRecords, 'upsert')
        .mockImplementation(() => {
          const promise = Promise.resolve(mockUpsertResponses[0]);
          Object.defineProperty(promise, Symbol.toStringTag, { value: 'PrismaPromise' });
          return promise as any;
        });

      const result = await service.parseAndSaveFXQL(validInput);

      expect(result.message).toBe('Rates Parsed Successfully.');
      expect(result.code).toBe('FXQL-200');
      expect(result.data.length).toBe(2);
    });


  
});
