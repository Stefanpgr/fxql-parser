import { PartialType } from '@nestjs/swagger';
import { CreateFxqlStatementDto } from './create-fxql-statement.dto';

export class UpdateFxqlStatementDto extends PartialType(CreateFxqlStatementDto) {}
