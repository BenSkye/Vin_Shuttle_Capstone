import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { BUS_ROUTE_SERVICE } from './bus-route.di-token';
import { IBusRouteService } from './bus-route.port';
import { CreateBusRouteDto, UpdateBusRouteDto } from './bus-route.dto';
import { ValidationErrorResponse } from 'src/common/swagger/responses';

@ApiTags('bus-routes')
@Controller('bus-routes')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('authorization')
export class BusRouteController {
  constructor(
    @Inject(BUS_ROUTE_SERVICE)
    private readonly busRouteService: IBusRouteService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new bus route' })
  @ApiResponse({
    status: 201,
    description: 'Bus route created successfully',
    type: CreateBusRouteDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  async createRoute(@Body() dto: CreateBusRouteDto) {
    return await this.busRouteService.createRoute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bus routes' })
  @ApiResponse({
    status: 200,
    description: 'List of all bus routes',
    type: [CreateBusRouteDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAllRoutes() {
    return await this.busRouteService.getAllRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bus route by id' })
  @ApiResponse({
    status: 200,
    description: 'Bus route details',
    type: CreateBusRouteDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Bus route not found',
  })
  async getRouteById(@Param('id') id: string) {
    return await this.busRouteService.getRouteById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update bus route' })
  @ApiResponse({
    status: 200,
    description: 'Bus route updated successfully',
    type: UpdateBusRouteDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ValidationErrorResponse,
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
  @ApiOperation({ summary: 'Calculate fare for route' })
  @ApiResponse({
    status: 200,
    description: 'Fare calculation result',
    schema: {
      type: 'object',
      properties: {
        fare: {
          type: 'number',
          example: 50000,
        },
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
