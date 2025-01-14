import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarTrackingGateway } from './car-tracking/car-tracking.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CarTrackingGateway],
})
export class AppModule {}
