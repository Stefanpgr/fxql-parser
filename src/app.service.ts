import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    throw new BadRequestException("yooo")
    return 'Hello World!';
  }
}
