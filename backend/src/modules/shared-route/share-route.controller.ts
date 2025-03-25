import { Controller, Get, HttpCode, HttpStatus, Inject, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SHARE_ROUTE_SERVICE } from "src/modules/shared-route/shared-route.di-token";
import { ISharedRouteService } from "src/modules/shared-route/shared-route.port";


@Controller('share-route')
@ApiTags('share-route')
export class ShareRouteController {
    constructor(
        @Inject(SHARE_ROUTE_SERVICE)
        private readonly sharedRouteService: ISharedRouteService
    ) { }

    @Get('get-by-id/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'get share route by id' })

    async findBestRouteForNewTrip(
        @Param('id') id: string
    ) {
        return await this.sharedRouteService.getSharedRouteById(id)
    }

    @Get('get-by-trip-id/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'get share route by trip id' })
    async getSharedRouteByTripId(
        @Param('id') id: string
    ) {
        return await this.sharedRouteService.getSharedRouteByTripId(id)
    }

}