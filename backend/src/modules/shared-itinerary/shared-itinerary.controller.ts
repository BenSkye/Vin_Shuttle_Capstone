import { Controller, Get, HttpCode, HttpStatus, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SHARE_ITINERARY_SERVICE } from 'src/modules/shared-itinerary/shared-itinerary.di-token';
import { ISharedItineraryService } from 'src/modules/shared-itinerary/shared-itinerary.port';

@Controller('share-itinerary')
@ApiTags('share-itinerary')
export class SharedItineraryController {
  constructor(
    @Inject(SHARE_ITINERARY_SERVICE)
    private readonly sharedItineraryService: ISharedItineraryService,
  ) {}

  @Get('get-by-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get share route by id' })
  async findBestItineraryForNewTrip(@Param('id') id: string) {
    return await this.sharedItineraryService.getSharedItineraryById(id);
  }

  @Get('get-by-trip-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get share route by trip id' })
  async getSharedItineraryByTripId(@Param('id') id: string) {
    return await this.sharedItineraryService.getSharedItineraryByTripId(id);
  }
}
