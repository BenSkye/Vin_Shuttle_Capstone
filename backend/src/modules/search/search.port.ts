export interface ISearchService {
    findAvailableVehicleBookingHour(date: string, startTime: string, durationMinutes: number): Promise<object>
    findAvailableVehicleBookingScenicRoute(scenicRouteId: string, date: string, startTime: string): Promise<object>
    findAvailableVehicleBookingDestination(startPoint: object, endPoint: object, estimatedDuration: number, estimatedDistance: number): Promise<object>
}