import { ApiResponseProperty } from "@nestjs/swagger";

export class FxqlParserResponseDto  {
    @ApiResponseProperty({ example: 'Bank account created successfully' })
    message: string;
    @ApiResponseProperty({
        example: 
          {
            message: 'Rates Parsed Successfully.',
            code: 'FXQL-200',
            data: [
              {
                EntryId: '355e05b2-a6cd-4fba-b33d-0d045311a640',
                SourceCurrency: 'USD',
                DestinationCurrency: 'GBP',
                SellPrice: 0.0459,
                BuyPrice: 100,
                CapAmount: 1000,
              },
              {
                EntryId: '1de76735-987a-4485-9d89-99f5a8956c86',
                SourceCurrency: 'USD',
                DestinationCurrency: 'JPY',
                SellPrice: 0.0458,
                BuyPrice: 100,
                CapAmount: 1000,
              },
            ],
          },
      })
    data: object;
  }
