import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { DRIVERSCHEDULE_SERVICE } from 'src/modules/driver-schedule/driver-schedule.di-token';
import {
  CreateDriverScheduleDto,
  driverScheduleParams,
  ICreateDriverSchedule,
} from 'src/modules/driver-schedule/driver-schedule.dto';
import { IDriverScheduleService } from 'src/modules/driver-schedule/driver-schedule.port';
import { DriverSchedulesStatus, DriverScheduleTaskType, Shift, UserRole } from 'src/share/enums';
import { HEADER } from 'src/share/interface';

@ApiTags('driver-schedules')
@Controller('driver-schedules')
export class DriverScheduleController {
  constructor(
    @Inject(DRIVERSCHEDULE_SERVICE)
    private readonly driverScheduleService: IDriverScheduleService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create a list of driver schedules' })
  @ApiBody({
    type: CreateDriverScheduleDto,
    description: 'Create a list of driver schedules',
    examples: {
      'Create a list of driver schedules': {
        value: [
          {
            driver: '67b6c79187febb73be4b3f09', // khanhDriver
            date: '2025-02-20',
            shift: 'A',
            vehicle: '67878002048da981c9778455', // xe 6 chỗ A34
          },
          {
            driver: '67ac45cc9796faf5cdbbf394', // quangDriver
            date: '2025-02-20',
            shift: 'B',
            vehicle: '6787801c048da981c9778458', // xe 6 chỗ A2
          },
          {
            driver: '67ac45be9796faf5cdbbf391', // luanDriver
            date: '2025-02-20',
            shift: 'C',
            vehicle: '67a2f142e7e80dd43a68e5ea', // Xe điện 10 chỗ B10
          },
          {
            driver: '67ac45b29796faf5cdbbf38e', // nhatDriver
            date: '2025-02-20',
            shift: 'D',
            vehicle: '67a458c51b2e80feb417a726', // nhoc quan
          },
        ],
      },
    },
  })
  async createListDriverSchedule(@Body() driverSchedules: ICreateDriverSchedule[]) {
    return await this.driverScheduleService.createListDriverSchedule(driverSchedules);
  }

  @Put('update-driver-schedule/:driverScheduleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update driver schedule' })
  @ApiParam({
    name: 'driverScheduleId',
    description: 'Driver Schedule Id',
    example: '',
  })
  @ApiBody({
    type: CreateDriverScheduleDto,
    description: 'Update driver schedule',
    examples: {
      'Update driver schedule': {
        value: {
          driver: '67b6c79187febb73be4b3f09', // khanhDriver
          date: '2025-02-20',
          shift: 'A',
          vehicle: '67878002048da981c9778455', // xe 6 chỗ A34
        },
      },
    },
  })
  async updateDriverSchedule(
    @Param('driverScheduleId') driverScheduleId: string,
    @Body() driverSchedule: ICreateDriverSchedule,
  ) {
    return await this.driverScheduleService.updateDriverSchedule(driverScheduleId, driverSchedule);
  }

  @Get('driver-not-scheduled/:date')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get driver not scheduled in date' })
  @ApiParam({
    name: 'date',
    description: 'The date',
    example: '2025-04-12',
  })
  async getDriverNotScheduledInDate(@Param('date') date: Date) {
    return await this.driverScheduleService.getDriverNotScheduledInDate(date);
  }

  @Get('vehicle-not-scheduled/:date')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get vehicle not scheduled in date' })
  @ApiParam({
    name: 'date',
    description: 'The date',
    example: '2025-04-12',
  })
  async getVehicleNotScheduledInDate(@Param('date') date: Date) {
    return await this.driverScheduleService.getVehicleNotScheduledInDate(date);
  }

  @Get('get-schedule-general-from-start-to-end/:startDate/:endDate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get driver schedules in week' })
  @ApiParam({
    name: 'startDate',
    description: 'The start date of the week',
    example: '2025-04-12',
  })
  @ApiParam({
    name: 'endDate',
    description: 'The end date of the week',
    example: '2025-04-12',
  })
  async getDriverSchedulesInWeek(
    @Param('startDate') startDate: Date,
    @Param('endDate') endDate: Date,
  ) {
    return await this.driverScheduleService.getScheduleGeneralFromStartToEnd(startDate, endDate);
  }

  @Get('get-driver-schedules-by-query')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get driver schedules by query' })
  @ApiQuery({
    name: 'driver',
    required: false,
    type: String,
    description: 'Filter by driver ID',
  })
  @ApiQuery({
    name: 'vehicle',
    required: false,
    type: String,
    description: 'Filter by vehicle ID',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: Date,
    description: 'Filter by date',
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    enum: Shift,
    description: 'Filter by shift',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DriverSchedulesStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'isLate',
    required: false,
    type: Boolean,
    description: 'Filter by isLate',
  })
  @ApiQuery({
    name: 'isEarlyCheckout',
    required: false,
    type: Boolean,
    description: 'Filter by isEarlyCheckout',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'The start date of the week',
    type: String,
    example: '2025-04-12',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'The end date of the week',
    type: String,
    example: '2025-04-12',
  })
  // @ApiQuery({
  //   name: 'taskType',
  //   required: false,
  //   enum: DriverScheduleTaskType,
  //   description: 'Filter by taskType',
  // })

  async getDriverSchedulesByQuery(
    @Query() query: driverScheduleParams
  ) {
    return await this.driverScheduleService.getDriverSchedules(query);
  }

  @Get('get-personal-schedules-from-start-to-end/:startDate/:endDate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'For driver to get personal schedules in week' })
  @ApiParam({
    name: 'startDate',
    description: 'The start date of the week',
    example: '2021-10-01',
  })
  @ApiParam({
    name: 'endDate',
    description: 'The end date of the week',
    example: '2021-10-07',
  })
  async getPersonalSchedulesInWeek(
    @Request() req,
    @Param('startDate') startDate: Date,
    @Param('endDate') endDate: Date,
  ) {
    return await this.driverScheduleService.getPersonalSchedulesFromStartToEnd(
      req.user._id,
      startDate,
      endDate,
    );
  }

  @Get('driver-checkin/:driverScheduleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'For driver to check-in' })
  @ApiParam({
    name: 'driverScheduleId',
    description: 'Driver Schedule Id',
    example: '',
  })
  async driverCheckin(@Request() req, @Param('driverScheduleId') driverScheduleId: string) {
    return await this.driverScheduleService.driverCheckIn(driverScheduleId, req.user._id);
  }

  @Get('driver-checkout/:driverScheduleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'For driver to check-out' })
  @ApiParam({
    name: 'driverScheduleId',
    description: 'Driver Schedule Id',
    example: '',
  })
  async driverCheckout(@Request() req, @Param('driverScheduleId') driverScheduleId: string) {
    return await this.driverScheduleService.driverCheckOut(driverScheduleId, req.user._id);
  }
}
