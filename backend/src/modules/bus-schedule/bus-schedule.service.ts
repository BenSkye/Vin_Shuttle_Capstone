import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IBusScheduleRepository, IBusScheduleService } from './bus-schedule.port';
import { BUS_SCHEDULE_REPOSITORY } from './bus-schedule.di-token';
import { CreateBusScheduleDto } from './bus-schedule.dto';
import { BusScheduleDocument } from './bus-schedule.schema';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { IBusRouteService } from '../bus-route/bus-route.port';
import { VEHICLE_SERVICE } from '../vehicles/vehicles.di-token';
import { IVehiclesService } from '../vehicles/vehicles.port';
import { BusTimeSlotHours } from 'src/share/enums/bus-schedule.enum';

@Injectable()
export class BusScheduleService implements IBusScheduleService {
  constructor(
    @Inject(BUS_SCHEDULE_REPOSITORY)
    private readonly busScheduleRepository: IBusScheduleRepository,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
    @Inject(VEHICLE_SERVICE)
    private readonly vehicleService: IVehiclesService,
  ) {}

  async createSchedule(dto: CreateBusScheduleDto): Promise<BusScheduleDocument> {
    const busRoute = await this.busRouteService.getRouteById(dto.busRoute);
    if (!busRoute) {
      throw new HttpException({
        message: 'Bus route not found',
        vnMessage: 'Không tìm thấy tuyến xe buýt'
      }, HttpStatus.NOT_FOUND);
    }

    for (const timeSlot of dto.timeSlots) {
      for (const vehicleId of timeSlot.vehicles) {
        const vehicle = await this.vehicleService.getById(vehicleId);
        if (!vehicle) {
          throw new HttpException({
            message: `Vehicle ${vehicleId} not found`,
            vnMessage: `Không tìm thấy xe ${vehicleId}`
          }, HttpStatus.NOT_FOUND);
        }
      }
    }

    this.validateTimeSlots(dto.timeSlots);

    // Check if there's already an active schedule for this route
    const existingSchedule = await this.busScheduleRepository.findActiveByRoute(dto.busRoute);
    if (existingSchedule) {
      throw new HttpException({
        message: 'An active schedule already exists for this route',
        vnMessage: 'Đã tồn tại lịch hoạt động cho tuyến này'
      }, HttpStatus.BAD_REQUEST);
    }

    return await this.busScheduleRepository.create(dto);
  }

  async getActiveScheduleByRoute(routeId: string): Promise<BusScheduleDocument> {
  console.log('====================================');
  console.log('RouteId', routeId);
  console.log('====================================');

    const schedule = await this.busScheduleRepository.findActiveByRoute(routeId);
    if (!schedule) {
      throw new HttpException({
        message: 'No active schedule found for this route',
        vnMessage: 'Không tìm thấy lịch hoạt động cho tuyến này'
      }, HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  async updateSchedule(id: string, dto: CreateBusScheduleDto): Promise<BusScheduleDocument> {
    const schedule = await this.busScheduleRepository.findById(id);
    if (!schedule) {
      throw new HttpException({
        message: 'Schedule not found',
        vnMessage: 'Không tìm thấy lịch'
      }, HttpStatus.NOT_FOUND);
    }

    // Validate bus route exists
    const busRoute = await this.busRouteService.getRouteById(dto.busRoute);
    if (!busRoute) {
      throw new HttpException({
        message: 'Bus route not found',
        vnMessage: 'Không tìm thấy tuyến xe buýt'
      }, HttpStatus.NOT_FOUND);
    }

    // Validate vehicles
    for (const timeSlot of dto.timeSlots) {
      for (const vehicleId of timeSlot.vehicles) {
        const vehicle = await this.vehicleService.getById(vehicleId);
        if (!vehicle) {
          throw new HttpException({
            message: `Vehicle ${vehicleId} not found`,
            vnMessage: `Không tìm thấy xe ${vehicleId}`
          }, HttpStatus.NOT_FOUND);
        }
      }
    }

    this.validateTimeSlots(dto.timeSlots);

    return await this.busScheduleRepository.update(id, dto);
  }

  async deleteSchedule(id: string): Promise<void> {
    const schedule = await this.busScheduleRepository.findById(id);
    if (!schedule) {
      throw new HttpException({
        message: 'Schedule not found',
        vnMessage: 'Không tìm thấy lịch'
      }, HttpStatus.NOT_FOUND);
    }

    await this.busScheduleRepository.delete(id);
  }

  async generateDailyTrips(scheduleId: string, date: Date): Promise<any> {
    const schedule = await this.busScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new HttpException({
        message: 'Schedule not found',
        vnMessage: 'Không tìm thấy lịch'
      }, HttpStatus.NOT_FOUND);
    }

    const trips = [];
    
    // Generate trips for each time slot
    for (const timeSlot of schedule.timeSlots) {
      const { start, end } = BusTimeSlotHours[timeSlot.timeSlot];
      const timeRange = end - start;
      const intervalMinutes = Math.floor((timeRange * 60) / timeSlot.frequency);

      for (let i = 0; i < timeSlot.frequency; i++) {
        const startTime = new Date(date);
        startTime.setHours(start);
        startTime.setMinutes(i * intervalMinutes);

        // Rotate vehicles for each trip
        const vehicleIndex = i % timeSlot.vehicles.length;
        const vehicleId = timeSlot.vehicles[vehicleIndex];

        trips.push({
          busRoute: schedule.busRoute,
          vehicle: vehicleId,
          scheduledStartTime: startTime,
          timeSlot: timeSlot.timeSlot
        });
      }
    }

    return {
      date,
      schedule: scheduleId,
      trips
    };
  }

  private validateTimeSlots(timeSlots: CreateBusScheduleDto['timeSlots']): void {
    // Check for duplicate time slots
    const timeSlotSet = new Set(timeSlots.map(slot => slot.timeSlot));
    if (timeSlotSet.size !== timeSlots.length) {
      throw new HttpException({
        message: 'Duplicate time slots found',
        vnMessage: 'Có khung giờ bị trùng lặp'
      }, HttpStatus.BAD_REQUEST);
    }

    for (const timeSlot of timeSlots) {
      if (timeSlot.frequency < 1) {
        throw new HttpException({
          message: 'Frequency must be greater than 0',
          vnMessage: 'Số chuyến phải lớn hơn 0'
        }, HttpStatus.BAD_REQUEST);
      }

      if (timeSlot.vehicles.length === 0) {
        throw new HttpException({
          message: 'Each time slot must have at least one vehicle',
          vnMessage: 'Mỗi khung giờ phải có ít nhất một xe'
        }, HttpStatus.BAD_REQUEST);
      }
    }
  }
}