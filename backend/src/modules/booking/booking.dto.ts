import { PaymentMethod } from "src/share/enums/payment.enum"
import { Position } from "src/share/interface"

export interface ICreateBooking {
    customerId: string
    trips: string[]
    totalAmount: number
    paymentMethod: string
}

export interface IUpdateBooking {
    customerId?: string
    trips?: string[]
    totalAmount?: number
    paymentMethod?: string
    InvoiceId?: string
    cancellationTime?: string
    cancellationReason?: string
}

export interface IBookingHourBody {
    startPoint: Position,
    date: string,
    startTime: string,
    durationMinutes: number,
    vehicleCategories: { categoryVehicleId: string; name: string, quantity: number }[],
    paymentMethod: PaymentMethod
}

export interface IBookingScenicRouteBody {
    startPoint: Position,
    scenicRouteId: string,
    date: string,
    startTime: string,
    vehicleCategories: { categoryVehicleId: string; name: string, quantity: number }[],
    paymentMethod: PaymentMethod
}
export interface IBookingDestinationBody {
    startPoint: Position,
    endPoint: Position;
    estimatedDuration: number
    distanceEstimate: number;
    vehicleCategories: { categoryVehicleId: string, name: string },
    paymentMethod: PaymentMethod
}