import {
  
    IsNotEmpty,
  } from 'class-validator';

export class CreateFxqlStatementDto {
    @IsNotEmpty()
    FXQL: string
}
