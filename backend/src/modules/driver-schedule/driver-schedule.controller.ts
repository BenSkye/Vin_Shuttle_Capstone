import { Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DRIVERSCHEDULE_SERVICE } from "src/modules/driver-schedule/driver-schedule.di-token";
import { CreateDriverScheduleDto } from "src/modules/driver-schedule/driver-schedule.dto";
import { IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";


@ApiTags('driver-schedules')
@Controller('driver-schedules')
export class DriverScheduleController {
    constructor(
        @Inject(DRIVERSCHEDULE_SERVICE)
        private readonly driverScheduleService: IDriverScheduleService
    ) { }

    @Post()
    @HttpCode(201)
    @ApiOperation({ summary: 'Create a list of driver schedules' })
    @ApiBody({
        type: CreateDriverScheduleDto,
        description: 'Create a list of driver schedules',
        examples: {
            'Create a list of driver schedules': {
                value: [
                    {
                        driverId: '67873bb9cf95c847fe62ba5f',
                        date: '2021-10-01',
                        shift: 'A',
                        vehicle: '67873bb9cf95c847fe62ba5f'
                    },
                    {
                        driverId: '67873bb9cf95c847fe62ba5f',
                        date: '2021-10-01',
                        shift: 'B',
                        vehicle: '67873bb9cf95c847fe62ba5f'
                    }
                ]
            }
        }
    })
    async createListDriverSchedule(
        @Body() driverSchedules: CreateDriverScheduleDto[]
    ) {
        return await this.driverScheduleService.createListDriverSchedule(driverSchedules);
    }
}