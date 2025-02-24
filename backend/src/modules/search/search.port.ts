import dayjs from "dayjs";
import { DriverScheduleDocument } from "src/modules/driver-schedule/driver-schedule.schema";
import { Vehicle, VehicleDocument } from "src/modules/vehicles/vehicles.schema";
import { DriverSchedulesStatus, Shift } from "src/share/enums";

export interface ISearchService {
    findAvailableVehicleBookingHour(date: string, startTime: string, durationMinutes: number): Promise<any[]>
    findAvailableVehicleBookingScenicRoute(scenicRouteId: string, date: string, startTime: string): Promise<any[]>
    findAvailableVehicleBookingDestination(startPoint: object, endPoint: object, estimatedDuration: number, estimatedDistance: number): Promise<any[]>


    validateBookingTime(
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Promise<void>

    getMatchingShifts(
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Shift[]

    getAvailableSchedules(
        date: Date,
        shifts: Shift[],
        status?: DriverSchedulesStatus
    ): Promise<DriverScheduleDocument[]>

    filterSchedulesWithoutConflicts(
        schedules: DriverScheduleDocument[],
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Promise<DriverScheduleDocument[]>

    getVehiclesFromSchedules(
        schedules: DriverScheduleDocument[]
    ): Promise<VehicleDocument[]>

    groupByVehicleType(
        vehicles: Vehicle[],
        serviceType: string,
        totalUnit: number
    ): Promise<any[]>
}