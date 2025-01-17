import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Vin Shuttle Xin Chào <==3';
  }
}
