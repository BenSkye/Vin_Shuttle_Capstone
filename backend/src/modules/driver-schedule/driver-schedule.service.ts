import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DRIVERSCHEDULE_GATEWAY, DRIVERSCHEDULE_REPOSITORY } from "src/modules/driver-schedule/driver-schedule.di-token";
import { driverScheduleParams, ICreateDriverSchedule, IUpdateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { DriverScheduleGateway } from "src/modules/driver-schedule/driver-schedule.gateway";
import { IDriverScheduleRepository, IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";
import { DriverScheduleDocument } from "src/modules/driver-schedule/driver-schedule.schema";
import { TRACKING_SERVICE } from "src/modules/tracking/tracking.di-token";
import { ITrackingService } from "src/modules/tracking/tracking.port";
import { USER_REPOSITORY } from "src/modules/users/users.di-token";
import { IUserRepository } from "src/modules/users/users.port";
import { UserDocument } from "src/modules/users/users.schema";
import { VEHICLE_REPOSITORY } from "src/modules/vehicles/vehicles.di-token";
import { IVehiclesRepository } from "src/modules/vehicles/vehicles.port";
import { VehicleDocument } from "src/modules/vehicles/vehicles.schema";
import { DriverSchedulesStatus, Shift, ShiftDifference, ShiftHours, UserRole, UserStatus } from "src/share/enums";
import { VehicleCondition, VehicleOperationStatus } from "src/share/enums/vehicle.enum";
import { DateUtils } from "src/share/utils";


@Injectable()
export class DriverScheduleService implements IDriverScheduleService {
  constructor(
    @Inject(DRIVERSCHEDULE_REPOSITORY)
    private readonly driverScheduleRepository: IDriverScheduleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehiclesRepository,
    @Inject(DRIVERSCHEDULE_GATEWAY)
    private readonly driverScheduleGateway: DriverScheduleGateway,
    @Inject(TRACKING_SERVICE)
    private readonly trackingService: ITrackingService

  ) { }


  async createListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<DriverScheduleDocument[]> {
    const newDriverSchedules = [];
    //check if driverSchedule of driverSchedules is have same 
    await this.checkListDriverSchedule(driverSchedules);
    for (const driverSchedule of driverSchedules) {
      const newDriverSchedule = await this.driverScheduleRepository.createDriverSchedule(driverSchedule);
      newDriverSchedules.push(newDriverSchedule);
    }
    return newDriverSchedules;
  }

  async checkListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<boolean> {
    // check not have same date and shift in array and in database
    for (const schedule of driverSchedules) {
      console.log('schedule.driver', schedule.driver)
      const driver = await this.userRepository.getUserById(schedule.driver.toString(), ['status', 'role', 'name']);
      console.log('driver', driver);
      if (driver.status !== UserStatus.ACTIVE || !driver || driver.role !== UserRole.DRIVER) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Driver ${driver.name} is not active`,
          vnMessage: `Tài xế ${driver.name} không sẵn sàng`
        }, HttpStatus.BAD_REQUEST);
      }

      const vehicle = await this.vehicleRepository.getById(schedule.vehicle.toString());
      if (!vehicle) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Vehicle ${schedule.vehicle} not found`,
          vnMessage: `Không tìm thấy xe ${schedule.vehicle}`

        }, HttpStatus.BAD_REQUEST);
      }
      if (vehicle.vehicleCondition !== VehicleCondition.IN_USE) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Vehicle ${schedule.vehicle} is not available`,
          vnMessage: `Xe ${schedule.vehicle} không sẵn sàng`
        }, HttpStatus.BAD_REQUEST);
      }

      const isExistScheduleWithDriver = await this.driverScheduleRepository.findOneDriverSchedule({
        date: schedule.date,
        driver: schedule.driver
      }, ['driver', 'date']
      );
      if (isExistScheduleWithDriver) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Duplicate date shift with driver ${isExistScheduleWithDriver.date.toISOString().split('T')[0]}-${isExistScheduleWithDriver.driver.name} in database`,
          vnMessage: `Trùng lịch ${isExistScheduleWithDriver.date.toISOString().split('T')[0]}-${isExistScheduleWithDriver.driver.name}`
        }, HttpStatus.BAD_REQUEST);
      }

      const isExistScheduleWithVehicle = await this.driverScheduleRepository.findOneDriverSchedule({
        date: schedule.date,
        vehicle: schedule.vehicle
      }, ['vehicle', 'date']
      );
      if (isExistScheduleWithVehicle) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Duplicate date shift with vehicle ${isExistScheduleWithVehicle.date.toISOString().split('T')[0]}-${isExistScheduleWithVehicle.vehicle.name} in database`,
          vnMessage: `Trùng lịch ${isExistScheduleWithVehicle.date.toISOString().split('T')[0]}-${isExistScheduleWithVehicle.vehicle.name}`
        }, HttpStatus.BAD_REQUEST);
      }
    }

    const seen = new Set<string>();
    for (const schedule of driverSchedules) {
      console.log(schedule.date);
      const keyWithDriver = `${schedule.date}-${schedule.driver}`;
      const keyWithVehicle = `${schedule.date}-${schedule.vehicle}`;
      if (seen.has(keyWithDriver)) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Duplicate date shift with driver ${keyWithDriver} in list`,
          vnMessage: `Trùng lịch ${keyWithDriver}`
        }, HttpStatus.BAD_REQUEST);
      }
      if (seen.has(keyWithVehicle)) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Duplicate date shift with vehicle  ${keyWithVehicle} in list`,
          vnMessage: `Trùng lịch ${keyWithVehicle}`
        }, HttpStatus.BAD_REQUEST);
      }
      seen.add(keyWithDriver)
      seen.add(keyWithVehicle)
    }

    return true;
  }

  async createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument> {
    const listDriverSchedule = [driverSchedule];
    await this.checkListDriverSchedule(listDriverSchedule);
    const newDriverSchedule = await this.driverScheduleRepository.createDriverSchedule(driverSchedule);
    if (!newDriverSchedule) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Create driver schedule failed',
        vnMessage: 'Tạo lịch không thành công'
      }, HttpStatus.BAD_REQUEST);
    }
    return newDriverSchedule;
  }

  async updateDriverSchedule(id: string, driverScheduledto: IUpdateDriverSchedule): Promise<DriverScheduleDocument> {
    const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(id);
    if (!driverSchedule) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Driver Schedule not found',
        vnMessage: `Không tìm thấy lịch`,
      }, HttpStatus.NOT_FOUND);
    }
    if (driverSchedule.status !== DriverSchedulesStatus.NOT_STARTED) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot update schedule that has started',
        vnMessage: 'Không thể cập nhật lịch đã chấm công',
      }, HttpStatus.BAD_REQUEST);
    }
    const currentDate = DateUtils.toUTCDate(new Date())
      .utc()      // Ensure we're in UTC mode
      .startOf('day')
      .toDate();
    if (driverSchedule.date < currentDate) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot update schedule with past date',
        vnMessage: 'Không thể cập nhật lịch với ngày trong quá khứ',
      }, HttpStatus.BAD_REQUEST);
    }
    const driver = await this.userRepository.getUserById(driverScheduledto.driver.toString(), ['status', 'role', 'name']);
    if (!driver || driver.status !== UserStatus.ACTIVE || driver.role !== UserRole.DRIVER) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Driver ${driver?.name || driverScheduledto.driver} is not active or not a driver`,
        vnMessage: `Tài xế ${driver?.name || driverScheduledto.driver} không sẵn sàng hoặc không phải là tài xế`,
      }, HttpStatus.BAD_REQUEST);
    }
    const vehicle = await this.vehicleRepository.getById(driverScheduledto.vehicle.toString());
    if (!vehicle) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Vehicle ${driverScheduledto.vehicle} not found`,
        vnMessage: `Không tìm thấy xe ${driverScheduledto.vehicle}`,
      }, HttpStatus.BAD_REQUEST);
    }
    if (vehicle.vehicleCondition !== VehicleCondition.IN_USE) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Vehicle ${driverScheduledto.vehicle} is not available`,
        vnMessage: `Xe ${driverScheduledto.vehicle} không sẵn sàng`,
      }, HttpStatus.BAD_REQUEST);
    }

    const isExistScheduleWithDriver = await this.driverScheduleRepository.findOneDriverSchedule({
      date: driverScheduledto.date,
      driver: driverScheduledto.driver,
      _id: { $ne: id },
    }, ['driver', 'date']);
    if (isExistScheduleWithDriver) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Duplicate date shift with driver ${isExistScheduleWithDriver.date.toISOString().split('T')[0]}-${isExistScheduleWithDriver.driver.name} in database`,
        vnMessage: `Trùng lịch ${isExistScheduleWithDriver.date.toISOString().split('T')[0]}-${isExistScheduleWithDriver.driver.name}`,
      }, HttpStatus.BAD_REQUEST);
    }
    const isExistScheduleWithVehicle = await this.driverScheduleRepository.findOneDriverSchedule({
      date: driverScheduledto.date,
      vehicle: driverScheduledto.vehicle,
      _id: { $ne: id }, // Loại trừ lịch hiện tại
    }, []);
    if (isExistScheduleWithVehicle) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Duplicate date shift with vehicle ${isExistScheduleWithVehicle.date.toISOString().split('T')[0]}-${isExistScheduleWithVehicle.vehicle.name} in database`,
        vnMessage: `Trùng lịch ${isExistScheduleWithVehicle.date.toISOString().split('T')[0]}-${isExistScheduleWithVehicle.vehicle.name}`,
      }, HttpStatus.BAD_REQUEST);
    }
    const updatedDriverSchedule = await this.driverScheduleRepository.updateDriverSchedule(id, driverScheduledto);
    return updatedDriverSchedule;
  }

  async getDriverNotScheduledInDate(date: Date): Promise<UserDocument[]> {
    const driverSchedules = await this.driverScheduleRepository.getDriverSchedules({
      date: date
    }, ['driver']);
    const driverIds = driverSchedules.map(schedule => schedule.driver._id.toString());
    const drivers = await this.userRepository.findManyUsers({
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
      _id: { $nin: driverIds }
    }, ['_id', 'name', 'phone']);
    return drivers;
  }

  async getVehicleNotScheduledInDate(date: Date): Promise<VehicleDocument[]> {
    const driverSchedules = await this.driverScheduleRepository.getDriverSchedules({
      date: date
    }, ['vehicle']);
    const vehicleIds = driverSchedules.map(schedule => schedule.vehicle._id.toString());
    const vehicles = await this.vehicleRepository.getListVehicles({
      _id: { $nin: vehicleIds },
      vehicleCondition: VehicleCondition.IN_USE
    }, []);
    return vehicles;
  }

  async getDriverScheduleById(id: string): Promise<DriverScheduleDocument> {
    const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(id);
    return driverSchedule;
  }

  async getPersonalSchedulesFromStartToEnd(driverId: string, start: Date, end: Date): Promise<DriverScheduleDocument[]> {
    // get all driver schedule from start to end
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid date',
        vnMessage: `Ngày không hợp lệ`,
      }, HttpStatus.BAD_REQUEST);
    }
    const schedules = await this.driverScheduleRepository.getDriverSchedules({
      driver: driverId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }, []);
    return schedules;
  }

  async getAllDriverSchedules(): Promise<DriverScheduleDocument[]> {
    const driverSchedules = await this.driverScheduleRepository.getAllDriverSchedules();
    return driverSchedules;
  }

  async getScheduleFromStartToEnd(start: Date, end: Date): Promise<DriverScheduleDocument[]> {
    // get all driver schedule from start to end
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid date',
        vnMessage: `Ngày không hợp lệ`,
      }, HttpStatus.BAD_REQUEST);
    }
    const schedules = await this.driverScheduleRepository.getDriverSchedules({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }, []);
    return schedules;
  }

  async getDriverSchedules(query: driverScheduleParams): Promise<DriverScheduleDocument[]> {
    const driverSchedules = await this.driverScheduleRepository.getDriverSchedules(query, []);
    return driverSchedules;
  }

  async driverCheckIn(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument> {
    // get current time,
    const currentTime = new Date();
    console.log('driverScheduleId', driverScheduleId)
    const driverSchedule = await
      this.driverScheduleRepository.findOneDriverSchedule(
        {
          _id: driverScheduleId,
          driver: driverId
        }, []);
    if (!driverSchedule) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Driver Schedule not found',
        vnMessage: `Không tìm thấy lịch`,
      }, HttpStatus.NOT_FOUND);
    }
    if (driverSchedule.status !== DriverSchedulesStatus.NOT_STARTED) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Driver schedule has started or completed',
        vnMessage: 'Đã chấm công',
      }, HttpStatus.BAD_REQUEST);
    }
    const shift = driverSchedule.shift;
    const shiftHours = ShiftHours[shift];

    const expectedCheckin = new Date(driverSchedule.date);
    expectedCheckin.setHours(shiftHours.start, ShiftDifference.IN, 0, 0);

    const expectedCheckout = new Date(driverSchedule.date);
    expectedCheckout.setHours(shiftHours.end, ShiftDifference.OUT, 0, 0);

    console.log('shiftHours', shiftHours)
    console.log('expectedCheckin', expectedCheckin)
    console.log('expectedCheckout', expectedCheckout)
    console.log('currentTime', currentTime)

    if (currentTime < expectedCheckin || currentTime > expectedCheckout) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Driver schedule is not in shift time',
        vnMessage: 'Không trong ca làm',
      }, HttpStatus.BAD_REQUEST);
    }

    await this.vehicleRepository.updateOperationStatus(
      driverSchedule.vehicle._id.toString(),
      VehicleOperationStatus.RUNNING
    )

    driverSchedule.status = DriverSchedulesStatus.IN_PROGRESS;
    driverSchedule.checkinTime = currentTime;
    if (currentTime.getTime() > expectedCheckin.getTime() - ShiftDifference.IN) {
      driverSchedule.isLate = true
    }

    const scheduleUpdate = await this.driverScheduleRepository.updateDriverSchedule(
      driverScheduleId,
      {
        status: driverSchedule.status,
        checkinTime: driverSchedule.checkinTime,
        isLate: driverSchedule.isLate
      }
    );

    if (!scheduleUpdate) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Update driver schedule failed',
        vnMessage: 'Cập nhật lịch không thành công'
      }, HttpStatus.BAD_REQUEST);
    }

    await this.driverScheduleGateway.handleDriverCheckin(driverId, scheduleUpdate.vehicle.toString());
    return scheduleUpdate;
  }

  async driverCheckOut(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument> {
    const currentTime = new Date();
    const driverSchedule = await
      this.driverScheduleRepository.findOneDriverSchedule(
        {
          _id: driverScheduleId,
          driver: driverId
        }, []);
    if (!driverSchedule) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Driver Schedule not found',
        vnMessage: `Không tìm thấy lịch`,
      }, HttpStatus.NOT_FOUND);
    }
    // Validate schedule status
    if (driverSchedule.status !== DriverSchedulesStatus.IN_PROGRESS) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Schedule must be in progress to checkout',
        vnMessage: 'Không thể kết ca',
      }, HttpStatus.BAD_REQUEST);
    }
    await this.vehicleRepository.updateOperationStatus(
      driverSchedule.vehicle._id.toString(),
      VehicleOperationStatus.PENDING
    )

    // Calculate expected checkout time
    const shift = driverSchedule.shift as Shift;
    const shiftEndHour = ShiftHours[shift].end;
    const expectedCheckout = new Date(driverSchedule.date);
    expectedCheckout.setHours(shiftEndHour, 0, 0, 0);

    // Validate checkout time
    if (currentTime < expectedCheckout) {
      driverSchedule.isEarlyCheckout = true;
    }

    // Update schedule
    driverSchedule.status = DriverSchedulesStatus.COMPLETED;
    driverSchedule.checkoutTime = currentTime;

    const scheduleUpdate = await this.driverScheduleRepository.updateDriverSchedule(
      driverScheduleId,
      {
        status: driverSchedule.status,
        checkoutTime: driverSchedule.checkoutTime,
        isEarlyCheckout: driverSchedule.isEarlyCheckout
      }
    );

    await this.driverScheduleGateway.handleDriverCheckout(driverId);
    await this.trackingService.deleteLastVehicleLocation(driverSchedule.vehicle.toString());

    return scheduleUpdate
  }

  @Cron('0 20 * * * *', {
    name: 'autoCheckoutPendingSchedules',
  })
  async autoCheckoutPendingSchedules() {
    console.log('Running auto checkout for pending schedules...');
    const currentTime = new Date();

    // Lấy tất cả các ca đang trong trạng thái IN_PROGRESS
    const pendingSchedules = await this.driverScheduleRepository.getDriverSchedules({
      status: DriverSchedulesStatus.IN_PROGRESS,
    }, []);

    for (const schedule of pendingSchedules) {
      const shift = schedule.shift as Shift;
      const shiftEndHour = ShiftHours[shift].end;
      const expectedCheckout = new Date(schedule.date);
      expectedCheckout.setHours(shiftEndHour + ShiftDifference.OUT, 0, 0, 0); //add 15 minutes to shift end time

      // Nếu thời gian hiện tại đã qua thời gian expectedCheckout, thực hiện checkout
      if (currentTime > expectedCheckout) {
        await this.vehicleRepository.updateOperationStatus(
          schedule.vehicle._id.toString(),
          VehicleOperationStatus.PENDING
        );

        schedule.status = DriverSchedulesStatus.COMPLETED;
        schedule.checkoutTime = currentTime;
        schedule.isEarlyCheckout = false; // Không phải là checkout sớm vì đã quá giờ

        await this.driverScheduleRepository.updateDriverSchedule(
          schedule._id.toString(),
          {
            status: schedule.status,
            checkoutTime: schedule.checkoutTime,
            isEarlyCheckout: schedule.isEarlyCheckout,
          });

        await this.driverScheduleGateway.handleDriverCheckout(schedule.driver._id.toString());
        await this.trackingService.deleteLastVehicleLocation(schedule.vehicle._id.toString());
        console.log(`Auto checkout for schedule ${schedule._id} completed.`);
      }
    }

    //Lấy tất cả các ca đang ở trạng tháiNOT_STARTED trong và trước ngày hôm nay
    const notStartedSchedules = await this.driverScheduleRepository.getDriverSchedules({
      status: DriverSchedulesStatus.NOT_STARTED,
      date: {
        $lte: currentTime
      },
    }, []);

    for (const schedule of notStartedSchedules) {
      const shift = schedule.shift as Shift;
      const shiftEndHour = ShiftHours[shift].end;
      const expectedCheckout = new Date(schedule.date);
      expectedCheckout.setHours(shiftEndHour + ShiftDifference.OUT, 0, 0, 0); //add 15 minutes to shift end time

      // Nếu thời gian hiện tại đã qua thời gian expectedCheckout, chuyển trạng thái sang Dropped
      if (currentTime > expectedCheckout) {
        await this.vehicleRepository.updateOperationStatus(
          schedule.vehicle._id.toString(),
          VehicleOperationStatus.PENDING
        );
        schedule.status = DriverSchedulesStatus.DROPPED_OFF;

        await this.driverScheduleRepository.updateDriverSchedule(
          schedule._id.toString(),
          {
            status: schedule.status,
          });

        // await this.driverScheduleGateway.handleDriverCheckout(schedule.driver._id.toString());

        console.log(`Auto checkout for schedule ${schedule._id} completed.`);
      }
    }
  }
}