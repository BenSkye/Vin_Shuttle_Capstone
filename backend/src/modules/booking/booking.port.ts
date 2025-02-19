export interface IBookingService {
    findAvailableVehicleBookingHour(date: string, startTime: string, durationMinutes: number): Promise<object>
}