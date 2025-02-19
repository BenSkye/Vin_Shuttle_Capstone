import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { IBookingService } from "src/modules/booking/booking.port";
import { DRIVERSCHEDULE_REPOSITORY } from "src/modules/driver-schedule/driver-schedule.di-token";
import { IDriverScheduleRepository } from "src/modules/driver-schedule/driver-schedule.port";
import { DriverScheduleDocument } from "src/modules/driver-schedule/driver-schedule.schema";
import { PRICING_SERVICE } from "src/modules/pricing/pricing.di-token";
import { IPricingService } from "src/modules/pricing/pricing.port";
import { TRIP_REPOSITORY } from "src/modules/trip/trip.di-token";
import { ITripRepository } from "src/modules/trip/trip.port";
import { VEHICLE_CATEGORY_REPOSITORY } from "src/modules/vehicle-categories/vehicle-category.di-token";
import { IVehicleCategoryRepository } from "src/modules/vehicle-categories/vehicle-category.port";
import { VEHICLE_REPOSITORY } from "src/modules/vehicles/vehicles.di-token";
import { IVehiclesRepository } from "src/modules/vehicles/vehicles.port";
import { Vehicle, VehicleDocument } from "src/modules/vehicles/vehicles.schema";
import { ServiceType, Shift, ShiftHours } from "src/share/enums";
import { DateUtils } from "src/share/utils";


@Injectable()
export class BookingService implements IBookingService {
    constructor(
        @Inject(DRIVERSCHEDULE_REPOSITORY)
        private readonly driverScheduleRepository: IDriverScheduleRepository,
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository,
        @Inject(VEHICLE_REPOSITORY)
        private readonly vehicleRepository: IVehiclesRepository,
        @Inject(VEHICLE_CATEGORY_REPOSITORY)
        private readonly vehicleCategoryRepository: IVehicleCategoryRepository,
        @Inject(PRICING_SERVICE)
        private readonly pricingService: IPricingService
    ) { }

    async findAvailableVehicleBookingHour(
        date: string,
        startTime: string,
        durationMinutes: number
    ): Promise<object> {

        const scheduleDate = DateUtils.parseDate(date);
        const bookingStartTime = DateUtils.parseDate(date, startTime);
        const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');


        //check if it is within the start and end of working time
        await this.validateBookingTime(bookingStartTime, bookingEndTime)

        //check if it in any Shift of system.
        const matchingShifts = await this.getMatchingShifts(bookingStartTime, bookingEndTime)

        console.log('matchingShifts', matchingShifts)
        console.log('date', date)
        console.log('scheduleDate', scheduleDate.utc().format('YYYY-MM-DD'))

        //check available schedule in DB
        const schedules = await this.getAvailableSchedules(
            scheduleDate.toDate(),
            matchingShifts
        );

        //check not conflict time with Trip in that uniqueSchedules 
        const validSchedules = await this.filterSchedulesWithoutConflicts(
            schedules,
            bookingStartTime,
            bookingEndTime
        );


        const vehicles = await this.getVehiclesFromSchedules(validSchedules);
        const result = await this.groupByVehicleType(vehicles, ServiceType.BOOKING_HOUR, durationMinutes)
        return result
    }

