import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FxqlStatementsService } from './fxql-statements.service';
import { CreateFxqlStatementDto } from './dto/create-fxql-statement.dto';
import { PrismaService } from 'prisma.service';

@Controller('fxql-statements')
export class FxqlStatementsController {
  constructor(private readonly fxqlStatementsService: FxqlStatementsService, prismaService: PrismaService) {}

  @Post()
  create(@Body() createFxqlStatementDto: CreateFxqlStatementDto) {

    return this.fxqlStatementsService.parseAndSaveFXQL(createFxqlStatementDto);
  }


}
