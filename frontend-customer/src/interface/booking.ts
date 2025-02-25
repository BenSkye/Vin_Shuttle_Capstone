
// Interface cho response API tìm xe
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
        categoryVehicleId: string;
        quantity: number;
    }[];
    paymentMethod: 'pay_os' | 'cash' | 'momo'; // Các phương thức thanh toán hỗ trợ
}

// Interface cho response booking
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


