import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
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
    private readonly tripService: ITripService,
  ) { }

  @Get('customer-personal-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get customer personal trip' })
  async getCustomerPersonalTrip(@Request() req) {
    return await this.tripService.getPersonalCustomerTrip(req.user._id);
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

  @Get('customer-personal-trip/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Get trip by id' })
  async getTripById(@Param('id') id: string, @Request() req) {
    return await this.tripService.getPersonalCustomerTripById(req.user._id, id)
  }

  @Post('driver-pickup-customer')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Driver pickup customer' })
  @ApiBody({
    type: String,
    description: 'Driver pickup customer',
    examples: {
      'Driver pickup customer': {
        value: {
          tripId: '67b6c79187febb73be4b3f09',
        },
      },
    },

  })
  async driverPickupCustomer(@Body() data: { tripId: string }, @Request() req) {
    return await this.tripService.driverPickupCustomer(data.tripId, req.user._id)
  }

  @Post('calculate-bus-route-fare')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Calculate bus route fare' })
  async calculateBusRouteFare(
    @Body() data: { routeId: string; fromStopId: string; toStopId: string; numberOfSeats: number },
  ) {
    return await this.tripService.calculateBusRouteFare(
      data.routeId,
      data.fromStopId,
      data.toStopId,
      data.numberOfSeats,
    );
  }
}
