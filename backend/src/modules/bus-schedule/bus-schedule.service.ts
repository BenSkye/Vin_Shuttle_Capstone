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
    // 1. Validate input cơ bản
    await this.validateScheduleInput(dto);

    // 2. Validate và xử lý driverAssignments
    let finalDriverAssignments: DriverAssignment[];

    if (dto.driverAssignments && dto.driverAssignments.length > 0) {
      // Validate driverAssignments từ request
      await this.validateDriverAssignments(dto.driverAssignments, dto.drivers, dto.vehicles);
      finalDriverAssignments = dto.driverAssignments;
    } else {
      // Tự động tạo driverAssignments
      finalDriverAssignments = this.generateInitialDriverAssignments(
        dto.drivers,
        dto.vehicles,
        dto.dailyStartTime,
        dto.dailyEndTime,
        dto.effectiveDate
      );
    }

    // 3. Validate số lượng và khả năng phân công
    if (finalDriverAssignments.length === 0) {
      throw new BadRequestException({
        message: 'No valid driver assignments could be created',
        vnMessage: 'Không thể tạo phân công tài xế hợp lệ'
      });
    }

    // 4. Kiểm tra trạng thái và khả dụng của tài xế và xe
    await this.validateResourcesAvailability(finalDriverAssignments, dto.effectiveDate);

    // 5. Create the bus schedule
    const schedule = await this.busScheduleRepository.create({
      ...dto,
      driverAssignments: finalDriverAssignments
    });

    try {
      // 6. Cập nhật trạng thái xe và tạo lịch trình chi tiết
      await this.createDetailedSchedules(schedule, finalDriverAssignments);
      
      return schedule;
    } catch (error) {
      // Nếu có lỗi, rollback lại các thay đổi
      await this.busScheduleRepository.delete(schedule._id.toString());
      throw error;
    }
  }

  // Thêm các hàm validation mới
  private async validateDriverAssignments(
    assignments: DriverAssignment[],
    allowedDrivers: string[],
    allowedVehicles: string[]
  ): Promise<void> {
    // 1. Validate thời gian của mỗi assignment
    for (const assignment of assignments) {
      // Kiểm tra định dạng thời gian
      if (!moment(assignment.startTime).isValid() || !moment(assignment.endTime).isValid()) {
        throw new BadRequestException('Invalid time format in driver assignments');
      }

      // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
      if (moment(assignment.endTime).isSameOrBefore(moment(assignment.startTime))) {
        throw new BadRequestException('End time must be after start time in driver assignments');
      }

      // Kiểm tra tài xế và xe có trong danh sách cho phép
      if (!allowedDrivers.includes(assignment.driverId.toString())) {
        throw new BadRequestException(`Driver ${assignment.driverId} is not in the allowed drivers list`);
      }

      if (!allowedVehicles.includes(assignment.vehicleId.toString())) {
        throw new BadRequestException(`Vehicle ${assignment.vehicleId} is not in the allowed vehicles list`);
      }
    }

    // 2. Kiểm tra xung đột thời gian giữa các assignments
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        if (this.hasTimeOverlap(assignments[i], assignments[j])) {
          // Kiểm tra xung đột tài xế
          if (assignments[i].driverId === assignments[j].driverId) {
            throw new BadRequestException('Driver has overlapping assignments');
          }
          // Kiểm tra xung đột xe
          if (assignments[i].vehicleId === assignments[j].vehicleId) {
            throw new BadRequestException('Vehicle has overlapping assignments');
          }
        }
      }
    }
  }

  private async validateResourcesAvailability(
    assignments: DriverAssignment[],
    effectiveDate: Date
  ): Promise<void> {
    for (const assignment of assignments) {
      // Kiểm tra tài xế có lịch trình khác trong cùng thời gian không
      const driverConflicts = await this.driverBusScheduleService.checkDriverAvailability(
        assignment.driverId,
        assignment.startTime,
        assignment.endTime,
        effectiveDate
      );

      if (driverConflicts) {
        throw new BadRequestException(`Driver ${assignment.driverId} has conflicting schedule`);
      }

      // Kiểm tra xe có đang được sử dụng không
      const vehicle = await this.vehicleService.findById(assignment.vehicleId);
      if (!vehicle || vehicle.operationStatus === VehicleOperationStatus.CHARGING) {
        throw new BadRequestException(`Vehicle ${assignment.vehicleId} is not available`);
      }
    }
  }

  private hasTimeOverlap(assignment1: DriverAssignment, assignment2: DriverAssignment): boolean {
    const start1 = moment(assignment1.startTime);
    const end1 = moment(assignment1.endTime);
    const start2 = moment(assignment2.startTime);
    const end2 = moment(assignment2.endTime);

    return start1.isBefore(end2) && start2.isBefore(end1);
  }

  private async createDetailedSchedules(
  schedule: BusScheduleDocument,
  driverAssignments: DriverAssignment[]
): Promise<void> {
  // Lấy thông tin tuyến xe
  const route = await this.busRouteService.getRouteById(schedule.busRoute.toString());
  const tripDuration = route.estimatedDuration;

  // Tính toán tổng thời gian hoạt động trong ngày
  const dailyStartTime = moment(schedule.dailyStartTime, 'HH:mm');
  const dailyEndTime = moment(schedule.dailyEndTime, 'HH:mm');
  const totalMinutesPerDay = dailyEndTime.diff(dailyStartTime, 'minutes');
  
  // Tính thời gian giữa các chuyến dựa trên số chuyến mỗi ngày
  const minutesBetweenTrips = Math.floor(totalMinutesPerDay / schedule.tripsPerDay);

  // Tạo lịch trình chi tiết cho từng phân công
  for (const assignment of driverAssignments) {
    let currentTripStart = moment(assignment.startTime);
    let tripNumber = 1;

    // Tạo các chuyến xe cho tài xế này
    while (
      tripNumber <= schedule.tripsPerDay && 
      currentTripStart.clone().add(tripDuration, 'minutes').isSameOrBefore(moment(assignment.endTime))
    ) {
      const tripEndTime = currentTripStart.clone().add(tripDuration, 'minutes');

      await this.driverBusScheduleService.createSchedule({
        driver: assignment.driverId,
        busRoute: schedule.busRoute.toString(),
        vehicle: assignment.vehicleId,
        startTime: currentTripStart.toDate(),
        endTime: tripEndTime.toDate(),
        tripNumber,
        status: BusScheduleStatus.ACTIVE
      });

      // Cập nhật thời gian bắt đầu cho chuyến tiếp theo
      currentTripStart = currentTripStart.add(minutesBetweenTrips, 'minutes');
      tripNumber++;
    }

    // Cập nhật trạng thái xe
    await this.vehicleService.update(assignment.vehicleId, {
      operationStatus: VehicleOperationStatus.RUNNING
    });
  }
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
  
  // Sử dụng ngày được truyền vào để tạo các chuyến xe
  const targetDate = moment(date).startOf('day');
  
  // Parse thời gian bắt đầu và kết thúc từ schedule
  const [startHour, startMinute] = schedule.dailyStartTime.split(':').map(Number);
  const [endHour, endMinute] = schedule.dailyEndTime.split(':').map(Number);

  // Tạo thời gian bắt đầu và kết thúc cho ngày cụ thể
  const startTime = targetDate.clone().set({ hour: startHour, minute: startMinute }).toDate();
  const endTime = targetDate.clone().set({ hour: endHour, minute: endMinute }).toDate();
  
  // Tính toán khoảng thời gian giữa các chuyến
  const totalMinutes = moment(endTime).diff(moment(startTime), 'minutes');
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
      endTime: moment(currentTime).add(route.estimatedDuration, 'minutes').toDate(),
      estimatedDuration: route.estimatedDuration,
      status: BusScheduleStatus.ACTIVE
    };

    trips.push(trip);

    // Rotate to next driver and vehicle
    driverIndex = (driverIndex + 1) % schedule.drivers.length;
    vehicleIndex = (vehicleIndex + 1) % schedule.vehicles.length;
    
    // Cập nhật thời gian cho chuyến tiếp theo
    currentTime = moment(currentTime).add(minutesBetweenTrips, 'minutes').toDate();
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