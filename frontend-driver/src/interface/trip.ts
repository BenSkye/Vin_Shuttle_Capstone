
export interface Position {
    lat: number;
    lng: number;
}

export interface Trip {
    _id: string;
    driverId: {
        _id: string,
        name: string
    },
    customerId: {
        _id: string,
        name: string
    }
    vehicleId: {
        _id: string,
        name: string,
        licensePlate: string
    },
    amount: number,
    status: string,
    statusHistory: object[],
    serviceType: string;
    servicePayload: BookingHourPayloadDto | BookingScenicRoutePayloadDto | BookingDestinationPayloadDto | BookingSharePayloadDto;
}

export interface BookingHourPayloadDto {
    bookingHour: {
        totalTime: number;
        startPoint: {
            position: {
                lat: number;
                lng: number;
            };
            address: string;
        };
    }
}

export interface BookingScenicRoutePayloadDto {
    bookingScenicRoute: {
        routeId: string;
        startPoint: {
            position: {
                lat: number;
                lng: number;
            };
            address: string;
        };
        distanceEstimate: number;
        distance: number
    }
}

export interface BookingDestinationPayloadDto {
    bookingDestination: {
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
        distanceEstimate: number;
        distance: number
    }
}

export interface BookingSharePayloadDto {
    bookingShare: {
        numberOfSeat: number;
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
        distanceEstimate: number;
        distance: number
    }
}