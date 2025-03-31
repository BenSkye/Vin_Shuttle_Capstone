import { Body, Controller, Delete, Get, Inject, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { USER_SERVICE } from 'src/modules/users/users.di-token';
import { UpdateUserDto, userParams } from 'src/modules/users/users.dto';
import { IUserService } from 'src/modules/users/users.port';
import { UserRole, UserStatus } from 'src/share/enums';
import { SortOrderOption } from 'src/share/enums/sortOrderOption.enum';
import { HEADER } from 'src/share/interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(@Inject(USER_SERVICE) private readonly service: IUserService) { }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'View  profile user' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by user name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by user email',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Filter by user phone',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter by user role',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of vehicles' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of vehicles' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrderOption,
    description: 'Sort order (asc, desc)'
  })
  async getAllUsers(@Query() query: userParams) {
    return await this.service.listUsers(query);
  }
  @Get('get-user-by-role/:role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'View  profile user by role' })
  @ApiParam({
    name: 'role',
    description: 'User Role',
    example: UserRole.CUSTOMER,
    enum: UserRole,
  })
  async getUserByRole(@Param('role') role: UserRole) {
    return await this.service.getUserByRole(role);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'View personal profile' })
  async getProfile(@Request() req) {
    return await this.service.viewProfile(req.user._id);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update personal profile' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update personal profile',
    examples: {
      'Update personal profile': {
        value: {
          name: 'KhanhHg',
          phone: '00800808808',
          email: 'KhanhHg8386@gmail.com',
        },
      },
    },
  })
  async updateProfile(@Request() req, @Body() user: UpdateUserDto) {
    return await this.service.updateProfile(req.user._id, user);
  }

  @Put('update-driver-profile/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiParam({
    name: 'id',
    description: 'Driver ID',
    example: '64f5e4d3b9a2c7f8e3b7c8d1',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Update driver profile',
    examples: {
      'Update driver profile': {
        value: {
          name: 'KhanhHg',
          phone: '00800808808',
          email: 'KhanhHg8386@gmail.com',
          status: UserStatus.ACTIVE,
        }
      }
    }
  })
  async updateDriverProfile(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.service.updateDriverProfile(id, user);
  }


  @Put('save-push-token')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Save user push token' })
  @ApiBody({
    type: String,
    description: 'Save user push token',
    examples: {
      'Save user push token': {
        value: {
          pushToken: 'xxxxxxxxxxxxxxxxxxxx',
        }
      },
    },
  })
  async saveUserPushToken(@Request() req, @Body() data: { pushToken: string }) {
    return await this.service.saveUserPushToken(req.user._id, data.pushToken);
  }

  @Delete('delete-push-token')
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Delete user push token' })
  async deletePushToken(@Request() req) {
    return await this.service.deletePushToken(req.user._id);
  }

}
