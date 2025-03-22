import { BookingStatus } from "@/constants/booking.constants";

// Interface cho response API tìm xe

export interface Position {
    lat: number;
    lng: number;
};
export interface AvailableVehicle {
    vehicleCategory: VehicleCategory;
    availableCount: number;
    price: number;
}
export interface VehicleCategory {
    _id: string;
    name: string;
    description: string;
    numberOfSeat: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
// Interface cho request booking
export interface BookingHourRequest {
    startPoint: {
        position: {
            lat: number;
            lng: number;
        };
        address: string;
    };
    date: string;
    startTime: string;
    durationMinutes: number;
    vehicleCategories: {
        name: string;
        categoryVehicleId: string;
        quantity: number;

    }[];
    paymentMethod: 'pay_os' | 'cash' | 'momo'; // Các phương thức thanh toán hỗ trợ
}
// Interface cho response booking when checkout
export interface BookingResponse {
    newBooking: {
        _id: string;
        bookingCode: number;
        totalAmount: number;
        trips: string[];
        paymentMethod?: string;
        status?: string;
        createdAt: string;
    };
    paymentUrl: string;
}

//Interface for booking
export interface IBooking {
    _id: string,
    bookingCode: number,
    trips: [string],
    status: BookingStatus,
    totalAmount: number,
    statusHistory: Array<{
        status: BookingStatus;
        changedAt: Date;
        reason?: string;
    }>;
    createdAt: string;
}

// Interface for booking destination request
export interface BookingDestinationRequest {
    startPoint: {
        position: {
            lat: number;
            lng: number;
        };
        address: string;
    };
    endPoint: {
        position: {
            lat: number;
            lng: number;
        };
        address: string;
    };
    estimatedDuration: number;
    distanceEstimate: number;
    vehicleCategories: {
        categoryVehicleId: string;
        name: string;
    };
    paymentMethod: string;
}


export interface BookingRouteRequest {
    startPoint: {
        position: {
            lat: number;
            lng: number;
        };
        address: string;
    };
    scenicRouteId: string;
    date: string;
    startTime: string;
    vehicleCategories: {
        categoryVehicleId: string;
        name: string;
        quantity: number;
    }[];
    paymentMethod: 'pay_os' | 'cash' | 'momo';
}