import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { DRIVERSCHEDULE_REPOSITORY } from 'src/modules/driver-schedule/driver-schedule.di-token';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import { DriverScheduleDocument } from 'src/modules/driver-schedule/driver-schedule.schema';
import { PRICING_SERVICE } from 'src/modules/pricing/pricing.di-token';
import { IPricingService } from 'src/modules/pricing/pricing.port';
import { SCENIC_ROUTE_REPOSITORY } from 'src/modules/scenic-route/scenic-route.di-token';
import { IScenicRouteRepository } from 'src/modules/scenic-route/scenic-route.port';
import { ISearchService } from 'src/modules/search/search.port';
import { TRIP_REPOSITORY } from 'src/modules/trip/trip.di-token';
import { ITripRepository } from 'src/modules/trip/trip.port';
import { VEHICLE_CATEGORY_REPOSITORY } from 'src/modules/vehicle-categories/vehicle-category.di-token';
import { IVehicleCategoryRepository } from 'src/modules/vehicle-categories/vehicle-category.port';
import { VehicleCategoryDocument } from 'src/modules/vehicle-categories/vehicle-category.schema';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesRepository } from 'src/modules/vehicles/vehicles.port';
import { VehicleDocument } from 'src/modules/vehicles/vehicles.schema';
import {
  BOOKING_BUFFER_MINUTES,
  DriverSchedulesStatus,
  DriverScheduleTaskType,
  GUARANTEED_TIME_BETWEEN_TRIPS,
  ServiceType,
  Shift,
  ShiftHours,
  TripStatus,
} from 'src/share/enums';
import { DateUtils } from 'src/share/utils';

