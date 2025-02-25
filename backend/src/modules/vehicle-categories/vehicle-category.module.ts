import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleCategoryController } from './vehicle-category.controller';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleCategoryRepository } from './vehicle-category.repo';
import { VehicleCategory, VehicleCategorySchema } from './vehicle-category.schema';
import { VEHICLE_CATEGORY_SERVICE, VEHICLE_CATEGORY_REPOSITORY } from './vehicle-category.di-token';

const dependencies: Provider[] = [
  {
    provide: VEHICLE_CATEGORY_SERVICE,
    useClass: VehicleCategoryService,
  },
  {
    provide: VEHICLE_CATEGORY_REPOSITORY,
    useClass: VehicleCategoryRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VehicleCategory.name,
        schema: VehicleCategorySchema,
      },
    ]),
  ],
  controllers: [VehicleCategoryController],
  providers: [...dependencies],
  exports: [VEHICLE_CATEGORY_SERVICE, VEHICLE_CATEGORY_REPOSITORY], // Export nếu module khác cần sử dụng service này
})
export class VehicleCategoryModule {}
