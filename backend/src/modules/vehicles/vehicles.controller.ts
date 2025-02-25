import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { VehicleValidation } from 'src/modules/vehicles/validations/vehicle.validation';
import {
  CreateVehicleDto,
  ICreateVehicle,
  IUpdateVehicle,
  UpdateVehicleDto,
} from 'src/modules/vehicles/vehicle.dto';
import { VEHICLE_SERVICE } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesService } from 'src/modules/vehicles/vehicles.port';
import { VehicleCondition, VehicleOperationStatus } from 'src/share/enums/vehicle.enum';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(
    @Inject(VEHICLE_SERVICE)
    private readonly vehicalService: IVehiclesService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all vehicles' })
  async getAllVehicleCategories() {
    return await this.vehicalService.list();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a vehicle by id' })
  @ApiParam({
    name: 'id',
    description: 'The id of the vehicle',
    example: '6787801c048da981c9778458',
  })
  async getVehicleCategoryById(@Param('id') id: string) {
    return await this.vehicalService.getById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a vehicle' })
  @ApiBody({
    type: CreateVehicleDto,
    description: 'Create a vehicle',
    examples: {
      'Create a vehicle': {
        value: {
          name: 'Xe điện 4 chỗ A01',
          categoryId: '67873bb9cf95c847fe62ba5f',
          licensePlate: '888.88',
          image: [
            'https://image.made-in-china.com/202f0j00JKrafunlaRhp/Elecric-Shuttle-Bus-14-Person-Seats-Sightseeing-Car-in-City-Sightseeing-Bus-DN-14G-.webp',
          ],
          operationStatus: VehicleOperationStatus.CHARGING,
          vehicleCondition: VehicleCondition.AVAILABLE,
        },
      },
    },
  })
  async createVehicleCategory(
    @Body(new JoiValidationPipe(VehicleValidation.create)) createDto: ICreateVehicle,
  ) {
    return await this.vehicalService.insert(createDto);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({
    name: 'id',
    description: 'The id of the vehicle',
    example: '6787801c048da981c9778458',
  })
  @ApiBody({
    type: UpdateVehicleDto,
    description: 'Update a vehicle',
    examples: {
      'Update a vehicle': {
        value: {
          name: 'Xe điện 4 chỗ A01',
          categoryId: '67873bb9cf95c847fe62ba5f',
          licensePlate: '888.88',
          image: [
            'https://image.made-in-china.com/202f0j00JKrafunlaRhp/Elecric-Shuttle-Bus-14-Person-Seats-Sightseeing-Car-in-City-Sightseeing-Bus-DN-14G-.webp',
          ],
          operationStatus: VehicleOperationStatus.CHARGING,
          vehicleCondition: VehicleCondition.AVAILABLE,
        },
      },
    },
  })
  async updateVehicleCategory(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(VehicleValidation.update)) updateDto: IUpdateVehicle,
  ) {
    return await this.vehicalService.update(id, updateDto);
  }
}
