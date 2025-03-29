import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { BUS_STOP_SERVICE } from './bus-stop.di-token';
import { IBusStopService } from './bus-stop.port';
import { CreateBusStopDto, UpdateBusStopDto } from './bus-stop.dto';
import { ValidationErrorResponse } from 'src/common/swagger/responses';
import { HEADER } from 'src/share/interface';

@ApiTags('bus-stops')
@Controller('bus-stops')
export class BusStopController {
  constructor(
    @Inject(BUS_STOP_SERVICE)
    private readonly busStopService: IBusStopService,
  ) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create new bus stop' })
  @ApiResponse({
    status: 201,
    description: 'Bus stop created successfully',
    type: CreateBusStopDto,
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
  async createBusStop(@Body() dto: CreateBusStopDto) {
    return await this.busStopService.createBusStop(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bus stops' })
  @ApiResponse({
    status: 200,
    description: 'List of all bus stops',
    type: [CreateBusStopDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAllBusStops() {
    return await this.busStopService.getAllBusStops();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bus stop by id' })
  @ApiResponse({
    status: 200,
    description: 'Bus stop details',
    type: CreateBusStopDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Bus stop not found',
  })
  async getBusStopById(@Param('id') id: string) {
    return await this.busStopService.getBusStopById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update bus stop' })
  @ApiResponse({
    status: 200,
    description: 'Bus stop updated successfully',
    type: UpdateBusStopDto,
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
    description: 'Bus stop not found',
  })
  async updateBusStop(@Param('id') id: string, @Body() dto: UpdateBusStopDto) {
    return await this.busStopService.updateBusStop(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Delete bus stop' })
  @ApiResponse({
    status: 200,
    description: 'Bus stop deleted successfully',
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
    description: 'Bus stop not found',
  })
  async deleteBusStop(@Param('id') id: string) {
    await this.busStopService.deleteBusStop(id);
    return { message: 'Bus stop deleted successfully' };
  }
}
