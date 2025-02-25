import { ServiceType } from 'src/share/enums';

// DTO cho Service Config
export interface ICreateServiceConfigDto {
  service_type: ServiceType;
  base_unit: number;
  base_unit_type: string;
}

export interface IUpdateServiceConfigDto {
  base_unit: number;
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

export interface IUpdateVehiclePricingDto {
  vehicle_category: string;
  service_config: string;
  tiered_pricing: Array<{
    range: number;
    price: number;
  }>;
}

export interface ITestPriceDto {
  base_unit: number;
  tiered_pricing: Array<{
    range: number;
    price: number;
  }>;
  total_units: number;
}
