import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { FxqlStatementsService } from './fxql-statements.service';
import { CreateFxqlStatementDto } from './dto/create-fxql-statement.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiSchema, ApiTags } from '@nestjs/swagger';
import { FxqlParserResponseDto } from './entities/fxql-statement.entity';

@ApiTags('FXQL Parser')
@ApiSchema(CreateFxqlStatementDto)
@ApiOkResponse({ type: FxqlParserResponseDto })
@Controller('fxql-statements')
export class FxqlStatementsController {
  constructor(private readonly fxqlStatementsService: FxqlStatementsService) {}
 
  @HttpCode(200)
  @Post()
  create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {

    return this.fxqlStatementsService.parseAndSaveFXQL(createFxqlStatementDto);
  }


}
