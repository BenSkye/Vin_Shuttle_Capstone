import { Controller, Post, Body, Param, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusTrackingService } from './bus-tracking.service';
import { UpdateLocationDto } from './bus-tracking.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('bus-tracking')
@Controller('bus-tracking')
export class BusTrackingController {
  constructor(private readonly busTrackingService: BusTrackingService) {}

  @Post(':driverScheduleId/location')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateLocation(
    @Param('driverScheduleId') driverScheduleId: string,
    @Body() locationData: UpdateLocationDto,
  ) {
    return await this.busTrackingService.updateLocation(
      driverScheduleId,
      locationData,
    );
  }

  @Get('trip/:tripId/current-location')
  async getCurrentLocation(@Param('tripId') tripId: string) {
    return await this.busTrackingService.getCurrentLocation(tripId);
  }

  @Get('trip/:tripId/history')
  async getLocationHistory(
    @Param('tripId') tripId: string,
    @Query('start') startTime: Date,
    @Query('end') endTime: Date,
  ) {
    return await this.busTrackingService.getLocationHistory(
      tripId,
      startTime,
      endTime,
    );
  }
}