    private async validateBookingTime(
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Promise<void> {
        const shiftHoursStart = ShiftHours[Shift.A].start;
        const shiftHourEnd = ShiftHours[Shift.D].end;
        const expectedStartTime = bookingStartTime.startOf('day').add(shiftHoursStart, 'hour');
        const expectedEndTime = bookingStartTime.startOf('day').add(shiftHourEnd, 'hour');

        if (
            (bookingStartTime.isBefore(expectedStartTime) || bookingStartTime.isAfter(expectedEndTime)) ||
            (bookingEndTime.isAfter(expectedEndTime) || bookingEndTime.isBefore(expectedStartTime))
        ) {
            throw new HttpException(
                { message: 'Booking time is not within working hours' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    private getMatchingShifts(
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Shift[] {
        const matchingShifts = Object.values(Shift).filter(shift => {
            const shiftStart = bookingStartTime
                .startOf('day')
                .add(ShiftHours[shift].start, 'hour');
            const shiftEnd = bookingStartTime
                .startOf('day')
                .add(ShiftHours[shift].end, 'hour');

            return (
                bookingStartTime.isAfter(shiftStart) || bookingStartTime.isSame(shiftStart) &&
                bookingEndTime.isBefore(shiftEnd) || bookingEndTime.isSame(shiftEnd)
            );
        });
        if (matchingShifts.length == 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Booking time is not match any shift`
            }, HttpStatus.BAD_REQUEST);
        }
        return matchingShifts
    }

    private async getAvailableSchedules(
        date: Date,
        shifts: Shift[]
    ): Promise<DriverScheduleDocument[]> {
        console.log('date', date.toISOString())
        const schedulePromises = shifts.map(shift =>
            this.driverScheduleRepository.getDriverSchedules({
                date: date.toISOString(),
                shift: shift,
            }, [])
        );

        const scheduleResults = await Promise.all(schedulePromises);
        const uniqueSchedules = scheduleResults
            .flat()
            .filter((schedule, index, self) =>
                index === self.findIndex(s => s._id === schedule._id)
            );

        if (uniqueSchedules.length == 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `No more Schedule valid`
            }, HttpStatus.BAD_REQUEST);
        }

        return uniqueSchedules
    }

    private async filterSchedulesWithoutConflicts(
        schedules: DriverScheduleDocument[],
        bookingStartTime: dayjs.Dayjs,
        bookingEndTime: dayjs.Dayjs
    ): Promise<DriverScheduleDocument[]> {
        const tripPromise = schedules.map(schedule =>
            this.tripRepository.find({
                scheduleId: schedule._id
            }, [])
        );

        const tripsResult = await Promise.all(tripPromise)

        const uniqueTrips = tripsResult
            .flat()
            .filter((trip, index, self) =>
                index === self.findIndex(s => s._id === trip._id)
            );

        for (const trip of uniqueTrips) {
            const startTimeTrip = DateUtils.fromDate(trip.timeStartEstimate)
            const endTimeTrip = DateUtils.fromDate(trip.timeEndEstimate)

            if (
                (startTimeTrip.isAfter(bookingStartTime) && startTimeTrip.isBefore(bookingEndTime)) ||
                (endTimeTrip.isAfter(bookingStartTime) && endTimeTrip.isBefore(bookingEndTime))
            ) {
                schedules.filter(schedule => schedule._id === trip.scheduleId)
            }
        }

        if (schedules.length == 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `No more Schedule valid`
            }, HttpStatus.BAD_REQUEST);
        }
        return schedules
    }

    private async getVehiclesFromSchedules(
        schedules: DriverScheduleDocument[]
    ): Promise<VehicleDocument[]> {
        const vehiclePromise = schedules.map(schedule =>
            this.vehicleRepository.getById(schedule.vehicle._id.toString())
        );

        const vehicles = await Promise.all(vehiclePromise);
        return vehicles.filter((v, i, self) =>
            i === self.findIndex(s => s._id === v._id)
        );
    }

    private async groupByVehicleType(
        vehicles: Vehicle[],
        serviceType: string,
        totalUnit: number
    ): Promise<any[]> {
        const categoryCounts = new Map<string, number>();
        const categoryPromises = vehicles.map(vehicle =>
            this.vehicleCategoryRepository.getById(vehicle.categoryId.toString())
        );

        const categories = await Promise.all(categoryPromises);

        for (const category of categories) {
            const currentCount = categoryCounts.get(category._id.toString()) || 0;
            categoryCounts.set(category._id.toString(), currentCount + 1);
        }

        // Lấy thông tin đầy đủ cho mỗi category
        const uniqueCategoryIds = Array.from(categoryCounts.keys());
        const uniqueCategories = await Promise.all(
            uniqueCategoryIds.map(id =>
                this.vehicleCategoryRepository.getById(id)
            )
        );

        //tính giá
        const pricingPromises = uniqueCategories.map(async (category) => {
            const price = await this.pricingService.calculatePrice(
                serviceType,
                category._id,
                totalUnit
            );
            return { category, price };
        });
        const pricedCategories = await Promise.all(pricingPromises);

        return pricedCategories.map(({ category, price }) => ({
            vehicleType: category,
            availableCount: categoryCounts.get(category._id.toString()) || 0,
            price: price
        }));
    }

}