import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { BUS_ROUTE_SERVICE } from './bus-route.di-token';
import { IBusRouteService } from './bus-route.port';
import { CreateBusRouteDto, UpdateBusRouteDto } from './bus-route.dto';
import { HEADER } from 'src/share/interface';

@ApiTags('bus-routes')
@Controller('bus-routes')
export class BusRouteController {
  constructor(
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create new bus route' })
  @ApiBody({
    type: CreateBusRouteDto,
    description: 'Create new bus route',
    examples: {
      'Create new bus route': {
        value: {
          name: 'Route 1',
          description: 'Route in VinHome',
          stops: [
            {
              stopId: '507f1f77bcf86cd799439011',
              orderIndex: 0,
              distanceFromStart: 0,
              estimatedTime: 0,
            },
            {
              stopId: '507f1f77bcf86cd799439012',
              orderIndex: 1,
              distanceFromStart: 1.5,
              estimatedTime: 3,
            },
          ],
          routeCoordinates: [
            {
              lat: 21.028511,
              lng: 105.804817,
            },
            {
              lat: 21.028511,
              lng: 105.804817,
            }
          ],
          totalDistance: 5.2,
          estimatedDuration: 15,
          vehicleCategory: '67a2f123e7e80dd43a68e5e7',
          status: 'active',
          // basePrice: 50000,
        },
      },
    },
  })
  async createRoute(@Body() dto: CreateBusRouteDto) {
    return await this.busRouteService.createRoute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bus routes' })
  async getAllRoutes() {
    return await this.busRouteService.getAllRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bus route by id' })
  async getRouteById(@Param('id') id: string) {
    return await this.busRouteService.getRouteById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update bus route' })
  async updateRoute(@Param('id') id: string, @Body() dto: UpdateBusRouteDto) {
    return await this.busRouteService.updateRoute(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete bus route' })
  @ApiResponse({
    status: 200,
    description: 'Bus route deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  @ApiResponse({
    status: 404,
    description: 'Bus route not found',
  })
  async deleteRoute(@Param('id') id: string) {
    await this.busRouteService.deleteRoute(id);
    return { message: 'Bus route deleted successfully' };
  }

  @Post('calculate-fare')
  @ApiOperation({ summary: 'Calculate fare for route based on distance and pricing config' })
  @ApiResponse({
    status: 200,
    description: 'Fare calculation result',
    schema: {
      type: 'object',
      properties: {
      fare: {
        type: 'number',
        example: 7000,
        description: 'Calculated fare based on distance and pricing tiers'
      },
      distance: {
        type: 'number',
        example: 5.2,
        description: 'Distance between stops in kilometers'
      }
     },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 404,
    description: 'Route or stops not found',
  })
  async calculateFare(
    @Body() data: { routeId: string; fromStopId: string; toStopId: string; numberOfSeats: number },
  ) {
    const fare = await this.busRouteService.calculateFare(
      data.routeId,
      data.fromStopId,
      data.toStopId,
      data.numberOfSeats,
    );
    return { fare };
  }
}
