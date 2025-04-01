import { Controller, Get, HttpCode, HttpStatus, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { TRACKING_SERVICE } from 'src/modules/tracking/tracking.di-token';
import { ITrackingService } from 'src/modules/tracking/tracking.port';
import { HEADER } from 'src/share/interface';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(@Inject(TRACKING_SERVICE) private readonly trackingService: ITrackingService) {}

  @Get('last-location/:vehicleId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get last location of vehicle' })
  async getLastVehicleLocation(@Param('vehicleId') vehicleId: string) {
    return this.trackingService.getLastVehicleLocation(vehicleId);
  }
}
