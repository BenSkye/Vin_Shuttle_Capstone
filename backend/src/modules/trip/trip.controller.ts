import { Controller, Get, HttpCode, HttpStatus, Inject, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/role.guard";
import { TRIP_SERVICE } from "src/modules/trip/trip.di-token";
import { ITripService } from "src/modules/trip/trip.port";
import { UserRole } from "src/share/enums";

@ApiTags('trip')
@Controller('trip')
export class TripController {
    constructor(
        @Inject(TRIP_SERVICE)
        private readonly tripService: ITripService
    ) { }

    @Get('customer-personal-trip')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get customer personal trip' })
    async getCustomerPersonalTrip(
        @Request() req,
    ) {
        return await this.tripService.getPersonalCustomerTrip(req.user._id)
    }


    @Get('driver-personal-trip')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get driver personal trip' })
    async getDriverPersonalTrip(
        @Request() req,
    ) {
        return await this.tripService.getPersonalDriverTrip(req.user._id)
    }
}