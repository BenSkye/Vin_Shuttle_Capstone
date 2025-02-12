import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/role.guard";
import { DRIVERSCHEDULE_SERVICE } from "src/modules/driver-schedule/driver-schedule.di-token";
import { CreateDriverScheduleDto } from "src/modules/driver-schedule/driver-schedule.dto";
import { IDriverScheduleService } from "src/modules/driver-schedule/driver-schedule.port";
import { UserRole } from "src/share/enums";


@ApiTags('driver-schedules')
@Controller('driver-schedules')
export class DriverScheduleController {
    constructor(
        @Inject(DRIVERSCHEDULE_SERVICE)
        private readonly driverScheduleService: IDriverScheduleService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @ApiBearerAuth('authorization')
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

    @Get('get-schedule-from-start-to-end/:startDate/:endDate')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get driver schedules in week' })
    @ApiParam({
        name: 'startDate',
        description: 'The start date of the week',
        example: '2021-10-01'
    })
    @ApiParam({
        name: 'endDate',
        description: 'The end date of the week',
        example: '2021-10-07'
    })
    async getDriverSchedulesInWeek(
        @Param('startDate') startDate: Date,
        @Param('endDate') endDate: Date
    ) {
        return await this.driverScheduleService.getScheduleFromStartToEnd(startDate, endDate);
    }

}