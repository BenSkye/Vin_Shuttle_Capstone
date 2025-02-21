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