import { ApiProperty } from '@nestjs/swagger';
import {
  
    IsNotEmpty,
  } from 'class-validator';

export class CreateFxqlStatementDto {
    @IsNotEmpty()
    @ApiProperty({example: "USD-GBP {\\n BUY 100\\n SELL 0.04590\\n CAP 1000\\n}\\n\\nUSD-JPY {\\n BUY 100\\n SELL 0.04580\\n CAP 1000\\n}"})
    FXQL: string
}
