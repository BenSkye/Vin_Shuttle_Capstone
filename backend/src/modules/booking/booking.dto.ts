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
    vehicleCategories: { categoryVehicleId: string; quantity: number }[],
    paymentMethod: PaymentMethod
}