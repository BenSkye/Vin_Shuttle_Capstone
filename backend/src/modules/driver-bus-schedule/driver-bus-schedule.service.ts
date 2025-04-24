import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IDriverBusScheduleService, IDriverBusScheduleRepository } from './driver-bus-schedule.port';
import { CreateDriverBusScheduleDto, UpdateDriverBusScheduleDto } from './driver-bus-schedule.dto';
import { DriverBusScheduleDocument } from './driver-bus-schedule.schema';
import { DRIVER_BUS_SCHEDULE_REPOSITORY } from './driver-bus-schedule.di-token';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { VEHICLE_SERVICE } from '../vehicles/vehicles.di-token';
import { IBusRouteService } from '../bus-route/bus-route.port';
import { IVehiclesService } from '../vehicles/vehicles.port';
import { BusScheduleStatus } from '../../share/enums/bus-schedule.enum';
import { VehicleOperationStatus } from '../../share/enums/vehicle.enum';
import moment from 'moment';
import { Types } from 'mongoose';

@Injectable()
export class DriverBusScheduleService implements IDriverBusScheduleService {
  constructor(
    @Inject(DRIVER_BUS_SCHEDULE_REPOSITORY)
    private readonly driverBusScheduleRepo: IDriverBusScheduleRepository,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
    @Inject(VEHICLE_SERVICE)
    private readonly vehicleService: IVehiclesService,
  ) {}

