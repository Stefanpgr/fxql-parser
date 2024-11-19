import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import * as compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import config from './config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: false,
      validationError: {
        value: false,
      },
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
  });
  app.use(helmet());
  app.use(compression());

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms'),
  );
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FXQL API')
    .setDescription('FXQL Parser API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        name: 'Authorisation',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);
  await app.listen(config.port);
}

bootstrap().then(() => {
  console.info(`
    -------------------------------------------
      Server Application Started!
      BASE URL: http://localhost:${config.port}
    -------------------------------------------
  `);
});
