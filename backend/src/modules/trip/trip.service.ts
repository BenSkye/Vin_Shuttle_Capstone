import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DRIVERSCHEDULE_REPOSITORY } from 'src/modules/driver-schedule/driver-schedule.di-token';
import { IDriverScheduleRepository } from 'src/modules/driver-schedule/driver-schedule.port';
import { DriverSchedule } from 'src/modules/driver-schedule/driver-schedule.schema';
import { TRIP_GATEWAY, TRIP_REPOSITORY } from 'src/modules/trip/trip.di-token';
import { BookingBusRoutePayloadDto, ICreateTripDto } from 'src/modules/trip/trip.dto';
import { ITripRepository, ITripService } from 'src/modules/trip/trip.port';
import { TripDocument } from 'src/modules/trip/trip.schema';

import { DriverSchedulesStatus, ServiceType, Shift, ShiftHours, TripStatus } from 'src/share/enums';

import { BUS_ROUTE_REPOSITORY } from '../bus-route/bus-route.di-token';
import { IBusRouteRepository } from '../bus-route/bus-route.port';
import { TripGateway } from 'src/modules/trip/trip.gateway';
import { REDIS_PROVIDER } from 'src/share/di-token';
import { IRedisService } from 'src/share/interface';

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
      createTripDto.scheduleId,
    );
    if (!driverSchedule || driverSchedule.status == DriverSchedulesStatus.COMPLETED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'driver Schedule is not valid',
          vnMesage: 'Không có lịch phù hợp',
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
    const timeStart = new Date(createTripDto.timeStartEstimate);
    const timeEnd = new Date(createTripDto.timeEndEstimate);

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

    if (timeStart < expectedStartTime || timeEnd > expectedEndTime) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Time has between shift: ${shiftHours.start}:00 - ${shiftHours.end}:00`,
          vnMesage: `Thời gian đặt phải từ ${shiftHours.start}:00 - ${shiftHours.end}:00`,
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
          vnMesage: 'Trùng lịch với chuyến đi khác',
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
    const updatedTrip = await this.tripRepository.updateStatus(tripId, TripStatus.IN_PROGRESS);
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
    const updatedTrip = await this.tripRepository.updateStatus(tripId, TripStatus.COMPLETED);
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
}
// if (createTripDto.serviceType == ServiceType.BOOKING_HOUR) {
//     const totalMinutes = (createTripDto.servicePayload as BookingHourPayloadDto).totalTime;
//     // Chuyển đổi phút sang milliseconds
//     const durationMs = totalMinutes * 60 * 1000;
//     timeEnd = new Date(timeStart.getTime() + durationMs);

//     if (timeStart < expectedStartTime || timeEnd > expectedEndTime) {
//         throw new HttpException({
//             statusCode: HttpStatus.BAD_REQUEST,
//             message: 'Time is not valid'
//         }, HttpStatus.BAD_REQUEST);
//     }
// }

// if (createTripDto.serviceType == ServiceType.BOOKING_SCENIC_ROUTE) {
//     const scenicRoute = await
//         this.scenicRouteRepository.findById((createTripDto.servicePayload as BookingScenicRoutePayloadDto).routeId);
//     timeEnd = new Date(timeStart.getTime() +
//         scenicRoute.estimatedDuration * 60 * 1000);

//     if (timeStart < expectedStartTime || timeEnd > expectedEndTime) {
//         throw new HttpException({
//             statusCode: HttpStatus.BAD_REQUEST,
//             message: 'Time is not valid'
//         }, HttpStatus.BAD_REQUEST);
//     }
// }
