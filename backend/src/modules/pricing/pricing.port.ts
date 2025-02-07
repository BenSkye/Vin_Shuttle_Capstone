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
    update(serviceType: string, config: IUpdateServiceConfigDto): Promise<ServiceConfigDocument>;
}

export interface IVehiclePricingRepository {
    create(pricing: ICreateVehiclePricingDto): Promise<VehiclePricingDocument>;
    findVehiclePricing(query: any): Promise<VehiclePricingDocument>;
    findByVehicleCategory(vehicleId: string): Promise<VehiclePricingDocument>;
    findAll(): Promise<VehiclePricingDocument[]>;
    update(pricing: IUpdateVehiclePricingDto): Promise<VehiclePricingDocument>;
}

export interface IPricingService {
    createServiceConfig(config: ICreateServiceConfigDto): Promise<any>;
    createVehiclePricing(pricing: ICreateVehiclePricingDto): Promise<any>;
    calculatePrice(serviceType: string, vehicleId: string, units: number): Promise<number>;
    testPrice(base_unit: string, vehicleId: string, units: number): Promise<{
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