@Injectable()
export class SearchService implements ISearchService {
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
    private readonly pricingService: IPricingService,
    @Inject(SCENIC_ROUTE_REPOSITORY)
    private readonly scenicRouteRepository: IScenicRouteRepository,
  ) { }

  async findAvailableVehicleBookingHour(
    date: string,
    startTime: string,
    durationMinutes: number,
  ): Promise<any[]> {
    const scheduleDate = DateUtils.parseDate(date);
    const bookingStartTime = DateUtils.parseDate(date, startTime);
    const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');
    console.log(' bookingStartTime', bookingStartTime.toDate());
    const now = dayjs();
    console.log('now', now.toDate());
    const minAllowedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
    console.log('minAllowedTime', minAllowedTime.toDate());
    if (bookingStartTime.isBefore(minAllowedTime)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Booking time must be at least ${BOOKING_BUFFER_MINUTES} minutes from now`,
          vnMessage: `Thời gian đặt phải cách hiện tại ít nhất ${BOOKING_BUFFER_MINUTES} phút`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //check if it is within the start and end of working time
    await this.validateBookingTime(bookingStartTime, bookingEndTime);

    //check if it in any Shift of system.
    const matchingShifts = await this.getMatchingShifts(bookingStartTime, bookingEndTime);

    console.log('matchingShifts', matchingShifts);
    console.log('date', date);
    console.log('scheduleDate', scheduleDate.toDate());

    //check available schedule in DB
    let schedules = await this.getAvailableSchedules(scheduleDate.toDate(), matchingShifts);
    if (scheduleDate.isSame(now, 'day')) {
      const currentHour = now.hour();
      console.log('currentHour', currentHour);
      schedules = schedules.filter(schedule => {
        const shift = schedule.shift as Shift;
        const shiftStartHour = ShiftHours[shift].start;

        // If current time is after shift start, only include IN_PROGRESS schedules
        // Otherwise, include all schedules for shifts that haven't started yet
        if (currentHour >= shiftStartHour) {
          return schedule.status === DriverSchedulesStatus.IN_PROGRESS;
        }
        return true;
      });
    }

    //check not conflict time with Trip in that uniqueSchedules
    const validSchedules = await this.filterSchedulesWithoutConflicts(
      schedules,
      bookingStartTime,
      bookingEndTime,
    );

    const vehicles = await this.getVehiclesFromSchedules(validSchedules);
    const result = await this.groupByVehicleType(
      vehicles,
      ServiceType.BOOKING_HOUR,
      durationMinutes,
    );
    return result;
  }

  async findAvailableVehicleBookingScenicRoute(
    scenicRouteId: string,
    date: string,
    startTime: string,
  ): Promise<any[]> {
    const bookingStartTime = DateUtils.parseDate(date, startTime);

    const now = dayjs();
    const minAllowedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
    if (bookingStartTime.isBefore(minAllowedTime)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Booking time must be at least ${BOOKING_BUFFER_MINUTES} minutes from now`,
          vnMessage: `Thời gian đặt phải cách hiện tại ít nhất ${BOOKING_BUFFER_MINUTES} phút`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const scenicRoute = await this.scenicRouteRepository.findById(scenicRouteId);
    if (!scenicRoute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Scenic Route not found`,
          vnMessage: 'Không tìm thấy tuyến đường ngăm cảnh',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const durationMinutes = scenicRoute.estimatedDuration;
    const scheduleDate = DateUtils.parseDate(date);
    const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');
    const totalDistance = scenicRoute.totalDistance;
    console.log('totalDistance', totalDistance);

    //check if it is within the start and end of working time
    await this.validateBookingTime(bookingStartTime, bookingEndTime);

    //check if it in any Shift of system.
    const matchingShifts = await this.getMatchingShifts(bookingStartTime, bookingEndTime);

    //check available schedule in DB
    let schedules = await this.getAvailableSchedules(scheduleDate.toDate(), matchingShifts);

    if (scheduleDate.isSame(now, 'day')) {
      const currentHour = now.hour();
      console.log('currentHour', currentHour);
      schedules = schedules.filter(schedule => {
        const shift = schedule.shift as Shift;
        const shiftStartHour = ShiftHours[shift].start;

        // If current time is after shift start, only include IN_PROGRESS schedules
        // Otherwise, include all schedules for shifts that haven't started yet
        if (currentHour >= shiftStartHour) {
          return schedule.status === DriverSchedulesStatus.IN_PROGRESS;
        }
        return true;
      });
    }

    //check not conflict time with Trip in that uniqueSchedules
    const validSchedules = await this.filterSchedulesWithoutConflicts(
      schedules,
      bookingStartTime,
      bookingEndTime,
    );

    const vehicles = await this.getVehiclesFromSchedules(validSchedules);
    const result = await this.groupByVehicleType(
      vehicles,
      ServiceType.BOOKING_SCENIC_ROUTE,
      totalDistance,
    );
    return result;
  }

  async findAvailableVehicleBookingDestination(
    startPoint: object,
    endPoint: object,
    estimatedDuration: number,
    estimatedDistance: number,
  ): Promise<any[]> {
    //start time is current time
    const now = dayjs();
    const bookingStartTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
    const bookingEndTime = bookingStartTime.add(estimatedDuration, 'minute');

    await this.validateBookingTime(bookingStartTime, bookingEndTime);
    console.log('bookingStartTime', bookingStartTime.toDate());
    const matchingShifts = this.getMatchingShifts(bookingStartTime, bookingEndTime);
    const midnightUTC = now.startOf('day');
    console.log('midnightUTC', midnightUTC.toISOString());
    const schedules = await this.getAvailableSchedules(
      midnightUTC.toDate(),
      matchingShifts,
      DriverSchedulesStatus.IN_PROGRESS,
    );

    console.log('schedules', schedules);

    const validSchedules = await this.filterSchedulesWithoutConflicts(
      schedules,
      bookingStartTime,
      bookingEndTime,
    );

    const vehicles = await this.getVehiclesFromSchedules(validSchedules);
    return this.groupByVehicleType(vehicles, ServiceType.BOOKING_DESTINATION, estimatedDistance);
  }

  async validateBookingTime(
    bookingStartTime: dayjs.Dayjs,
    bookingEndTime: dayjs.Dayjs,
  ): Promise<void> {
    const shiftHoursStart = ShiftHours[Shift.A].start;
    const shiftHourEnd = ShiftHours[Shift.D].end;
    const expectedStartTime = bookingStartTime.startOf('day').add(shiftHoursStart, 'hour');
    console.log('expectedStartTime', expectedStartTime.toDate());
    const expectedEndTime = bookingStartTime.startOf('day').add(shiftHourEnd, 'hour');

    if (
      bookingStartTime.isBefore(expectedStartTime) ||
      bookingStartTime.isAfter(expectedEndTime) ||
      bookingEndTime.isAfter(expectedEndTime) ||
      bookingEndTime.isBefore(expectedStartTime)
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Booking time is not within working hours`,
          vnMessage: 'Thời gian đặt xe không nằm trong thời gian hoạt động',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getMatchingShifts(bookingStartTime: dayjs.Dayjs, bookingEndTime: dayjs.Dayjs): Shift[] {
    console.log('bookingStartTime', bookingStartTime.toDate());
    console.log('bookingEndTime', bookingEndTime.toDate());
    const matchingShifts = Object.values(Shift).filter(shift => {
      const shiftStart = bookingStartTime.startOf('day').add(ShiftHours[shift].start, 'hour');
      const shiftEnd = bookingStartTime.startOf('day').add(ShiftHours[shift].end, 'hour');

      return (
        (bookingStartTime.isAfter(shiftStart) || bookingStartTime.isSame(shiftStart)) &&
        (bookingEndTime.isBefore(shiftEnd) || bookingEndTime.isSame(shiftEnd))
      );
    });
    if (matchingShifts.length == 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Booking time is not match any shift`,
          vnMessage: 'Không có ca phù hợp',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return matchingShifts;
  }

  async getAvailableSchedules(
    date: Date,
    shifts: Shift[],
    status?: DriverSchedulesStatus,
  ): Promise<DriverScheduleDocument[]> {
    console.log('date before', date);
    console.log('date', DateUtils.toUTCDate(date).toDate());

    let schedulePromises: Promise<DriverScheduleDocument[]>[];
    if (status) {
      schedulePromises = shifts.map(shift =>
        this.driverScheduleRepository.getDriverSchedules(
          {
            date: DateUtils.toUTCDate(date).toDate(),
            shift: shift,
            status: status,
            taskType: DriverScheduleTaskType.GENERAL,
          },
          [],
        ),
      );
    } else {
      schedulePromises = shifts.map(shift =>
        this.driverScheduleRepository.getDriverSchedules(
          {
            date: DateUtils.toUTCDate(date).toDate(),
            shift: shift,
            status: {
              $nin: [
                DriverSchedulesStatus.COMPLETED,
                DriverSchedulesStatus.CANCELED,
                DriverSchedulesStatus.DROPPED_OFF,
                // DriverSchedulesStatus.IS_PAUSED,
              ]
            },
          },
          [],
        ),
      );
    }

    const scheduleResults = await Promise.all(schedulePromises);
    const uniqueSchedules = scheduleResults
      .flat()
      .filter((schedule, index, self) => index === self.findIndex(s => s._id === schedule._id));

    console.log('uniqueSchedules', uniqueSchedules);

    if (uniqueSchedules.length == 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `No more Schedule valid for shift ${shifts.join(', ')} in date ${date}`,
          vnMessage:
            'Không còn lịch phục vụ vào thời gian này',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return uniqueSchedules;
  }

  async filterSchedulesWithoutConflicts(
    schedules: DriverScheduleDocument[],
    bookingStartTime: dayjs.Dayjs,
    bookingEndTime: dayjs.Dayjs,
  ): Promise<DriverScheduleDocument[]> {
    const tripPromise = schedules.map(schedule =>
      this.tripRepository.find(
        {
          scheduleId: schedule._id.toString(),
          status: { $nin: [TripStatus.COMPLETED, TripStatus.CANCELLED] },
          $or: [
            {
              timeStartEstimate: {
                $lt: bookingEndTime.add(GUARANTEED_TIME_BETWEEN_TRIPS, 'minute').toDate(),
              },
              timeEndEstimate: {
                $gt: bookingStartTime.subtract(GUARANTEED_TIME_BETWEEN_TRIPS, 'minute').toDate(),
              },
            },
            {
              timeStartEstimate: {
                $lte: bookingStartTime.subtract(GUARANTEED_TIME_BETWEEN_TRIPS, 'minute').toDate(),
              },
              timeEndEstimate: {
                $gte: bookingEndTime.subtract(GUARANTEED_TIME_BETWEEN_TRIPS, 'minute').toDate(),
              },
            },
          ],
        },
        [],
      ),
    );

    const tripsResult = await Promise.all(tripPromise);

    const uniqueTrips = tripsResult
      .flat()
      .filter((trip, index, self) => index === self.findIndex(s => s._id === trip._id));
    console.log('uniqueTrips', uniqueTrips);
    console.log('schedules', schedules);
    for (const trip of uniqueTrips) {
      schedules = schedules.filter(
        schedule => schedule._id.toString() !== trip.scheduleId.toString(),
      );
    }

    if (schedules.length == 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `All schedules are busy ${schedules.join(', ')}`,
          vnMessage: 'Tất cả lịch phục vụ đã bận',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return schedules;
  }

  async getVehiclesFromSchedules(schedules: DriverScheduleDocument[]): Promise<VehicleDocument[]> {
    const vehiclePromise = schedules.map(schedule =>
      this.vehicleRepository.getById(schedule.vehicle._id.toString()),
    );

    const vehicles = await Promise.all(vehiclePromise);
    return vehicles.filter((v, i, self) => i === self.findIndex(s => s._id === v._id));
  }

  async groupByVehicleType(
    vehicles: VehicleDocument[],
    serviceType: string,
    totalUnit: number,
  ): Promise<
    {
      vehicleCategory: VehicleCategoryDocument;
      availableCount: number;
      price: number;
    }[]
  > {
    //lọc các vehicle không có cấu hình giá
    const validVehicles = [];
    console.log('serviceType', serviceType);
    for (const vehicle of vehicles) {
      const checkVehiclePrice = await this.pricingService.checkVehicleCategoryAndServiceType(
        vehicle.categoryId.toString(),
        serviceType,
      );
      if (checkVehiclePrice) {
        validVehicles.push(vehicle);
      }
    }
    vehicles = validVehicles;
    console.log('vehicles', vehicles);
    if (vehicles.length == 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `No more vehicle available for this service`,
          vnMessage: 'Không còn xe phù hợp cho dịch vụ này',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const categoryCounts = new Map<string, number>();
    const categoryPromises = vehicles.map(vehicle =>
      this.vehicleCategoryRepository.getById(vehicle.categoryId.toString()),
    );

    const categories = await Promise.all(categoryPromises);

    for (const category of categories) {
      const currentCount = categoryCounts.get(category._id.toString()) || 0;
      categoryCounts.set(category._id.toString(), currentCount + 1);
    }

    // Lấy thông tin đầy đủ cho mỗi category
    const uniqueCategoryIds = Array.from(categoryCounts.keys());
    const uniqueCategories = await Promise.all(
      uniqueCategoryIds.map(id => this.vehicleCategoryRepository.getById(id)),
    );

    //tính giá
    const pricingPromises = uniqueCategories.map(async category => {
      const price = await this.pricingService.calculatePrice(serviceType, category._id, totalUnit);
      return { category, price };
    });
    const pricedCategories = await Promise.all(pricingPromises);

    return pricedCategories.map(({ category, price }) => ({
      vehicleCategory: category,
      availableCount: categoryCounts.get(category._id.toString()) || 0,
      price: price,
    }));
  }
}
