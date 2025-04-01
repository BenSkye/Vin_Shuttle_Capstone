import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { CreateBusScheduleDto } from './bus-schedule.dto';
import { IBusScheduleService } from './bus-schedule.port';
import { BUS_SCHEDULE_SERVICE } from './bus-schedule.di-token';
import { HEADER } from 'src/share/interface';

@ApiTags('bus-schedules')
@Controller('bus-schedules')
export class BusScheduleController {
  constructor(
    @Inject(BUS_SCHEDULE_SERVICE)
    private readonly busScheduleService: IBusScheduleService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create new bus schedule' })
  async createSchedule(@Body() dto: CreateBusScheduleDto) {
    return await this.busScheduleService.createSchedule(dto);
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Get active schedule by route' })
  async getActiveSchedule(@Param('routeId') routeId: string) {
    return await this.busScheduleService.getActiveScheduleByRoute(routeId);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update bus schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: CreateBusScheduleDto
  ) {
    return await this.busScheduleService.updateSchedule(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Delete bus schedule' })
  @HttpCode(204)
  async deleteSchedule(@Param('id') id: string) {
    await this.busScheduleService.deleteSchedule(id);
  }

  @Post(':id/generate-trips/:date')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Generate daily trips from schedule' })
  async generateDailyTrips(
    @Param('id') id: string,
    @Param('date') date: Date
  ) {
    return await this.busScheduleService.generateDailyTrips(id, date);
  }
}