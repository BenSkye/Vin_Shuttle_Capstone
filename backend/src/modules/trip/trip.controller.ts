import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { TRIP_SERVICE } from 'src/modules/trip/trip.di-token';
import { tripParams } from 'src/modules/trip/trip.dto';
import { ITripService } from 'src/modules/trip/trip.port';
import { ServiceType, TripStatus, UserRole } from 'src/share/enums';
import { SortOrderOption } from 'src/share/enums/sortOrderOption.enum';
import { HEADER } from 'src/share/interface';

@ApiTags('trip')
@Controller('trip')
export class TripController {
  constructor(
    @Inject(TRIP_SERVICE)
    private readonly tripService: ITripService,
  ) {}

  @Get('customer-personal-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get customer personal trip' })
  async getCustomerPersonalTrip(@Request() req) {
    return await this.tripService.getPersonalCustomerTrip(req.user._id);
  }

  @Get('driver-personal-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get driver personal trip' })
  async getDriverPersonalTrip(@Request() req) {
    return await this.tripService.getPersonalDriverTrip(req.user._id);
  }

  @Get('customer-personal-trip/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get trip by id' })
  async getTripById(@Param('id') id: string, @Request() req) {
    return await this.tripService.getPersonalCustomerTripById(req.user._id, id);
  }

  @Get('driver-personal-trip/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get trip by id' })
  async getDriverTripById(@Param('id') id: string, @Request() req) {
    return await this.tripService.getPersonalDriverTripById(req.user._id, id);
  }

  @Post('driver-pickup-customer')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
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
    return await this.tripService.driverPickupCustomer(data.tripId, req.user._id);
  }

  @Post('driver-start-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Driver start trip' })
  @ApiBody({
    type: String,
    description: 'Driver start trip',
    examples: {
      'Driver start trip': {
        value: {
          tripId: '67b6c79187febb73be4b3f09',
        },
      },
    },
  })
  async driverStartTrip(@Body() data: { tripId: string }, @Request() req) {
    return await this.tripService.driverStartTrip(data.tripId, req.user._id);
  }

  @Post('driver-complete-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Driver complete trip' })
  @ApiBody({
    type: String,
    description: 'Driver complete trip',
    examples: {
      'Driver complete trip': {
        value: {
          tripId: '67b6c79187febb73be4b3f09',
        },
      },
    },
  })
  async driverCompleteTrip(@Body() data: { tripId: string }, @Request() req) {
    return await this.tripService.driverCompleteTrip(data.tripId, req.user._id);
  }

  @Post('cancel-trip')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Cancel trip by customer or driver' })
  @ApiBody({
    type: String,
    description: 'Cancel trip',
    examples: {
      'Cancel trip': {
        value: {
          tripId: '67b6c79187febb73be4b3f09',
          reason: 'I want to cancel this trip',
        },
      },
    },
  })
  async cancelTrip(
    @Body()
    data: {
      tripId: string;
      reason: string;
    },
    @Request() req,
  ) {
    return await this.tripService.cancelTrip(req.user._id, data.tripId, data.reason);
  }

  @Post('calculate-bus-route-fare')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
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

  @Get('total-amount')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get total amount' })
  async totalAmount() {
    return await this.tripService.totalAmount();
  }

  @Get('list-query')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get list of trips with filters' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TripStatus,
    description: 'Filter by trip status',
  })
  @ApiQuery({
    name: 'driverName',
    required: false,
    type: String,
    description: 'Filter by driverName',
  })
  @ApiQuery({
    name: 'customerPhone',
    required: false,
    type: String,
    description: 'Filter by customer customerPhone',
  })
  @ApiQuery({
    name: 'vehicleName',
    required: false,
    type: String,
    description: 'Filter by vehicleName',
  })
  @ApiQuery({
    name: 'serviceType',
    required: false,
    enum: ServiceType,
    description: 'Filter by serviceType',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit number of vehicles',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of vehicles' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrderOption,
    description: 'Sort order (asc, desc)',
  })
  async listQuery(@Query() query: tripParams) {
    return await this.tripService.getTripByQuery(query);
  }
}
