import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DRIVERSCHEDULE_REPOSITORY } from 'src/modules/driver-schedule/driver-schedule.di-token';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import { DriverSchedule } from 'src/modules/driver-schedule/driver-schedule.schema';
import { TRIP_GATEWAY, TRIP_REPOSITORY } from 'src/modules/trip/trip.di-token';
import { BookingBusRoutePayloadDto, ICreateTripDto, tripParams } from 'src/modules/trip/trip.dto';
import { ITripRepository, ITripService } from 'src/modules/trip/trip.port';
import { TripDocument } from 'src/modules/trip/trip.schema';

import {
  DriverSchedulesStatus,
  ServiceType,
  serviceTypeText,
  Shift,
  ShiftHours,
  TripCancelBy,
  TripRefundPercent,
  TripStatus,
  UserRole,
} from 'src/share/enums';

import { BUS_ROUTE_REPOSITORY } from '../bus-route/bus-route.di-token';
import { IBusRouteRepository } from '../bus-route/bus-route.port';
import { TripGateway } from 'src/modules/trip/trip.gateway';
import { MOMO_PROVIDER, REDIS_PROVIDER } from 'src/share/di-token';
import dayjs from 'dayjs';
import { convertObjectId, DateUtils, generateBookingCode } from 'src/share/utils';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import { IUserRepository } from 'src/modules/users/users.port';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/vehicles.di-token';
import { IVehiclesRepository } from 'src/modules/vehicles/vehicles.port';
import { IMomoService, IRedisService } from 'src/share/share.port';
import { SHARE_ITINERARY_SERVICE } from 'src/modules/shared-itinerary/shared-itinerary.di-token';
import { ISharedItineraryService } from 'src/modules/shared-itinerary/shared-itinerary.port';
import { Cron, CronExpression } from '@nestjs/schedule';
import { processQueryParams } from 'src/share/utils/query-params.util';
import { NOTIFICATION_SERVICE } from 'src/modules/notification/notification.di-token';
import { INotificationService } from 'src/modules/notification/notification.port';
import { BOOKING_REPOSITORY } from 'src/modules/booking/booking.di-token';
import { IBookingRepository } from 'src/modules/booking/booking.port';
import { PaymentMethod } from 'src/share/enums/payment.enum';
import { TRACKING_SERVICE } from 'src/modules/tracking/tracking.di-token';
import { ITrackingService } from 'src/modules/tracking/tracking.port';
import { CONVERSATION_REPOSITORY } from 'src/modules/conversation/conversation.di-token';
import { IConversationRepository } from 'src/modules/conversation/conversation.port';

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
    @Inject(TRACKING_SERVICE)
    private readonly trackingService: ITrackingService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehiclesRepository,
    @Inject(SHARE_ITINERARY_SERVICE)
    private readonly shareItineraryService: ISharedItineraryService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
    @Inject(MOMO_PROVIDER)
    private readonly momoService: IMomoService, // Replace with actual type if available
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
            vnMessage: 'Trip: Trạm dừng không hợp lệ',
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
    const timeEnd = DateUtils.toUTCDate(new Date(createTripDto.timeEndEstimate)).toDate();

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
          vnMessage: 'Trùng lịch với cuốc xe khác',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPersonalCustomerTrip(customerId: string, query?: tripParams): Promise<TripDocument[]> {
    let filterProcessed: any
    if (!query) {
      filterProcessed = {}
    } else {
      filterProcessed = query;
    }
    if (query?.driverName) {
      const driver = await this.userRepository.findUser({
        name: { $regex: query.driverName, $options: 'i' },
        role: UserRole.DRIVER,
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
      filterProcessed.driverId = driver._id.toString();
      delete filterProcessed.driverName;
    }
    if (query?.vehicleName) {
      const vehicle = await this.vehicleRepository.getVehicle(
        {
          name: { $regex: query.vehicleName, $options: 'i' },
        },
        ['_id'],
      );
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
      filterProcessed.vehicleId = vehicle._id.toString();
      delete filterProcessed.vehicleName;
    }
    console.log('customerId', customerId);
    filterProcessed.customerId = customerId;
    console.log('filterProcessed', filterProcessed);
    const { filter, options } = processQueryParams(filterProcessed, []);
    console.log('filter', filter);
    return await this.tripRepository.find(filter, [], options);
  }

  async getPersonalDriverTrip(driverId: string, query?: tripParams): Promise<TripDocument[]> {
    let filterProcessed: any
    if (!query) {
      filterProcessed = {}
    } else {
      filterProcessed = query;
    }

    if (query?.customerPhone) {
      const customer = await this.userRepository.findUser({
        phone: query.customerPhone,
        role: UserRole.CUSTOMER,
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
      filterProcessed.customerId = customer._id.toString();
      //loại bỏ field customerPhone
      delete filterProcessed.customerPhone;
    }
    if (query?.vehicleName) {
      const vehicle = await this.vehicleRepository.getVehicle(
        {
          name: { $regex: query.vehicleName, $options: 'i' },
        },
        ['_id'],
      );
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
      filterProcessed.vehicleId = vehicle._id.toString();
      delete filterProcessed.vehicleName;
    }
    console.log('driverId', driverId);
    filterProcessed.driverId = driverId;
    console.log('filterProcessed', filterProcessed);
    const { filter, options } = processQueryParams(filterProcessed, []);
    console.log('filter', filter);
    return await this.tripRepository.find(filter, [], options);
  }

  async getPersonalCustomerTripById(customerId: string, id: string): Promise<TripDocument> {
    return await this.tripRepository.findOne(
      {
        _id: id,
        customerId: customerId,
      },
      [],
    );
  }

  async getPersonalDriverTripById(driverId: string, id: string,): Promise<TripDocument> {
    return await this.tripRepository.findOne(
      {
        _id: id,
        driverId: driverId,
      },
      [],
    );
  }

  async calculateBusRouteFare(
    routeId: string,
    fromStopId: string,
    toStopId: string,
    numberOfSeats: number,
  ): Promise<number> {
    // const route = await this.busRouteRepository.findById(routeId);
    // const fromStop = route.stops.find(s => s.stopId.toString() === fromStopId);
    // const toStop = route.stops.find(s => s.stopId.toString() === toStopId);

    // const distance = toStop.distanceFromStart - fromStop.distanceFromStart;
    // const baseFare = (distance / route.totalDistance) * route.basePrice;

    // console.log('====================================');
    // console.log(baseFare * numberOfSeats);
    // console.log('====================================');

    // return Math.round(baseFare * numberOfSeats);
    return null;
  }

  async driverPickupCustomer(tripId: string, driverId: string): Promise<TripDocument> {
    //check if driver is this trip driver
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Cuốc xe không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế cuốc xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.CONFIRMED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to pickup or had been picked up',
          vnMessage: 'Cuốc xe chưa sẵn sàng để bắt đầu hoặc đã được bắt đầu',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedTrip = await this.tripRepository.updateStatus(tripId, TripStatus.PICKUP);
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật cuốc xe thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const notificationForCustomer = {
      received: updatedTrip.customerId.toString(),
      title: `Cuốc xe ${updatedTrip.code} đang trên đường đến đón`,
      body: `Cuốc xe ${serviceTypeText[updatedTrip.serviceType]} số hiệu  ${updatedTrip.code} của bạn đãng trên đường đến đón`,
    };
    const tripAfterUpdate = await this.tripRepository.findOne({ _id: tripId }, []);
    await this.notificationService.createNotification(notificationForCustomer);

    const listDriverTrip = await this.getPersonalDriverTrip(updatedTrip.driverId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.driverId.toString(), listDriverTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.driverId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    const listCustomerTrip = await this.getPersonalCustomerTrip(updatedTrip.customerId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.customerId.toString(), listCustomerTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    this.trackingService.setUserTrackingVehicle(
      updatedTrip.customerId.toString(),
      updatedTrip.vehicleId.toString(),
    );
    return updatedTrip;
  }

  async driverStartTrip(tripId: string, driverId: string): Promise<TripDocument> {
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Cuốc xe không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế cuốc xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.PICKUP) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to start or had been started',
          vnMessage: 'Cuốc xe chưa sẵn sàng để bắt đầu hoặc đã được bắt đầu',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //update timeStart to current time
    const timeStart = dayjs();
    console.log('start trip', timeStart.toDate());
    const updatedTrip = await this.tripRepository.updateTrip(tripId, {
      timeStart: timeStart.toDate(),
      status: TripStatus.IN_PROGRESS,
    });
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật cuốc xe thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const notificationForCustomer = {
      received: updatedTrip.customerId.toString(),
      title: `Cuốc xe ${updatedTrip.code} đã bắt đầu`,
      body: `Cuốc xe ${serviceTypeText[updatedTrip.serviceType]} số hiệu ${updatedTrip.code} của bạn đã bắt đầu`,
    };
    await this.notificationService.createNotification(notificationForCustomer);
    const tripAfterUpdate = await this.tripRepository.findOne({ _id: tripId }, []);

    if (updatedTrip.serviceType === ServiceType.BOOKING_SHARE) {
      await this.shareItineraryService.passStartPoint(
        updatedTrip.servicePayload.bookingShare.sharedItinerary.toString(),
        updatedTrip._id.toString(),
      );
    }
    const listDriverTrip = await this.getPersonalDriverTrip(updatedTrip.driverId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.driverId.toString(), listDriverTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.driverId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    const listCustomerTrip = await this.getPersonalCustomerTrip(updatedTrip.customerId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.customerId.toString(), listCustomerTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    this.trackingService.setUserTrackingVehicle(
      updatedTrip.customerId.toString(),
      updatedTrip.vehicleId.toString(),
    );
    return updatedTrip;
  }

  async driverCompleteTrip(tripId: string, driverId: string): Promise<TripDocument> {
    const trip = await this.tripRepository.findOne({ _id: tripId }, []);
    if (!trip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Cuốc xe không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.driverId._id.toString() !== driverId.toString()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Driver is not this trip driver',
          vnMessage: 'Tài xế không phải tài xế cuốc xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not ready to complete or had been completed',
          vnMessage: 'Cuốc xe chưa sẵn sàng để hoàn thành hoặc đã được hoàn thành',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //update timeEnd to current time
    const timeEnd = dayjs();
    console.log('end trip', timeEnd.toDate());
    // if (!trip.isPrepaid) {
    //   updatedTrip = await this.tripRepository.updateTrip(tripId, {
    //     timeEnd: timeEnd.toDate(),
    //     status: TripStatus.COMPLETED,
    //     isPayed: true,
    //   });
    // } else {}
    const updatedTrip = await this.tripRepository.updateTrip(tripId, {
      timeEnd: timeEnd.toDate(),
      status: TripStatus.COMPLETED,
    });
    if (!updatedTrip) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật cuốc xe thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const notificationForCustomer = {
      received: updatedTrip.customerId.toString(),
      title: `Cuốc xe ${updatedTrip.code} đã kết thúc`,
      body: `Cuốc xe ${serviceTypeText[updatedTrip.serviceType]} số hiệu ${updatedTrip.code} của bạn đã kết thúc`,
    };
    await this.notificationService.createNotification(notificationForCustomer);
    const tripAfterUpdate = await this.tripRepository.findOne({ _id: tripId }, []);

    if (updatedTrip.serviceType === ServiceType.BOOKING_SHARE) {
      await this.shareItineraryService.passEndPoint(
        updatedTrip.servicePayload.bookingShare.sharedItinerary.toString(),
        updatedTrip._id.toString(),
      );
    }
    const listDriverTrip = await this.getPersonalDriverTrip(updatedTrip.driverId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.driverId.toString(), listDriverTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.driverId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    const listCustomerTrip = await this.getPersonalCustomerTrip(updatedTrip.customerId.toString());
    this.tripGateway.emitTripUpdate(updatedTrip.customerId.toString(), listCustomerTrip);
    this.tripGateway.emitTripUpdateDetail(
      updatedTrip.customerId.toString(),
      updatedTrip._id.toString(),
      tripAfterUpdate,
    );
    this.trackingService.deleteUserTrackingVehicle(
      updatedTrip.customerId.toString(),
      updatedTrip.vehicleId.toString(),
    );
    const conversation = await this.conversationRepository.getConversation({
      tripId: updatedTrip._id.toString(),
    }, ['timeToClose'])
    //update timeToClose to current time + 30 minutes
    if (conversation) {
      const timeToClose = new Date(updatedTrip.timeEnd);
      timeToClose.setMinutes(timeToClose.getMinutes() + 30);
      await this.conversationRepository.updateConversation(conversation._id.toString(), {
        timeToClose: timeToClose,
      })
    }
    return updatedTrip;
  }

  async getTripByQuery(query: tripParams): Promise<TripDocument[]> {
    const filterProcessed: any = query;
    if (query.customerPhone) {
      const customer = await this.userRepository.findUser({
        phone: query.customerPhone,
        role: UserRole.CUSTOMER,
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
      filterProcessed.customerId = customer._id.toString();
      //loại bỏ field customerPhone
      delete filterProcessed.customerPhone;
    }
    if (query.driverName) {
      const driver = await this.userRepository.findUser({
        name: { $regex: query.driverName, $options: 'i' },
        role: UserRole.DRIVER,
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
      filterProcessed.driverId = driver._id.toString();
      delete filterProcessed.driverName;
    }
    if (query.vehicleName) {
      const vehicle = await this.vehicleRepository.getVehicle(
        {
          name: { $regex: query.vehicleName, $options: 'i' },
        },
        ['_id'],
      );
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
      filterProcessed.vehicleId = vehicle._id.toString();
      delete filterProcessed.vehicleName;
    }
    console.log('filterProcessed', filterProcessed);
    const { filter, options } = processQueryParams(filterProcessed, []);
    return await this.tripRepository.find(filter, [], options);
  }

  async cancelTrip(userId: string, id: string, reason: string): Promise<TripDocument> {
    const trip = await this.tripRepository.findOne({ _id: id }, []);
    if (!trip || ![trip.customerId._id.toString(), trip.driverId._id.toString()].includes(userId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip not found',
          vnMessage: 'Cuốc xe không tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (![TripStatus.CONFIRMED, TripStatus.PICKUP].includes(trip.status)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip is not cancellable',
          vnMessage: 'Cuốc xe không thể hủy',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const cancellationTime = new Date();
    const cancellationReason = reason;
    const cancelledBy =
      trip.customerId._id.toString() === userId ? TripCancelBy.CUSTOMER : TripCancelBy.DRIVER;

    let refundAmount: number = 0;
    if (trip.isPrepaid && trip.isPayed) {
      if (cancelledBy === TripCancelBy.DRIVER) {
        refundAmount = trip.amount
      }
      else if (cancelledBy === TripCancelBy.CUSTOMER) {
        // For hourly/scenic bookings with time-dependent refunds 
        if (trip.status === TripStatus.CONFIRMED &&
          [ServiceType.BOOKING_HOUR, ServiceType.BOOKING_SCENIC_ROUTE].includes(trip.serviceType)) {
          // Check if cancellation is more than 1 hour before scheduled start
          const isMoreThanOneHour = trip.timeStartEstimate.getTime() - cancellationTime.getTime() > 60 * 60 * 1000;
          const timeCondition = isMoreThanOneHour ? 'MORE_THAN_1_HOUR' : 'LES_THAN_1_HOUR';
          refundAmount = trip.amount * TripRefundPercent.CUSTOMER[trip.serviceType][trip.status][timeCondition];
        } else {
          // Standard refund calculation for other service types or PICKUP status
          refundAmount = trip.amount * TripRefundPercent.CUSTOMER[trip.serviceType][trip.status];
        }
      }
    }

    const tripUpdate = await this.tripRepository.updateTrip(id, {
      status: TripStatus.CANCELLED,
      cancellationTime,
      cancellationReason,
      cancelledBy,
      refundAmount,
    });
    if (!tripUpdate) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Trip update failed',
          vnMessage: 'Cập nhật cuốc xe thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('tripUpdate', tripUpdate);
    const tripAfterUpdate = await this.tripRepository.findOne({ _id: id }, []);
    const listDriverTrip = await this.getPersonalDriverTrip(tripUpdate.driverId.toString());
    if (tripUpdate.cancelledBy === TripCancelBy.CUSTOMER) {
      const notificationForDriver = {
        received: tripUpdate.driverId.toString(),
        title: `Cuốc xe ${tripUpdate.code} đã bị hủy`,
        body: `Khách hàng đã hủy cuốc xe ${serviceTypeText[tripUpdate.serviceType]} số hiệu ${tripUpdate.code}`,
      };
      await this.notificationService.createNotification(notificationForDriver);
      await this.tripGateway.emitTripUpdate(tripUpdate.driverId.toString(), listDriverTrip);
      if (trip.serviceType !== ServiceType.BOOKING_SHARE) {
        await this.tripGateway.emitTripUpdateDetail(
          tripUpdate.driverId.toString(),
          tripUpdate._id.toString(),
          tripAfterUpdate,
        );
      }
    }
    if (tripUpdate.cancelledBy === TripCancelBy.DRIVER) {
      const notificationForCustomer = {
        received: tripUpdate.customerId.toString(),
        title: `Cuốc xe ${tripUpdate.code} đã bị hủy`,
        body: `Tài xế đã hủy cuốc xe ${serviceTypeText[tripUpdate.serviceType]} số hiệu ${tripUpdate.code}`,
      };
      // if (updatedTrip.serviceType === ServiceType.BOOKING_SHARE) {
      //   await this.shareItineraryService.passEndPoint(updatedTrip.servicePayload.bookingShare.sharedItinerary.toString(), updatedTrip._id.toString());
      // }
      console.log('notificationForCustomer', notificationForCustomer);
      await this.notificationService.createNotification(notificationForCustomer);

      this.tripGateway.emitTripUpdate(tripUpdate.driverId.toString(), listDriverTrip);
      this.tripGateway.emitTripUpdateDetail(
        tripUpdate.driverId.toString(),
        tripUpdate._id.toString(),
        tripAfterUpdate,
      );
      const listCustomerTrip = await this.getPersonalCustomerTrip(tripUpdate.customerId.toString());
      this.tripGateway.emitTripUpdate(tripUpdate.customerId.toString(), listCustomerTrip);
      this.tripGateway.emitTripUpdateDetail(
        tripUpdate.customerId.toString(),
        tripUpdate._id.toString(),
        tripAfterUpdate,
      );
      this.trackingService.deleteUserTrackingVehicle(
        tripUpdate.customerId.toString(),
        tripUpdate.vehicleId.toString(),
      );
    }

    if (trip.serviceType === ServiceType.BOOKING_SHARE) {
      console.log('cancelTripInItinerary')
      await this.shareItineraryService.cancelTripInItinerary(
        trip._id.toString(),
        trip.servicePayload.bookingShare.sharedItinerary.toString(),
      )
    }


    await this.handleRefundForTrip(tripUpdate._id.toString(), refundAmount); //excute refund money
    //excute refund money

    return tripUpdate;
  }

  async handleRefundForTrip(tripId: string, refundAmount: number): Promise<void> {
    console.log('tripId721', tripId);
    const booking = await this.bookingRepository.findOneBooking(
      {
        trips: {
          $in: [
            convertObjectId(tripId)
          ]
        },
        paymentMethod: PaymentMethod.MOMO,
      },
      ["transId"]
    )
    if (!booking || !booking.transId) {
      return
    }
    console.log('booking725', booking);
    const orderId = generateBookingCode()
    await this.momoService.initiateRefund({
      orderId: orderId.toString(),
      amount: refundAmount,
      description: `Refund for trip ${tripId}`,
      transId: booking.transId,
    })
  }


  async totalAmount(): Promise<number> {
    const Trips = await this.tripRepository.find(
      {
        status: {
          $nin: [TripStatus.BOOKING],
        },
        isPayed: true
      },
      ['amount', 'refundAmount'],
    );
    return Trips.reduce((total, trip) => total + (trip.amount - (trip.refundAmount || 0)), 0);
  }

  async checkoutTransferTrip(tripIds: string[]): Promise<object> {
    console.log('tripIds', tripIds);
    const trips = await this.tripRepository.find(
      {
        _id: { $in: tripIds },
        status: TripStatus.COMPLETED,
        isPayed: false,
      },
      [],
    );
    const bookingCode = generateBookingCode();
    const totalAmount = trips.reduce((total, trip) => total + trip.amount, 0);
    console.log('totalAmount', totalAmount);
    const tripIdList = trips.map(trip => trip._id.toString());
    const payment = await this.momoService.createTransferTripPaymentLink({
      bookingCode: bookingCode,
      amount: totalAmount,
      tripIds: tripIdList,
      description: "Chuyển tiền cuốc xe tài xế thu tiền mặt",
      returnUrl: 'return-transfer-trips',
    })
    return {
      paymentUrl: payment,
    }
  }

  async transferTripAmountSuccess(tripIds: string[]): Promise<void> {
    const trips = await this.tripRepository.find(
      {
        _id: { $in: tripIds },
        status: TripStatus.COMPLETED,
        isPayed: false,
      },
      [],
    );
    const tripIdList = trips.map(trip => trip._id.toString());
    for (const tripid of tripIdList) {
      await this.tripRepository.updateTrip(tripid, {
        isPayed: true,
      });
    }

  }

  // run every minute
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'handleTripStartTimeout'
  })
  async handleTripStartTimeout() {
    const now = new Date();
    const endTimeOut = new Date(now.getTime() - 5 * 60 * 1000);
    console.log('endTimeOut', endTimeOut);
    const trips = await this.tripRepository.find({
      status: TripStatus.CONFIRMED,
      timeEndEstimate: { $lte: endTimeOut },
      timeStart: null,
    }, []);
    for (const trip of trips) {
      await this.tripRepository.updateStatus(trip._id.toString(), TripStatus.DROPPED_OFF);
      if (trip.serviceType === ServiceType.BOOKING_SHARE) {
        await this.shareItineraryService.cancelTripInItinerary(
          trip._id.toString(),
          trip.servicePayload.bookingShare.sharedItinerary.toString(),
        )
      }
      const notificationForCustomer = {
        received: trip.customerId.toString(),
        title: `Cuốc xe ${trip.code} đã bị ngưng thực hiện `,
        body: `Cuốc xe ${serviceTypeText[trip.serviceType]} : ${trip.code} đã bị ngưng thực hiện do quá thời gian`,
      }
      const notificationForDriver = {
        received: trip.driverId.toString(),
        title: `Cuốc xe ${trip.code} đã bị thôi hoạt động`,
        body: `Cuốc xe ${serviceTypeText[trip.serviceType]} : ${trip.code} đã bị ngưng thực hiện do quá thời gian`,
      }
      await this.notificationService.createNotification(notificationForCustomer)
      await this.notificationService.createNotification(notificationForDriver)
      this.tripGateway.emitTripUpdate(
        trip.customerId.toString(),
        await this.getPersonalCustomerTrip(trip.customerId.toString())
      );
      this.tripGateway.emitTripUpdate(
        trip.driverId.toString(),
        await this.getPersonalDriverTrip(trip.driverId.toString())
      );
    }
  }
}
