import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FxqlStatementsModule } from './fxql-statements/fxql-statements.module';
import { minutes, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    FxqlStatementsModule,   
    ThrottlerModule.forRoot({
      throttlers: [{limit: 20, ttl: minutes(1)}],
      errorMessage: 'Oops! too many requests there. Wait about a minute then try again.'
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
