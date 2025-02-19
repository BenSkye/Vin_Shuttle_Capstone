import { ServiceConfigDocument } from "src/modules/pricing/pricing.config.schema";
import {
    ICreateServiceConfigDto,
    ICreateVehiclePricingDto,
    IUpdateServiceConfigDto,
    IUpdateVehiclePricingDto
} from "./pricing.dto";
import { VehiclePricingDocument } from "src/modules/pricing/pricing.vehicle.schema";

export interface IPricingConfigRepository {
    create(config: ICreateServiceConfigDto): Promise<ServiceConfigDocument>;
    findByServiceType(serviceType: string): Promise<ServiceConfigDocument>;
    findAll(): Promise<ServiceConfigDocument[]>;
    findById(id: string): Promise<ServiceConfigDocument>;
    update(serviceType: string, config: IUpdateServiceConfigDto): Promise<ServiceConfigDocument>;
}

export interface IVehiclePricingRepository {
    create(pricing: ICreateVehiclePricingDto): Promise<VehiclePricingDocument>;
    findVehiclePricing(query: any): Promise<VehiclePricingDocument>;
    findByVehicleCategory(vehicleCategoryId: string): Promise<VehiclePricingDocument>;
    findAll(): Promise<VehiclePricingDocument[]>;
    update(pricing: IUpdateVehiclePricingDto): Promise<VehiclePricingDocument>;
}

export interface IPricingService {
    createServiceConfig(config: ICreateServiceConfigDto): Promise<any>;
    createVehiclePricing(pricing: ICreateVehiclePricingDto): Promise<any>;
    calculatePrice(serviceType: string, vehicleCategoryId: string, units: number): Promise<number>;
    testPrice(base_unit: number, tiered_pricing: Array<any>, total_units: number): Promise<{
        totalPrice: number;
        calculations: string[];
    }>;
    getServiceConfig(serviceType: string): Promise<ServiceConfigDocument>;
    getVehiclePricing(vehicleId: string): Promise<VehiclePricingDocument>;
    getAllServiceConfigs(): Promise<ServiceConfigDocument[]>;
    getAllVehiclePricings(): Promise<VehiclePricingDocument[]>;
    updateServiceConfig(serviceType: string, config: IUpdateServiceConfigDto): Promise<any>;
    updateVehiclePricing(pricing: IUpdateVehiclePricingDto): Promise<any>;
}
