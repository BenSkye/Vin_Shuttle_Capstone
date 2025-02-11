import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { DRIVERSCHEDULE_REPOSITORY } from "src/modules/driver-schedule/driver-schedule.di-token";
import { ICreateDriverSchedule, IUpdateDriverSchedule } from "src/modules/driver-schedule/driver-schedule.dto";
import { IDriverScheduleRepository, IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";
import { DriverSchedule } from "src/modules/driver-schedule/driver-schedule.schema";
import { USER_REPOSITORY } from "src/modules/users/users.di-token";
import { IUserRepository } from "src/modules/users/users.port";


@Injectable()
export class DriverScheduleService implements IDriverScheduleService {
    constructor(
        @Inject(DRIVERSCHEDULE_REPOSITORY)
        private readonly driverScheduleRepository: IDriverScheduleRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository
    ) { }


    async createListDriverSchedule(driverSchedules: ICreateDriverSchedule[]): Promise<DriverSchedule[]> {
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
        const seen = new Set<string>();
        for (const schedule of driverSchedules) {
            const key = `${schedule.date.toISOString()}-${schedule.shift}`;
            if (seen.has(key)) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date and shift ${key} in list`
                }, HttpStatus.BAD_REQUEST);
            }
            seen.add(key);
        }
        for (const schedule of driverSchedules) {
            const isExist = await this.driverScheduleRepository.findOneDriverSchedule({
                date: schedule.date,
                shift: schedule.shift
            }, []
            );

            if (isExist) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Duplicate date and shift ${schedule.date.toISOString()}-${schedule.shift} in database`
                }, HttpStatus.BAD_REQUEST);
            }

            const driver = await this.userRepository.getUserById(schedule.driver, ['status']);
            if (driver.status !== 'active') {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Driver ${schedule.driver} is not active`
                }, HttpStatus.BAD_REQUEST);
            }
        }
        return true;
    }

    async createDriverSchedule(driverSchedule: ICreateDriverSchedule): Promise<DriverSchedule> {
        const newDriverSchedule = await this.driverScheduleRepository.createDriverSchedule(driverSchedule);
        return newDriverSchedule;
    }

    async getDriverScheduleById(id: string): Promise<DriverSchedule> {
        const driverSchedule = await this.driverScheduleRepository.getDriverScheduleById(id);
        return driverSchedule;
    }

    async getAllDriverSchedules(): Promise<DriverSchedule[]> {
        const driverSchedules = await this.driverScheduleRepository.getAllDriverSchedules();
        return driverSchedules;
    }

    async getScheduleFromStartToEnd(start: Date, end: Date): Promise<DriverSchedule[]> {
        // get all driver schedule from start to end
        const daynum = end.getDate() - start.getDate();
        const driverSchedulesList: DriverSchedule[] = [];
        for (let i = 0; i < daynum; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const driverSchedules = await this.driverScheduleRepository.getDriverSchedules({ date: date }, []);
            driverSchedulesList.push(driverSchedules);
        }
        return driverSchedulesList;
    }

    async getDriverSchedules(query: any): Promise<DriverSchedule[]> {
        const driverSchedules = await this.driverScheduleRepository.getDriverSchedules(query, []);
        return driverSchedules;
    }

    async updateDriverSchedule(id: string, driverSchedule: IUpdateDriverSchedule): Promise<any> {
        const updatedDriverSchedule = await this.driverScheduleRepository.updateDriverSchedule(id, driverSchedule);
        return updatedDriverSchedule;
    }



}