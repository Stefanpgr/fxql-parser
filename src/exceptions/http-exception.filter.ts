import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  

  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    async catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
   
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        exception instanceof HttpException
          ? (exception.getResponse() as any).message || exception.message
          : 'an error occurred';
      console.error(exception.message, exception.stack);
      return response.status(status).json({
        message,
        code: `FXQL-${status}`,
        stack: exception.stack.split('    ').slice(1, 2),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
  