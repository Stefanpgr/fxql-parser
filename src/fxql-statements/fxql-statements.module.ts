import { Module } from '@nestjs/common';
import { FxqlStatementsService } from './fxql-statements.service';
import { FxqlStatementsController } from './fxql-statements.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FxqlStatementsController],
  providers: [FxqlStatementsService, PrismaService],
})
export class FxqlStatementsModule {}
