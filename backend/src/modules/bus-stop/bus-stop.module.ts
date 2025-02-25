import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusStop, BusStopSchema } from './bus-stop.schema';
import { BusStopController } from './bus-stop.controller';
import { BusStopService } from './bus-stop.service';
import { BusStopRepository } from './bus-stop.repo';
import { BUS_STOP_REPOSITORY, BUS_STOP_SERVICE } from './bus-stop.di-token';
import { KeytokenModule } from '../keytoken/keytoken.module';
import { ShareModule } from 'src/share/share.module';

const dependencies = [
  {
    provide: BUS_STOP_REPOSITORY,
    useClass: BusStopRepository,
  },
  {
    provide: BUS_STOP_SERVICE,
    useClass: BusStopService,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BusStop.name,
        schema: BusStopSchema,
      },
    ]),
    KeytokenModule,
    ShareModule,
  ],
  controllers: [BusStopController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class BusStopModule {}
