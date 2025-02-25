import { PaymentMethod } from "src/share/enums/payment.enum"
import { Position, StartPoint } from "src/share/interface"

export interface ICreateBooking {
    bookingCode: number
    customerId: string
    trips: string[]
    totalAmount: number
    paymentMethod: string
}

export interface IUpdateBooking {
    bookingCode?: string
    customerId?: string
    trips?: string[]
    totalAmount?: number
    paymentMethod?: string
    InvoiceId?: string
    cancellationTime?: string
    cancellationReason?: string,
    statusHistory?: object
}

export interface IBookingHourBody {
    startPoint: StartPoint,
    date: string,
    startTime: string,
    durationMinutes: number,
    vehicleCategories: { categoryVehicleId: string; name: string, quantity: number }[],
    paymentMethod: PaymentMethod
}

export interface IBookingScenicRouteBody {
    startPoint: StartPoint,
    scenicRouteId: string,
    date: string,
    startTime: string,
    vehicleCategories: { categoryVehicleId: string; name: string, quantity: number }[],
    paymentMethod: PaymentMethod
}
export interface IBookingDestinationBody {
    startPoint: StartPoint,
    endPoint: StartPoint;
    estimatedDuration: number
    distanceEstimate: number;
    vehicleCategories: { categoryVehicleId: string, name: string },
    paymentMethod: PaymentMethod
}