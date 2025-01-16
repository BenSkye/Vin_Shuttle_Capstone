import { Module, Provider } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VEHICLE_REPOSITORY, VEHICLE_SERVICE } from 'src/modules/vehicles/vehicles.di-token';
import { VehiclesRepository } from 'src/modules/vehicles/vehicles.repository';
import { Vehicle, VehicleSchema } from 'src/modules/vehicles/vehicles.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleCategoryModule } from 'src/modules/vehicle-categories/vehicle-category.module';

const dependencies: Provider[] = [
  {
    provide: VEHICLE_REPOSITORY,
    useClass: VehiclesRepository
  },
  {
    provide: VEHICLE_SERVICE,
    useClass: VehiclesService
  }
]

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Vehicle.name,
        schema: VehicleSchema
      }
    ]),
    VehicleCategoryModule
  ],
  controllers: [VehiclesController],
  providers: [...dependencies],
  // exports: [VehiclesRepository],
})
export class VehiclesModule { }
