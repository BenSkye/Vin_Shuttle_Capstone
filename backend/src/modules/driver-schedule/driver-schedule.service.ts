import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { DRIVERSCHEDULE_REPOSITORY } from "src/modules/driver-schedule/driver-schedule.di-token";
import { ICreateDriverSchedule, IUpdateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { IDriverScheduleRepository, IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";
import { DriverSchedule, DriverScheduleDocument } from "src/modules/driver-schedule/driver-schedule.schema";
import { USER_REPOSITORY } from "src/modules/users/users.di-token";
import { IUserRepository } from "src/modules/users/users.port";
import { VEHICLE_REPOSITORY } from "src/modules/vehicles/vehicles.di-token";
import { IVehiclesRepository } from "src/modules/vehicles/vehicles.port";
import { DriverSchedulesStatus, Shift, ShiftDifference, ShiftHours, UserRole, UserStatus } from "src/share/enums";
import { VehicleCondition } from "src/share/enums/vehicle.enum";


@Injectable()
export class DriverScheduleService implements IDriverScheduleService {
    constructor(
        @Inject(DRIVERSCHEDULE_REPOSITORY)
        private readonly driverScheduleRepository: IDriverScheduleRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(VEHICLE_REPOSITORY)
        private readonly vehicleRepository: IVehiclesRepository
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
            const driver = await this.userRepository.getUserById(schedule.driver, ['status', 'role', 'name']);
            console.log('driver', driver);
            if (driver.status !== UserStatus.ACTIVE || !driver || driver.role !== UserRole.DRIVER) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Driver ${driver.name} is not active`
                }, HttpStatus.BAD_REQUEST);
            }

            const vehicle = await this.vehicleRepository.getById(schedule.vehicle);
            if (!vehicle) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Vehicle ${schedule.vehicle} not found`
                }, HttpStatus.BAD_REQUEST);
            }
            if (vehicle.vehicleCondition !== VehicleCondition.AVAILABLE) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Vehicle ${schedule.vehicle} is not available`
                }, HttpStatus.BAD_REQUEST);
            }

            const isExistScheduleWithDriver = await this.driverScheduleRepository.findOneDriverSchedule({
                date: schedule.date,
                shift: schedule.shift,
                driver: schedule.driver
            }, []
            );
            if (isExistScheduleWithDriver) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date shift with driver ${schedule.date}-${schedule.shift}-${schedule.driver} in database`
                }, HttpStatus.BAD_REQUEST);
            }

            const isExistScheduleWithVehicle = await this.driverScheduleRepository.findOneDriverSchedule({
                date: schedule.date,
                shift: schedule.shift,
                vehicle: schedule.vehicle
            }, []
            );
            if (isExistScheduleWithVehicle) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date shift with vehicle ${schedule.date}-${schedule.shift}-${schedule.vehicle} in database`
                }, HttpStatus.BAD_REQUEST);
            }
        }

        const seen = new Set<string>();
        for (const schedule of driverSchedules) {
            console.log(schedule.date);
            const keyWithDriver = `${schedule.date}-${schedule.shift}-${schedule.driver}`;
            const keyWithVehicle = `${schedule.date}-${schedule.shift}-${schedule.vehicle}`;
            if (seen.has(keyWithDriver)) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date shift with driver ${keyWithDriver} in list`
                }, HttpStatus.BAD_REQUEST);
            }
            if (seen.has(keyWithVehicle)) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date shift with vehicle  ${keyWithVehicle} in list`
                }, HttpStatus.BAD_REQUEST);
            }
            seen.add(keyWithDriver)
            seen.add(keyWithVehicle)
        }

        return true;
    }

    async createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverScheduleDocument> {
        const newDriverSchedule = await this.driverScheduleRepository.createDriverSchedule(driverSchedule);
        return newDriverSchedule;
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
                message: 'Invalid date'
            }, HttpStatus.BAD_REQUEST);
        }
        const daynum = endDate.getDate() - startDate.getDate();
        console.log(daynum);
        const driverSchedulesList: DriverScheduleDocument[] = [];
        for (let i = 0; i <= daynum; i++) {
            const date = new Date(start);
            date.setDate(startDate.getDate() + i);
            const driverSchedules = await this.driverScheduleRepository.getDriverSchedules({ date: date, driver: driverId }, []);
            driverSchedulesList.push(...driverSchedules);
        }
        return driverSchedulesList;
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
                message: 'Invalid date'
            }, HttpStatus.BAD_REQUEST);
        }
        const daynum = endDate.getDate() - startDate.getDate();
        console.log(daynum);
        const driverSchedulesList: DriverScheduleDocument[] = [];
        for (let i = 0; i <= daynum; i++) {
            const date = new Date(start);
            date.setDate(startDate.getDate() + i);
            const driverSchedules = await this.driverScheduleRepository.getDriverSchedules({ date: date }, []);
            driverSchedulesList.push(...driverSchedules);
        }
        return driverSchedulesList;
    }

    async getDriverSchedules(query: any): Promise<DriverScheduleDocument[]> {
        const driverSchedules = await this.driverScheduleRepository.getDriverSchedules(query, []);
        return driverSchedules;
    }

    async updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<DriverScheduleDocument> {
        const updatedDriverSchedule = await this.driverScheduleRepository.updateDriverSchedule(id, driverSchedule);
        return updatedDriverSchedule;
    }


    async driverCheckIn(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument> {
        // get current time,
        const currentTime = new Date();
        console.log('driverScheduleId', driverScheduleId)
        const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(driverScheduleId);
        if (!driverSchedule) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Driver Schedule not found'
            }, HttpStatus.NOT_FOUND);
        }
        if (driverSchedule.driver.toString() !== driverId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Driver not found'
            }, HttpStatus.BAD_REQUEST);
        }
        if (driverSchedule.status !== DriverSchedulesStatus.NOT_STARTED) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Driver schedule has started or completed'
            }, HttpStatus.BAD_REQUEST);
        }
        const shift = driverSchedule.shift;
        const shiftHours = ShiftHours[shift];

        const expectedCheckin = new Date(driverSchedule.date);
        expectedCheckin.setHours(shiftHours.start + ShiftDifference.IN, 0, 0, 0);

        const expectedCheckout = new Date(driverSchedule.date);
        expectedCheckout.setHours(shiftHours.end + ShiftDifference.OUT, 0, 0, 0);

        if (currentTime < expectedCheckin || currentTime > expectedCheckout) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Driver schedule is not in shift time'
            }, HttpStatus.BAD_REQUEST);
        }

        driverSchedule.status = DriverSchedulesStatus.IN_PROGRESS;
        driverSchedule.checkinTime = currentTime;
        if (currentTime.getTime() > expectedCheckin.getTime() - ShiftDifference.IN) {
            driverSchedule.isLate = true
        }

        const scheduleUpdate = await this.driverScheduleRepository.updateDriverSchedule(driverScheduleId, {
            status: driverSchedule.status,
            checkinTime: driverSchedule.checkinTime,
            isLate: driverSchedule.isLate
        });

        return scheduleUpdate;
    }

    async driverCheckOut(driverScheduleId: string, driverId: string): Promise<DriverScheduleDocument> {
        const currentTime = new Date();
        const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(driverScheduleId);

        if (!driverSchedule) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Driver Schedule not found'
            }, HttpStatus.NOT_FOUND);
        }
        // Validate driver ownership
        if (driverSchedule.driver.toString() !== driverId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Driver not authorized for this schedule'
            }, HttpStatus.BAD_REQUEST);
        }
        // Validate schedule status
        if (driverSchedule.status !== DriverSchedulesStatus.IN_PROGRESS) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Schedule must be in progress to checkout'
            }, HttpStatus.BAD_REQUEST);
        }

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
        return scheduleUpdate
    }


}