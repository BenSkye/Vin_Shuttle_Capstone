import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { UserRole } from '../../share/enums';
import { CreateBusScheduleDto } from './bus-schedule.dto';
import { IBusScheduleService } from './bus-schedule.port';
import { BUS_SCHEDULE_SERVICE } from './bus-schedule.di-token';
import { HEADER } from 'src/share/interface';

@ApiTags('bus-schedules')
@Controller('bus-schedules')
export class BusScheduleController {
  constructor(
    @Inject(BUS_SCHEDULE_SERVICE)
    private readonly busScheduleService: IBusScheduleService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create new bus schedule' })
  async createSchedule(@Body() dto: CreateBusScheduleDto) {
    return await this.busScheduleService.createSchedule(dto);
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Get active schedule by route' })
  async getActiveSchedule(@Param('routeId') routeId: string) {
    return await this.busScheduleService.getActiveScheduleByRoute(routeId);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update bus schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: CreateBusScheduleDto
  ) {
    return await this.busScheduleService.updateSchedule(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Delete bus schedule' })
  @HttpCode(204)
  async deleteSchedule(@Param('id') id: string) {
    await this.busScheduleService.deleteSchedule(id);
  }

  @Post(':id/generate-trips/:date')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({
    summary: 'Generate daily trips from schedule',
    description: `
    Tạo danh sách các chuyến xe trong ngày dựa trên lịch trình có sẵn.
    
    ### Mô tả:
    - Tạo tự động các chuyến xe trong ngày dựa trên lịch trình đã được cấu hình
    - Phân bổ tài xế và xe luân phiên cho từng chuyến
    - Tính toán thời gian xuất phát và kết thúc cho mỗi chuyến
    
    ### Tham số:
    - id: ID của lịch trình cần tạo chuyến
    - date: Ngày cần tạo các chuyến (format: YYYY-MM-DD)
    
    ### Kết quả trả về:
    Danh sách các chuyến xe được tạo, mỗi chuyến bao gồm:
    - Thông tin tuyến xe
    - Tài xế và xe được phân công
    - Thời gian bắt đầu và kết thúc
    - Thời gian ước tính cho chuyến đi
    - Trạng thái chuyến
    
    ### Lưu ý:
    - Chỉ ADMIN và MANAGER mới có quyền thực hiện
    - Thời gian giữa các chuyến được tính toán tự động dựa trên số chuyến/ngày
    - Đảm bảo phân bổ công bằng giữa các tài xế và xe
    `
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of bus schedule',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiParam({
    name: 'date',
    required: true,
    description: 'Date to generate trips',
    example: '2024-03-20'
  })
  @ApiResponse({
    status: 201,
    description: 'List of trips created successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          busRoute: {
            type: 'string',
            description: 'ID of bus route',
            example: '507f1f77bcf86cd799439011'
          },
          vehicle: {
            type: 'string', 
            description: 'ID of vehicle assigned',
            example: '507f1f77bcf86cd799439012'
          },
          driver: {
            type: 'string',
            description: 'ID of driver assigned',
            example: '507f1f77bcf86cd799439013'
          },
          startTime: {
            type: 'string',
            format: 'date-time',
            description: 'Start time of trip',
            example: '2024-03-20T06:00:00.000Z'
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            description: 'End time of trip',
            example: '2024-03-20T06:45:00.000Z'
          },
          estimatedDuration: {
            type: 'number',
            description: 'Estimated duration of trip (minutes)',
            example: 45
          },
          status: {
            type: 'string',
            enum: ['active', 'in_progress', 'completed', 'cancelled'],
            description: 'Status of trip',
            example: 'active'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Schedule not found'
        },
        vnMessage: {
          type: 'string',
          example: 'Schedule not found'
        }
      }
    }
  })
  async generateDailyTrips(
    @Param('id') id: string,
    @Param('date') date: Date
  ) {
    return await this.busScheduleService.generateDailyTrips(id, date);
  }
}