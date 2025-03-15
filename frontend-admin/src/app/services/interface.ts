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

  export interface Trip {
    _id: string;
    customerId: Customer;
    driverId: Driver;
    timeStart: string;
    timeEnd: string;
    timeStartEstimate: string;
    timeEndEstimate: string;
    vehicleId: Vehicle;
    scheduleId: string;
    serviceType: "booking_hour" | "other_service_type";
    servicePayload: ServicePayload;
    amount: number;
    status: "booking" | "payed" | "pickup" | "in_progress" | "completed";
    tripCoordinates: Array<Coordinates>; // Nếu có dữ liệu, hãy xác định kiểu dữ liệu chính xác
    statusHistory: StatusHistory[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    isRating: boolean;
  }
  
  export interface Customer {
    _id: string;
    name: string;
    phone: string;
    email: string;
  }
  
  export interface Driver {
    _id: string;
    name: string;
    phone: string;
    email: string;
  }
  
  export interface Vehicle {
    _id: string;
    name: string;
    categoryId: string;
    licensePlate: string;
    image: string[];
    operationStatus: "pending" | "active" | "inactive";
    vehicleCondition: "available" | "unavailable";
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface ServicePayload {
    bookingHour: BookingHour;
    _id: string;
  }
  
  export interface BookingHour {
    totalTime: number;
    startPoint: StartPoint;
  }
  
  export interface StartPoint {
    position: Coordinates;
    address: string;
  }
  
  export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export interface StatusHistory {
    status: "booking" | "payed" | "pickup" | "in_progress" | "completed";
    changedAt: string;
    _id: string;
  }