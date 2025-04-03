import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBusScheduleService, IBusScheduleRepository } from './bus-schedule.port';
import { BusScheduleDocument } from './bus-schedule.schema';
import { CreateBusScheduleDto, DriverAssignment, GeneratedBusTrip } from './bus-schedule.dto';
import { BUS_SCHEDULE_REPOSITORY } from './bus-schedule.di-token';
import { BUS_ROUTE_SERVICE } from '../bus-route/bus-route.di-token';
import { VEHICLE_SERVICE } from '../vehicles/vehicles.di-token';
import { DRIVER_BUS_SCHEDULE_SERVICE } from '../driver-bus-schedule/driver-bus-schedule.di-token';
import { IBusRouteService } from '../bus-route/bus-route.port';
import { IVehiclesService } from '../vehicles/vehicles.port';
import { IDriverBusScheduleService } from '../driver-bus-schedule/driver-bus-schedule.port';
import { BusScheduleStatus } from '../../share/enums/bus-schedule.enum';
import moment from 'moment';
import { VehicleOperationStatus } from '../../share/enums/vehicle.enum';

@Injectable()
export class BusScheduleService implements IBusScheduleService {
  constructor(
    @Inject(BUS_SCHEDULE_REPOSITORY)
    private readonly busScheduleRepository: IBusScheduleRepository,
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
    @Inject(VEHICLE_SERVICE)
    private readonly vehicleService: IVehiclesService,
    @Inject(DRIVER_BUS_SCHEDULE_SERVICE)
    private readonly driverBusScheduleService: IDriverBusScheduleService,
  ) {}

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  private async validateScheduleInput(dto: CreateBusScheduleDto): Promise<void> {
    // Validate bus route exists
    const route = await this.busRouteService.getRouteById(dto.busRoute);
    if (!route) {
      throw new NotFoundException('Bus route not found');
    }

    // Validate vehicles exist
    for (const vehicleId of dto.vehicles) {
      const vehicle = await this.vehicleService.findById(vehicleId);
      if (!vehicle) {
        throw new NotFoundException(`Vehicle ${vehicleId} not found`);
      }
    }

    // Validate time format
    const startTime = moment(dto.dailyStartTime, 'HH:mm');
    const endTime = moment(dto.dailyEndTime, 'HH:mm');

    if (!startTime.isValid() || !endTime.isValid()) {
      throw new BadRequestException('Invalid time format. Use HH:mm');
    }

    if (endTime.isSameOrBefore(startTime)) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private generateInitialDriverAssignments(
    drivers: string[],
    vehicles: string[],
    startTime: string,
    endTime: string,
    effectiveDate: Date
  ): DriverAssignment[] {
    const assignments: DriverAssignment[] = [];
    const numDrivers = drivers.length;
    const numVehicles = vehicles.length;

    // Ensure we have enough drivers and vehicles
    if (numDrivers === 0 || numVehicles === 0) {
      return assignments;
    }

    // Get base date from effectiveDate
    const baseDate = new Date(effectiveDate);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Create assignments cycling through available drivers and vehicles
    for (let i = 0; i < Math.min(numDrivers, numVehicles); i++) {
      const assignmentStartTime = new Date(baseDate);
      assignmentStartTime.setHours(startHour, startMinute, 0, 0);

      const assignmentEndTime = new Date(baseDate);
      assignmentEndTime.setHours(endHour, endMinute, 0, 0);

      assignments.push({  
        driverId: drivers[i % numDrivers],
        vehicleId: vehicles[i % numVehicles],
        startTime: assignmentStartTime,
        endTime: assignmentEndTime
      });
    }

    return assignments;
  }

  async createSchedule(dto: CreateBusScheduleDto): Promise<BusScheduleDocument> {
    await this.validateScheduleInput(dto);

    // Generate initial driver assignments with effectiveDate
    const driverAssignments = this.generateInitialDriverAssignments(
      dto.drivers,
      dto.vehicles,
      dto.dailyStartTime,
      dto.dailyEndTime,
      dto.effectiveDate
    );

    // Create the bus schedule
    const schedule = await this.busScheduleRepository.create({
      ...dto,
      driverAssignments
    });

    // Calculate trip duration based on route's estimated duration
    const route = await this.busRouteService.getRouteById(dto.busRoute);
    const tripDuration = route.estimatedDuration; // in minutes

    // Generate driver bus schedules for each trip
    const startTime = moment(dto.dailyStartTime, 'HH:mm');
    const endTime = moment(dto.dailyEndTime, 'HH:mm');
    const totalMinutes = endTime.diff(startTime, 'minutes');
    const tripsPerDriver = Math.floor(totalMinutes / tripDuration);

    // Create driver bus schedules for each assignment
    for (const assignment of driverAssignments) {
      for (let tripNumber = 1; tripNumber <= tripsPerDriver; tripNumber++) {
        const tripStartTime = moment(startTime).add((tripNumber - 1) * tripDuration, 'minutes');
        const tripEndTime = moment(tripStartTime).add(tripDuration, 'minutes');

        if (tripEndTime.isAfter(endTime)) {
          break;
        }

        await this.driverBusScheduleService.createSchedule({
          driver: assignment.driverId,
          busRoute: dto.busRoute,
          vehicle: assignment.vehicleId,
          startTime: tripStartTime.toDate(),
          endTime: tripEndTime.toDate(),
          tripNumber,
          status: BusScheduleStatus.ACTIVE
        });
      }
    }

    return schedule;
  }

  async generateDailyTrips(scheduleId: string, date: Date): Promise<GeneratedBusTrip[]> {
    const schedule = await this.busScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new HttpException({
        message: 'Schedule not found',
        vnMessage: 'Không tìm thấy lịch trình'
      }, HttpStatus.NOT_FOUND);
    }

    const route = await this.busRouteService.getRouteById(schedule.busRoute.toString());
    const trips: GeneratedBusTrip[] = [];
    
    // Calculate time between trips
    const startTime = this.parseTime(schedule.dailyStartTime);
    const endTime = this.parseTime(schedule.dailyEndTime);
    const totalMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    const minutesBetweenTrips = Math.floor(totalMinutes / schedule.tripsPerDay);

    // Generate trips with rotating drivers and vehicles
    let currentTime = startTime;
    let driverIndex = 0;
    let vehicleIndex = 0;

    for (let i = 0; i < schedule.tripsPerDay; i++) {
      const trip: GeneratedBusTrip = {
        busRoute: schedule.busRoute.toString(),
        vehicle: schedule.vehicles[vehicleIndex].toString(),
        driver: schedule.drivers[driverIndex].toString(),
        startTime: new Date(currentTime),
        endTime: this.addMinutes(currentTime, route.estimatedDuration),
        estimatedDuration: route.estimatedDuration,
        status: BusScheduleStatus.ACTIVE
      };

      trips.push(trip);

      // Rotate to next driver and vehicle
      driverIndex = (driverIndex + 1) % schedule.drivers.length;
      vehicleIndex = (vehicleIndex + 1) % schedule.vehicles.length;
      currentTime = this.addMinutes(currentTime, minutesBetweenTrips);
    }

    return trips;
  }

