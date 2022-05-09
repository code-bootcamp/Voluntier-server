import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log("🟢 Health Check!")
    return 'Hello World!';
  }
}
