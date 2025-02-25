import { Body, Controller, Get, Inject, Param, Post, Put, HttpCode } from '@nestjs/common';
import { VEHICLE_CATEGORY_SERVICE } from './vehicle-category.di-token';
import { IVehicleCategoryService } from './vehicle-category.port';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { VehicleCategoryValidation } from 'src/modules/vehicle-categories/validations/vehicle-category.validation';
import {
  CreateVehicleCategoryDto,
  ICreateVehicleCategoryDto,
  IUpdateVehicleCategoryDto,
  UpdateVehicleCategoryDto,
} from 'src/modules/vehicle-categories/vehicle-category.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
@ApiTags('vehicle-categories')
@Controller('vehicle-categories')
export class VehicleCategoryController {
  constructor(
    @Inject(VEHICLE_CATEGORY_SERVICE)
    private readonly vehicleCategoryService: IVehicleCategoryService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all vehicle categories' })
  async getAllVehicleCategories() {
    return await this.vehicleCategoryService.list();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a vehicle category by id' })
  @ApiParam({
    name: 'id',
    description: 'The id of the vehicle category',
    example: '67873bb9cf95c847fe62ba5f',
  })
  async getVehicleCategoryById(@Param('id') id: string) {
    return await this.vehicleCategoryService.getById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a vehicle category' })
  @ApiBody({
    type: CreateVehicleCategoryDto,
    description: 'Create a vehicle category',
    examples: {
      'Create a vehicle category': {
        value: {
          name: 'Xe điện 4 chỗ',
          description: 'Danh mục xe điện 4 chỗ',
          numberOfSeat: 4,
        },
      },
    },
  })
  async createVehicleCategory(
    @Body(new JoiValidationPipe(VehicleCategoryValidation.create))
    createDto: ICreateVehicleCategoryDto,
  ) {
    return await this.vehicleCategoryService.insert(createDto);
  }

  @Put(':id')
  @HttpCode(201)
  @ApiOperation({ summary: 'Update a vehicle category' })
  @ApiParam({
    name: 'id',
    description: 'The id of the vehicle category',
    example: '67873bb9cf95c847fe62ba5f',
  })
  @ApiBody({
    type: UpdateVehicleCategoryDto,
    description: 'Update a vehicle category',
    examples: {
      'Update a vehicle category': {
        value: {
          name: 'Xe điện 4 chỗ',
          description: 'Danh mục xe điện 4 chỗ',
          numberOfSeat: 4,
        },
      },
    },
  })
  async updateVehicleCategory(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(VehicleCategoryValidation.update))
    updateDto: IUpdateVehicleCategoryDto,
  ) {
    return await this.vehicleCategoryService.update(id, updateDto);
  }
}
