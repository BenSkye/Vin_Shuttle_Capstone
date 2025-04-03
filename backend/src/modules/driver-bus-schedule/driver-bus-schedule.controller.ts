import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { CreateDriverBusScheduleDto, UpdateDriverBusScheduleDto } from './driver-bus-schedule.dto';
import { IDriverBusScheduleService } from './driver-bus-schedule.port';
import { DRIVER_BUS_SCHEDULE_SERVICE } from './driver-bus-schedule.di-token';
import { HEADER } from 'src/share/interface';

@ApiTags('driver-bus-schedules')
@Controller('driver-bus-schedules')
export class DriverBusScheduleController {
  constructor(
    @Inject(DRIVER_BUS_SCHEDULE_SERVICE)
    private readonly driverBusScheduleService: IDriverBusScheduleService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create new driver bus schedule' })
  async createSchedule(@Body() dto: CreateDriverBusScheduleDto) {
    return await this.driverBusScheduleService.createSchedule(dto);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get schedules by driver' })
  async getDriverSchedules(@Param('driverId') driverId: string) {
    return await this.driverBusScheduleService.getDriverSchedules(driverId);
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Get schedules by route' })
  async getRouteSchedules(@Param('routeId') routeId: string) {
    return await this.driverBusScheduleService.getRouteSchedules(routeId);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get schedules by vehicle' })
  async getVehicleSchedules(@Param('vehicleId') vehicleId: string) {
    return await this.driverBusScheduleService.getVehicleSchedules(vehicleId);
  }

  @Get('driver/:driverId/active')
  @ApiOperation({ summary: 'Get active schedules by driver and date' })
  async getActiveDriverSchedules(
    @Param('driverId') driverId: string,
    @Query('date') date: Date,
  ) {
    return await this.driverBusScheduleService.getActiveDriverSchedules(driverId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by id' })
  async getScheduleById(@Param('id') id: string) {
    return await this.driverBusScheduleService.getScheduleById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update driver bus schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateDriverBusScheduleDto,
  ) {
    return await this.driverBusScheduleService.updateSchedule(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Delete driver bus schedule' })
  @HttpCode(204)
  async deleteSchedule(@Param('id') id: string) {
    await this.driverBusScheduleService.deleteSchedule(id);
  }

  @Post(':id/check-in')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Driver check in' })
  async checkIn(@Param('id') id: string) {
    return await this.driverBusScheduleService.checkIn(id);
  }

  @Post(':id/check-out')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Driver check out' })
  async checkOut(@Param('id') id: string) {
    return await this.driverBusScheduleService.checkOut(id);
  }

  @Put(':id/current-stop')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update current stop' })
  async updateCurrentStop(
    @Param('id') id: string,
    @Body('stopId') stopId: string,
  ) {
    return await this.driverBusScheduleService.updateCurrentStop(id, stopId);
  }

  @Put(':id/passenger-count')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update passenger count' })
  async updatePassengerCount(
    @Param('id') id: string,
    @Body('count') count: number,
  ) {
    return await this.driverBusScheduleService.updatePassengerCount(id, count);
  }
} 