import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFxqlStatementDto } from './dto/create-fxql-statement.dto';
import { PrismaService } from 'prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FxqlStatementsService {
  constructor(private prismaService: PrismaService) {}

  async parseAndSaveFXQL(dto: CreateFxqlStatementDto) {
    const fxqlInput = dto.FXQL;
    // Unescape and normalize the input string
    const normalizedInput = fxqlInput.replace(/\\n/g, '\n').trim();

    if (/\n{2,}\s*\n/.test(normalizedInput)) {
      throw new BadRequestException(
        'Multiple newlines within a single FXQL statement'
      );
    }

    const blocks = normalizedInput.split(/\n\s*\n/); // Split by empty lines into blocks

    const results = new Map<string, any>();
    for (const [index, block] of blocks.entries()) {
      try {
        const parsedBlock = this.parseBlock(block.trim(), index + 1);
        const pairKey = `${parsedBlock.sourceCurrency}-${parsedBlock.destinationCurrency}`;
        // This will overwrite the latest block for the same currency pair
      results.set(pairKey, {
        id: uuidv4(),
        SourceCurrency: parsedBlock.sourceCurrency,
        DestinationCurrency: parsedBlock.destinationCurrency,
        SellPrice: parsedBlock.sell,
        BuyPrice: parsedBlock.buy,
        CapAmount: parsedBlock.cap,
      });
      } catch (error) {
        throw new BadRequestException(
          `Error in block ${index + 1}: ${error.message}`,
        );
      }
    }

    const data = Array.from(results.values());

    await this.batchUpsert(data);

    return {
      message: 'Rates Parsed Successfully.',
      code: 'FXQL-200',
      data: data.map(({ id, ...rest }) => ({ EntryId: id, ...rest })),
    };
  }

  private parseBlock(block: string, index: number) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Empty FXQL statement.');
    }

    const headerRegex = /^(\w{3})-(\w{3})\s*{$/;
    const headerMatch = lines[0].trim().match(headerRegex);
    console.log(Array.from(headerMatch))
    const currencyPairSplit = Array.from(headerMatch)
    const curr1 = currencyPairSplit[1]
    const curr2 = currencyPairSplit[2]
 
    if (!headerMatch) {
      throw new Error('Invalid currency pair format. Expected CURR1-CURR2');
    }
    if(curr1 !== curr1.toUpperCase()){
      throw new Error('Invalid currency pair format. Expected CURR1 to be all Uppercase');
    } else if(curr2 !== curr2.toUpperCase()){
      throw new Error('Invalid currency pair format. Expected CURR2 to be all Uppercase');
    }
    const [_, sourceCurrency, destinationCurrency] = headerMatch;
    const data = { sourceCurrency, destinationCurrency } as any;

    // Process data lines (BUY, SELL, CAP)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '}') {
        // Ignore closing brace
        continue;
      }

const fieldRegex = /^\s*(BUY|SELL|CAP)\s+(.+)\s*$/;
      const match = line.match(fieldRegex);

      if (!match) {
        throw new Error(`Invalid line format: ${line}`);
      }

      const [, key, value] = match;
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        throw new BadRequestException(`'${value}' is not a valid numeric amount`);
      }

      if (
        key === 'CAP' &&
        (!Number.isInteger(numericValue) || numericValue < 0)
      ) {
        
        throw new Error(`CAP value Must be a non-negative whole number.`);
      }

      data[key.toLowerCase()] = Number(value);
    }

   

    if (!data.buy || !data.sell || data.cap === undefined) {
      throw new Error(`Missing required fields in block.`);
    }

    return data;
  }

  private async saveData(data: any[]) {
    try {
      return await this.prismaService.fxqlRecords.createMany({ data });
    } catch (error) {
      throw new BadRequestException(
        `Database insertion failed: ${error.message}`,
      );
    }
  }

  private async batchUpsert(data: any[]) {
    try {
      const upsertPromises = data.map((entry) =>
        this.prismaService.fxqlRecords.upsert({
          where: {
            SourceCurrency_DestinationCurrency: {
              SourceCurrency: entry.SourceCurrency,
              DestinationCurrency: entry.DestinationCurrency,
            },
          },
          update: {
            SellPrice: entry.SellPrice,
            BuyPrice: entry.BuyPrice,
            CapAmount: entry.CapAmount,
          },
          create: entry,
        }),
      );
      await Promise.all(upsertPromises);
    } catch (error) {
      throw new BadRequestException(
        `Batch database upsert failed: ${error.message}`,
      );
    }
  }

}
