import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { USER_SERVICE } from 'src/modules/users/users.di-token';
import { IUserService } from 'src/modules/users/users.port';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(@Inject(USER_SERVICE) private readonly service: IUserService) { }


    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'View  profile user' })
    async getAllUsers() {
        return await this.service.listUsers();
    }


    @Get('profile')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'View personal profile' })
    async getProfile(@Request() req) {
        return await this.service.viewProfile(req.user._id);
    }

}
