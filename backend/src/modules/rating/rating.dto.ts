import { ServiceType } from "src/share/enums"

export interface ICreateRating {
    tripId: string
    customerId?: string
    rate: number
    feedback?: string
}

export interface IUpdateRating {
    tripId?: string
    customerId?: string
    rate?: number
    feedback?: string
}

export interface IGetAverageRating {
    driverId?: string,
    customerId?: string,
    serviceType: ServiceType
}