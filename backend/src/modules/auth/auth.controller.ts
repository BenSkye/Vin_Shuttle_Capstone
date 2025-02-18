import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Put, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AUTH_SERVICE } from "src/modules/auth/auth.di-token";
import { customerLoginDto } from "src/modules/auth/auth.dto";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { IAuthService } from "src/modules/auth/auth.port";
import { CreateUserDto, ICreateUserDto } from "src/modules/users/users.dto";
@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authService: IAuthService
    ) { }

    @Post('register')
    @HttpCode(201)
    @ApiOperation({ summary: 'Register account' })
    @ApiBody({
        type: CreateUserDto,
        description: 'Register account',
        examples: {
            'Register account': {
                value: {
                    name: 'khanhHg',
                    phone: '0838683868',
                    email: 'khanhhg@gmail.com',
                    password: 'khanhadmindepzai',
                    role: 'admin'
                }
            }
        }
    })
    async registerCustomer(@Body() data: ICreateUserDto) {
        return this.authService.registerCustomer(data);
    }

    @Post('login-customer')
    @HttpCode(200)
    @ApiOperation({ summary: 'Customer login by phone number' })
    @ApiBody({
        type: customerLoginDto,
        description: 'Customer login by phone number',
        examples: {
            'Customer Login': {
                value: {
                    phone: '0838683868'
                }
            }
        }
    })
    async loginCustomer(@Body() data: { phone: string }) {
        return this.authService.loginCustomer(data.phone);
    }

    @Post('login-by-password')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login by email and password' })
    @ApiBody({
        type: customerLoginDto,
        description: 'Login by email and password',
        examples: {
            'Login': {
                value: {
                    email: 'khanhHg@gmail.com',
                    password: '123'
                }
            }
        }
    })
    async loginByPassword(@Body() data: { email: string, password: string }) {
        return this.authService.loginByPassword(data.email, data.password)
    }


    @Put('change-password')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({
        type: 'changeUserPassword',
        description: 'Change user password',
        examples: {
            'Change Password': {
                value: {
                    oldPassword: '123',
                    newPassword: '1234'
                }
            }
        }
    })
    async changePassword(
        @Request() req,
        @Body() data: { oldPassword: string, newPassword: string }
    ) {
        return this.authService.changePassword(req.user._id, data.oldPassword, data.newPassword)
    }
}