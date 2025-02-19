export interface IBookingService {
    findAvailableVehicleBookingHour(date: string, startTime: string, durationMinutes: number): Promise<object>
    findAvailableVehicleBookingScenicRoute(scenicRouteId: string, date: string, startTime: string): Promise<object>
}