import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put } from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { VehicleValidation } from 'src/modules/vehicles/validations/vehicle.validation';
import { VEHICLE_SERVICE } from 'src/modules/vehicles/vehicles.di-token';
import { ICreateVehicle, IUpdateVehicle, IVehiclesService } from 'src/modules/vehicles/vehicles.port';

@Controller('vehicles')
export class VehiclesController {
    constructor(
        @Inject(VEHICLE_SERVICE)
        private readonly vehicalService: IVehiclesService
    ) { }

    @Get()
    @HttpCode(200)
    async getAllVehicleCategories() {
        return await this.vehicalService.list();
    }

    @Get(':id')
    @HttpCode(200)
    async getVehicleCategoryById(@Param('id') id: string) {
        return await this.vehicalService.getById(id);
    }

    @Post()
    @HttpCode(201)
    async createVehicleCategory(
        @Body(new JoiValidationPipe(VehicleValidation.create)) createDto: ICreateVehicle
    ) {
        return await this.vehicalService.insert(createDto);
    }

    @Put(':id')
    @HttpCode(200)
    async updateVehicleCategory(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(VehicleValidation.update)) updateDto: IUpdateVehicle
    ) {
        return await this.vehicalService.update(id, updateDto);
    }
}
