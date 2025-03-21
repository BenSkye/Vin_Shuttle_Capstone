import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DRIVERSCHEDULE_REPOSITORY } from 'src/modules/driver-schedule/driver-schedule.di-token';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import { DriverSchedule } from 'src/modules/driver-schedule/driver-schedule.schema';
import { TRIP_GATEWAY, TRIP_REPOSITORY } from 'src/modules/trip/trip.di-token';
import { BookingBusRoutePayloadDto, ICreateTripDto, tripParams } from 'src/modules/trip/trip.dto';
import { ITripRepository, ITripService } from 'src/modules/trip/trip.port';
import { TripDocument } from 'src/modules/trip/trip.schema';

import { DriverSchedulesStatus, ServiceType, Shift, ShiftHours, TripStatus, UserRole } from 'src/share/enums';

import { BUS_ROUTE_REPOSITORY } from '../bus-route/bus-route.di-token';
import { IBusRouteRepository } from '../bus-route/bus-route.port';
import { TripGateway } from 'src/modules/trip/trip.gateway';
import { REDIS_PROVIDER } from 'src/share/di-token';
import dayjs from 'dayjs';
import { DateUtils } from 'src/share/utils';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import { IUserRepository } from 'src/modules/users/users.port';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesRepository } from 'src/modules/vehicles/vehicles.port';
import { IRedisService } from 'src/share/share.port';
import { SHARE_ROUTE_SERVICE } from 'src/modules/shared-route/shared-route.di-token';
import { ISharedRouteService } from 'src/modules/shared-route/shared-route.port';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TripService implements ITripService {
  constructor(
    @Inject(TRIP_REPOSITORY)
    private readonly tripRepository: ITripRepository,
    @Inject(DRIVERSCHEDULE_REPOSITORY)
    private readonly driverScheduleRepository: IDriverScheduleRepository,
    @Inject(BUS_ROUTE_REPOSITORY)
    private readonly busRouteRepository: IBusRouteRepository,
    @Inject(TRIP_GATEWAY)
    private readonly tripGateway: TripGateway,
    @Inject(REDIS_PROVIDER)
    private readonly redisService: IRedisService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehiclesRepository,
    @Inject(SHARE_ROUTE_SERVICE)
    private readonly shareRouteService: ISharedRouteService,
  ) { }

  async createTrip(createTripDto: ICreateTripDto): Promise<TripDocument> {
    await this.checkTrip(createTripDto);
    const newTrip = await this.tripRepository.create(createTripDto);
    return newTrip;
  }

  async checkTrip(createTripDto: ICreateTripDto): Promise<boolean> {
    const valid = true;
    // customerId: string;
    // driverId: string;
    // timeStart: Date;
    // vehicleId: string;
    // scheduleId: string;

    const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(
      createTripDto.scheduleId.toString(),
    );
    if (!driverSchedule || driverSchedule.status == DriverSchedulesStatus.COMPLETED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'driver Schedule is not valid',
          vnMessage: 'Không có lịch phù hợp',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //add

    if (createTripDto.serviceType === ServiceType.BOOKING_BUS_ROUTE) {
      const payload = createTripDto.servicePayload as BookingBusRoutePayloadDto;
      const busRoute = await this.busRouteRepository.findById(payload.bookingBusRoute.routeId);

      if (!busRoute) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Bus route not found',
            vnMessage: 'Không tìm thấy tuyến xe',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate stops
      const fromStop = busRoute.stops.find(
        s => s.stopId.toString() === payload.bookingBusRoute.fromStopId,
      );
      const toStop = busRoute.stops.find(
        s => s.stopId.toString() === payload.bookingBusRoute.toStopId,
      );

      if (!fromStop || !toStop) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid bus stops',
            vnMessage: 'Trạm dừng không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromStop.orderIndex >= toStop.orderIndex) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid stop order',
            vnMessage: 'Thứ tự trạm không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate estimated duration based on stops
      const duration = toStop.estimatedTime - fromStop.estimatedTime;
      createTripDto.timeEndEstimate = new Date(
        createTripDto.timeStartEstimate.getTime() + duration * 60 * 1000,
      );
    }

    const { timeStart, timeEnd } = await this.validateTimeRange(createTripDto, driverSchedule);

    await this.checkScheduleConflicts(createTripDto.scheduleId, timeStart, timeEnd);
    return valid;
  }

  private validateTimeRange(
    createTripDto: ICreateTripDto,
    driverSchedule: DriverSchedule,
  ): { timeStart: Date; timeEnd: Date } {
    console.log('estimateStart', createTripDto.timeStartEstimate);
    console.log('estimateEnd', createTripDto.timeEndEstimate);
    const timeStart = DateUtils.toUTCDate(new Date(createTripDto.timeStartEstimate)).toDate();
    const timeEnd = DateUtils.toUTCDate(new Date(createTripDto.timeEndEstimate)).toDate();;

    console.log('estimateStartTime', timeStart);
    console.log('estimateEndTime', timeStart);

    // Lấy khung giờ làm việc từ shift
    const shiftHours = ShiftHours[driverSchedule.shift as Shift];
    const scheduleDate = new Date(driverSchedule.date);

    const expectedStartTime = new Date(
      Date.UTC(
        scheduleDate.getUTCFullYear(),
        scheduleDate.getUTCMonth(),
        scheduleDate.getUTCDate(),
        shiftHours.start,
        0,
        0,
      ),
    );

    const expectedEndTime = new Date(
      Date.UTC(
        scheduleDate.getUTCFullYear(),
        scheduleDate.getUTCMonth(),
        scheduleDate.getUTCDate(),
        shiftHours.end,
        0,
        0,
      ),
    );

    console.log('expectedStartTime', expectedStartTime);
    console.log('expectedEndTime', expectedEndTime);

    if (timeStart < expectedStartTime || timeEnd > expectedEndTime) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Time has between shift: ${shiftHours.start}:00 - ${shiftHours.end}:00`,
          vnMessage: `Thời gian đặt phải từ ${shiftHours.start}:00 - ${shiftHours.end}:00`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return { timeStart, timeEnd };
  }

  private async checkScheduleConflicts(
    scheduleId: string,
    newStart: Date,
    newEnd: Date,
  ): Promise<void> {
    console.log('newStart', newStart);
    console.log('newEnd', newEnd);
    const existingTrips = await this.tripRepository.find(
      {
        scheduleId,
        $or: [
          {
            timeStartEstimate: { $lt: newEnd },
            timeEndEstimate: { $gt: newStart },
          },
          {
            timeStartEstimate: { $lte: newStart },
            timeEndEstimate: { $gte: newEnd },
          },
        ],
      },
      [],
    );
    if (existingTrips.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Time has duplicate with some trip',
          vnMessage: 'Trùng lịch với chuyến đi khác',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPersonalCustomerTrip(customerId: string): Promise<TripDocument[]> {
    return await this.tripRepository.find({ customerId }, []);
  }

  async getPersonalDriverTrip(driverId: string): Promise<TripDocument[]> {
    return await this.tripRepository.find({ driverId }, []);
  }

  async getPersonalCustomerTripById(customerId: string, id: string): Promise<TripDocument> {
    return await this.tripRepository.findOne({
      _id: id,
      customerId: customerId
    }, [])
  }

  async calculateBusRouteFare(
    routeId: string,
    fromStopId: string,
    toStopId: string,
    numberOfSeats: number,
  ): Promise<number> {
    const route = await this.busRouteRepository.findById(routeId);
    const fromStop = route.stops.find(s => s.stopId.toString() === fromStopId);
    const toStop = route.stops.find(s => s.stopId.toString() === toStopId);

    const distance = toStop.distanceFromStart - fromStop.distanceFromStart;
    const baseFare = (distance / route.totalDistance) * route.basePrice;

    console.log('====================================');
    console.log(baseFare * numberOfSeats);
    console.log('====================================');

    return Math.round(baseFare * numberOfSeats);
  }

  async driverPickupCustomer(tripId: string, driverId: string): Promise<TripDocument> {
    //check if driver is this trip driver
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Chuyến đi không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế chuyến đi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.PAYED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to pickup or had been picked up',
          vnMessage: 'Chuyến đi chưa sẵn sàng để bắt đầu hoặc đã được bắt đầu',
        },
        HttpStatus.BAD_REQUEST)
    }
    const updatedTrip = await this.tripRepository.updateStatus(tripId, TripStatus.PICKUP);
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật chuyến đi thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.tripGateway.emitTripUpdate(
      updatedTrip.customerId.toString(),
      await this.getPersonalCustomerTrip(updatedTrip.customerId.toString())
    );
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      await this.getPersonalCustomerTripById(updatedTrip.customerId.toString(), updatedTrip._id.toString())
    );
    this.redisService.setUserTrackingVehicle(updatedTrip.customerId.toString(), updatedTrip.vehicleId.toString());
    return updatedTrip;
  }

  async driverStartTrip(tripId: string, driverId: string): Promise<TripDocument> {
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Chuyến đi không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế chuyến đi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.PICKUP) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to start or had been started',
          vnMessage: 'Chuyến đi chưa sẵn sàng để bắt đầu hoặc đã được bắt đầu',
        },
        HttpStatus.BAD_REQUEST)
    }
    //update timeStart to current time
    const timeStart = dayjs();
    console.log('start trip', timeStart.toDate());
    const updatedTrip = await this.tripRepository.updateTrip(
      tripId,
      { timeStart: timeStart.toDate(), status: TripStatus.IN_PROGRESS }
    );
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật chuyến đi thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updatedTrip.serviceType === ServiceType.BOOKING_SHARE) {
      await this.shareRouteService.passStartPoint(updatedTrip.servicePayload.bookingShare.sharedRoute.toString(), updatedTrip._id.toString());
    }
    this.tripGateway.emitTripUpdate(
      updatedTrip.customerId.toString(),
      await this.getPersonalCustomerTrip(updatedTrip.customerId.toString())
    );
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      await this.getPersonalCustomerTripById(updatedTrip.customerId.toString(), updatedTrip._id.toString())
    );
    this.redisService.setUserTrackingVehicle(updatedTrip.customerId.toString(), updatedTrip.vehicleId.toString());
    return updatedTrip;
  }

  async driverCompleteTrip(tripId: string, driverId: string): Promise<TripDocument> {
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Chuyến đi không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế chuyến đi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to complete or had been completed',
          vnMessage: 'Chuyến đi chưa sẵn sàng để hoàn thành hoặc đã được hoàn thành',
        },
        HttpStatus.BAD_REQUEST)
    }
    //update timeEnd to current time
    const timeEnd = dayjs();
    console.log('end trip', timeEnd.toDate());
    const updatedTrip = await this.tripRepository.updateTrip(
      tripId,
      { timeEnd: timeEnd.toDate(), status: TripStatus.COMPLETED }
    );
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật chuyến đi thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updatedTrip.serviceType === ServiceType.BOOKING_SHARE) {
      await this.shareRouteService.passEndPoint(updatedTrip.servicePayload.bookingShare.sharedRoute.toString(), updatedTrip._id.toString());
    }
    this.tripGateway.emitTripUpdate(
      updatedTrip.customerId.toString(),
      await this.getPersonalCustomerTrip(updatedTrip.customerId.toString())
    );
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      await this.getPersonalCustomerTripById(updatedTrip.customerId.toString(), updatedTrip._id.toString())
    );
    this.redisService.deleteUserTrackingVehicle(updatedTrip.customerId.toString(), updatedTrip.vehicleId.toString());
    return updatedTrip;
  }

  async totalAmount(): Promise<number> {
    const Trips = await this.tripRepository.find({
      status: {
        $nin: [
          TripStatus.BOOKING
        ]
      }
    }, ['amount', 'refundAmount']);
    return Trips.reduce((total, trip) => total + (trip.amount - (trip.refundAmount || 0)), 0);
  }

  async getTripByQuery(query: tripParams): Promise<TripDocument[]> {
    const filter: any = query;
    if (query.customerPhone) {
      const customer = await this.userRepository.findUser({
        phone: query.customerPhone,
        role: UserRole.CUSTOMER
      });
      console.log('customer', customer);
      if (!customer) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Customer not found',
            vnMessage: 'Không tìm thấy khách hàng',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      filter.customerId = customer._id.toString();
      //loại bỏ field customerPhone
      delete filter.customerPhone;
    }
    if (query.driverName) {
      const driver = await this.userRepository.findUser({
        name: { $regex: query.driverName, $options: 'i' },
        role: UserRole.DRIVER
      });
      if (!driver) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Driver not found',
            vnMessage: 'Không tìm thấy tài xế',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      filter.driverId = driver._id.toString();
      delete filter.driverName;
    }
    if (query.vehicleName) {
      const vehicle = await this.vehicleRepository.getVehicle({
        name: { $regex: query.vehicleName, $options: 'i' }
      }, ['_id'])
      if (!vehicle) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Vehicle not found',
            vnMessage: 'Không tìm thấy xe',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      filter.vehicleId = vehicle._id.toString();
      delete filter.vehicleName;
    }
    console.log('filter', filter);
    return await this.tripRepository.find(filter, []);
  }

  // run every minute
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'handleTripStartTimeout'
  })
  async handleTripStartTimeout() {
    const now = new Date();
    const startTimeoutAt = new Date(now.getTime() + 15 * 60 * 1000);
    const trips = await this.tripRepository.find({
      status: TripStatus.PAYED,
      timeStartEstimate: { $lte: startTimeoutAt },
      timeStart: null,
    }, []);
    for (const trip of trips) {
      await this.tripRepository.updateStatus(trip._id.toString(), TripStatus.DROPPED_OFF);
      this.tripGateway.emitTripUpdate(
        trip.customerId.toString(),
        await this.getPersonalCustomerTrip(trip.customerId.toString())
      );
    }
  }
}
