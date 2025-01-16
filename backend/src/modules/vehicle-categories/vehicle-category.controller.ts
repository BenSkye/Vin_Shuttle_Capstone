import { Body, Controller, Get, Inject, Param, Post, Put, HttpCode } from "@nestjs/common";
import { VEHICLE_CATEGORY_SERVICE } from "./vehicle-category.di-token";
import {
    ICreateVehicleCategoryDto,
    IUpdateVehicleCategoryDto,
    IVehicleCategoryService
} from "./vehicle-category.port";

@Controller('vehicle-categories')
export class VehicleCategoryController {
    constructor(
        @Inject(VEHICLE_CATEGORY_SERVICE)
        private readonly vehicleCategoryService: IVehicleCategoryService
    ) { }

    @Get()
    @HttpCode(200)
    async getAllVehicleCategories() {
        return await this.vehicleCategoryService.list();
    }

    @Get(':id')
    @HttpCode(200)
    async getVehicleCategoryById(@Param('id') id: string) {
        return await this.vehicleCategoryService.getById(id);
    }

    @Post()
    @HttpCode(201)
    async createVehicleCategory(
        @Body() createDto: ICreateVehicleCategoryDto
    ) {
        return await this.vehicleCategoryService.insert(createDto);
    }

    @Put(':id')
    @HttpCode(200)
    async updateVehicleCategory(
        @Param('id') id: string,
        @Body() updateDto: IUpdateVehicleCategoryDto
    ) {
        return await this.vehicleCategoryService.update(id, updateDto);
    }
}