  async getActiveScheduleByRoute(routeId: string): Promise<BusScheduleDocument> {
    return await this.busScheduleRepository.findActiveByRoute(routeId);
  }

  async updateSchedule(id: string, dto: CreateBusScheduleDto): Promise<BusScheduleDocument> {
    const existingSchedule = await this.busScheduleRepository.findById(id);
    if (!existingSchedule) {
      throw new HttpException(
        {
          message: 'Schedule not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.validateScheduleInput(dto);

    // Reset old vehicle statuses to PENDING
    for (const vehicleId of existingSchedule.vehicles) {
      await this.vehicleService.update(vehicleId.toString(), {
        operationStatus: VehicleOperationStatus.PENDING
      });
    }

    // Generate new driver assignments
    const driverAssignments = this.generateInitialDriverAssignments(
      dto.drivers,
      dto.vehicles,
      dto.dailyStartTime,
      dto.dailyEndTime,
      dto.effectiveDate
    );

    // Update bus schedule
    const updatedSchedule = await this.busScheduleRepository.update(id, {
      ...dto,
      driverAssignments,
      status: BusScheduleStatus.ACTIVE
    });

    // Generate new trips
    const trips = await this.generateDailyTrips(id, dto.effectiveDate);
    
    // Update driver schedules
    for (const trip of trips) {
      await this.driverBusScheduleService.createSchedule({
        driver: trip.driver,
        vehicle: trip.vehicle,
        busRoute: trip.busRoute,
        startTime: new Date(trip.startTime),
        endTime: new Date(trip.endTime),
        tripNumber: trips.indexOf(trip) + 1,
        status: BusScheduleStatus.ACTIVE
      });
    }

    // Update new vehicle statuses to RUNNING
    for (const vehicleId of dto.vehicles) {
      await this.vehicleService.update(vehicleId, {
        operationStatus: VehicleOperationStatus.RUNNING
      });
    }

    return updatedSchedule;
  }

  async deleteSchedule(id: string): Promise<void> {
    const schedule = await this.busScheduleRepository.findById(id);
    if (!schedule) {
      throw new HttpException(
        {
          message: 'Schedule not found',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Reset vehicle statuses to PENDING
    for (const vehicleId of schedule.vehicles) {
      await this.vehicleService.update(vehicleId.toString(), {
        operationStatus: VehicleOperationStatus.PENDING
      });
    }

    await this.busScheduleRepository.delete(id);
  }
}