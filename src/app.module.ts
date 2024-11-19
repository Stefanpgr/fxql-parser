import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FxqlStatementsModule } from './fxql-statements/fxql-statements.module';

@Module({
  imports: [FxqlStatementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