  private async validateScheduleTime(startTime: Date, endTime: Date) {
    if (!startTime || !endTime) {
      throw new BadRequestException('Start time and end time are required');
    }

    const endMoment = moment(endTime);
    const startMoment = moment(startTime);

    if (endMoment.isSameOrBefore(startMoment)) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private async checkScheduleConflict(
    driverId: string,
    vehicleId: string,
    startTime: Date,
    endTime: Date
  ) {
    // Get existing schedules for driver and vehicle
    const driverSchedules = await this.driverBusScheduleRepo.findByDriver(driverId);
    const vehicleSchedules = await this.driverBusScheduleRepo.findByVehicle(vehicleId);

    const existingSchedules = [...driverSchedules, ...vehicleSchedules];

    // Check for overlapping schedules
    const hasConflict = existingSchedules.some(schedule => {
      const scheduleStartMoment = moment(schedule.startTime);
      const scheduleEndMoment = moment(schedule.endTime);
      const newStartMoment = moment(startTime);
      const newEndMoment = moment(endTime);

      return (
        (newStartMoment.isSameOrAfter(scheduleStartMoment) && newStartMoment.isBefore(scheduleEndMoment)) ||
        (newEndMoment.isAfter(scheduleStartMoment) && newEndMoment.isSameOrBefore(scheduleEndMoment)) ||
        (newStartMoment.isSameOrBefore(scheduleStartMoment) && newEndMoment.isAfter(scheduleEndMoment))
      );
    });

    if (hasConflict) {
      throw new BadRequestException('Schedule conflicts with existing schedules');
    }
  }

  async createSchedule(dto: CreateDriverBusScheduleDto): Promise<DriverBusScheduleDocument> {
    // Validate schedule time
    await this.validateScheduleTime(dto.startTime, dto.endTime);

    // Check if bus route exists
    const busRoute = await this.busRouteService.getRouteById(dto.busRoute);
    if (!busRoute) {
      throw new NotFoundException('Bus route not found');
    }

    // Check if vehicle exists and is available
    const vehicle = await this.vehicleService.findById(dto.vehicle);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.operationStatus !== VehicleOperationStatus.PENDING) {

      console.log('====================================');
      console.log('vehicle.operationStatus', vehicle.operationStatus);
      console.log('====================================');


      console.log('====================================');
      console.log('VehicleOperationStatus.AVAILABLE',VehicleOperationStatus.AVAILABLE);
      console.log('====================================');

      throw new HttpException( {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Vehicle ${vehicle.name} (ID: ${vehicle._id}) is not available - Current status: ${vehicle.operationStatus}`,
          vnMessage: `Phương tiện ${vehicle.name} (ID: ${vehicle._id}) không có sẵn - Trạng thái hiện tại: ${vehicle.operationStatus}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for schedule conflicts
    await this.checkScheduleConflict(dto.driver, dto.vehicle, dto.startTime, dto.endTime);

    // Create schedule
    const schedule = await this.driverBusScheduleRepo.create({
      ...dto,
      status: BusScheduleStatus.ACTIVE
    });

    // Update vehicle status
    await this.vehicleService.update(dto.vehicle, {
      operationStatus: VehicleOperationStatus.PENDING
    });

    return schedule;
  }

  async getScheduleById(id: string): Promise<DriverBusScheduleDocument> {
    const schedule = await this.driverBusScheduleRepo.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async getDriverSchedules(driverId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleRepo.findByDriver(driverId);
  }

  async getRouteSchedules(routeId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleRepo.findByRoute(routeId);
  }

  async getVehicleSchedules(vehicleId: string): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleRepo.findByVehicle(vehicleId);
  }

  async getActiveDriverSchedules(driverId: string, date: Date): Promise<DriverBusScheduleDocument[]> {
    return await this.driverBusScheduleRepo.findActiveByDriverAndDate(driverId, date);
  }

  async updateSchedule(id: string, dto: UpdateDriverBusScheduleDto): Promise<DriverBusScheduleDocument> {
    await this.getScheduleById(id);
    return await this.driverBusScheduleRepo.update(id, dto);
  }

  async deleteSchedule(id: string): Promise<void> {
    const schedule = await this.getScheduleById(id);
    
    // Update vehicle status back to available
    await this.vehicleService.update(schedule.vehicle.toString(), {
      operationStatus: VehicleOperationStatus.AVAILABLE
    });

    await this.driverBusScheduleRepo.delete(id);
  }

  async checkIn(id: string): Promise<DriverBusScheduleDocument> {
    const schedule = await this.getScheduleById(id);

    if (schedule.status !== BusScheduleStatus.ACTIVE) {
      throw new BadRequestException('Schedule is not active');
    }

    const nowMoment = moment();
    const startTimeMoment = moment(schedule.startTime);
    const isLate = nowMoment.isAfter(startTimeMoment.add(15, 'minutes'));

    return await this.driverBusScheduleRepo.update(id, {
      status: BusScheduleStatus.IN_PROGRESS,
      checkinTime: new Date(),
      isLate,
      currentPassengers: 0,
      totalPassengers: 0,
      completedStops: []
    });
  }

  async checkOut(id: string): Promise<DriverBusScheduleDocument> {
    const schedule = await this.getScheduleById(id);

    if (schedule.status !== BusScheduleStatus.IN_PROGRESS) {
      throw new BadRequestException('Schedule is not in progress');
    }

    const nowMoment = moment();
    const endTimeMoment = moment(schedule.endTime);
    const isEarlyCheckout = nowMoment.isBefore(endTimeMoment.subtract(15, 'minutes'));

    const updatedSchedule = await this.driverBusScheduleRepo.update(id, {
      status: BusScheduleStatus.COMPLETED,
      checkoutTime: new Date(),
      isEarlyCheckout
    });

    // Update vehicle status
    await this.vehicleService.update(schedule.vehicle.toString(), {
      operationStatus: VehicleOperationStatus.AVAILABLE
    });

    return updatedSchedule;
  }

  async updateCurrentStop(id: string, stopId: string): Promise<DriverBusScheduleDocument> {
    const schedule = await this.getScheduleById(id);

    if (schedule.status !== BusScheduleStatus.IN_PROGRESS) {
      throw new BadRequestException('Schedule is not in progress');
    }

    // Add current stop to completed stops if not already included
    const completedStops = schedule.completedStops || [];
    const stopObjectId = new Types.ObjectId(stopId);
    
    if (!completedStops.some(stop => stop.equals(stopObjectId))) {
      completedStops.push(stopObjectId);
    }

    return await this.driverBusScheduleRepo.update(id, {
      currentStop: stopObjectId,
      completedStops
    });
  }

  async updatePassengerCount(id: string, count: number): Promise<DriverBusScheduleDocument> {
    const schedule = await this.getScheduleById(id);

    if (schedule.status !== BusScheduleStatus.IN_PROGRESS) {
      throw new BadRequestException('Schedule is not in progress');
    }

    const currentPassengers = schedule.currentPassengers + count;
    if (currentPassengers < 0) {
      throw new BadRequestException('Invalid passenger count');
    }

    const totalPassengers = schedule.totalPassengers + (count > 0 ? count : 0);

    return await this.driverBusScheduleRepo.update(id, {
      currentPassengers,
      totalPassengers
    });
  }
  async checkDriverAvailability(
  driverId: string,
  startTime: Date,
  endTime: Date,
  effectiveDate: Date
): Promise<boolean> {
  const startOfDay = moment(effectiveDate).startOf('day').toDate();
  const endOfDay = moment(effectiveDate).endOf('day').toDate();

  // Lấy tất cả lịch trình active của tài xế trong ngày
  const driverSchedules = await this.driverBusScheduleRepo.findActiveByDriverAndDate(
    driverId,
    effectiveDate
  );

  // Kiểm tra xem có lịch trình nào overlap không
  const hasConflict = driverSchedules.some(schedule => {
    const scheduleStart = moment(schedule.startTime);
    const scheduleEnd = moment(schedule.endTime);
    const newStart = moment(startTime);
    const newEnd = moment(endTime);

    return (
      schedule.status !== BusScheduleStatus.CANCELLED &&
      schedule.status !== BusScheduleStatus.COMPLETED &&
      (
        (newStart.isSameOrAfter(scheduleStart) && newStart.isBefore(scheduleEnd)) ||
        (newEnd.isAfter(scheduleStart) && newEnd.isSameOrBefore(scheduleEnd)) ||
        (newStart.isSameOrBefore(scheduleStart) && newEnd.isAfter(scheduleEnd))
      )
    );
  });

  return hasConflict;
 }
} 