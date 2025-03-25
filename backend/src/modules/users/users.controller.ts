import { Body, Controller, Delete, Get, Inject, Param, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { USER_SERVICE } from 'src/modules/users/users.di-token';
import { UpdateUserDto } from 'src/modules/users/users.dto';
import { IUserService } from 'src/modules/users/users.port';
import { UserRole } from 'src/share/enums';
import { HEADER } from 'src/share/interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(@Inject(USER_SERVICE) private readonly service: IUserService) { }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'View  profile user' })
  async getAllUsers() {
    return await this.service.listUsers();
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
