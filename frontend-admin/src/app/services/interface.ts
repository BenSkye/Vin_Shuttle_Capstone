export interface TieredPrice {
    _id?: string;
    range: number;
    price: number;
  }
  
  export interface PriceManagement {
    _id: string;
    vehicle_category: string;
    service_config: string;
    tiered_pricing: TieredPrice[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PricingConfig {
    _id: string;
    service_type: string;
    base_unit: number;
    base_unit_type: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UpdatePricingRequest {
    vehicle_category: string;
    service_config: string;
    tiered_pricing: TieredPrice[];
  }
  
  export interface UpdateServiceConfigRequest {
    base_unit: number;
    base_unit_type: string;
  }