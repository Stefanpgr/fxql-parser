import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { FxqlStatementsService } from './fxql-statements.service';
import { CreateFxqlStatementDto } from './dto/create-fxql-statement.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiSchema, ApiTags } from '@nestjs/swagger';
import { FxqlParserResponseDto } from './entities/fxql-statement.entity';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('FXQL Parser')
@ApiSchema(CreateFxqlStatementDto)
@ApiOkResponse({ type: FxqlParserResponseDto })
@Controller('fxql-statements')
export class FxqlStatementsController {
  constructor(private readonly fxqlStatementsService: FxqlStatementsService) {}
 
  @HttpCode(200)
  @Post()
  @UseGuards(ThrottlerGuard)
  @ApiOperation({summary: "Parses and saves FXQL statements. Ensures that each currency pair appears only once with the latest provided values."})
  async create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {

    return await this.fxqlStatementsService.parseAndSaveFXQL(createFxqlStatementDto);
  }


}
