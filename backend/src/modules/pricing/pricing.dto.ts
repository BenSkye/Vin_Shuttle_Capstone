import { ServiceType } from "src/share/enums";

// DTO cho Service Config
export interface ICreateServiceConfigDto {
    service_type: ServiceType;
    base_unit: number;
    base_unit_type: string;
}

// DTO cho Vehicle Pricing
export interface ICreateVehiclePricingDto {
    vehicle_category: string;
    service_config: string;
    tiered_pricing: Array<{
        range: number;
        price: number;
    }>;
}