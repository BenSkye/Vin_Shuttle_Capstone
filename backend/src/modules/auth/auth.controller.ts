import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AUTH_SERVICE } from 'src/modules/auth/auth.di-token';
import { customerLoginDto } from 'src/modules/auth/auth.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { IAuthService } from 'src/modules/auth/auth.port';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { CreateUserDto, ICreateUserDto } from 'src/modules/users/users.dto';
import { HEADER } from 'src/share/interface';
import { UserRole } from 'src/share/enums';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
  ) { }

  @Post('register/customer')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register customer account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register customer account',
    examples: {
      'Register customer': {
        value: {
          name: 'Nguyen Van A',
          phone: '0838683868',
          role: 'customer'
        },
      },
    },
  })
  async registerCustomer(@Body() data: ICreateUserDto) {
    return this.authService.register({ ...data, role: UserRole.CUSTOMER });
  }

  @Post('register/admin')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register admin account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register admin account',
    examples: {
      'Register admin': {
        value: {
          name: 'Admin User',
          phone: '0838683868',
          email: 'admin@gmail.com',
          password: 'admin123',
          role: 'admin'
        },
      },
    },
  })
  async registerAdmin(@Body() data: ICreateUserDto) {
    return this.authService.register({ ...data, role: UserRole.ADMIN });
  }

  @Post('register/manager')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register manager account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register manager account',
    examples: {
      'Register manager': {
        value: {
          name: 'Manager User',
          phone: '0838683868',
          email: 'manager@gmail.com',
          password: 'manager123',
          role: 'manager'
        },
      },
    },
  })
  async registerManager(@Body() data: ICreateUserDto) {
    return this.authService.register({ ...data, role: UserRole.MANAGER });
  }

  @Post('register/driver')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register driver account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register driver account',
    examples: {
      'Register driver': {
        value: {
          name: 'Driver User',
          phone: '0838683868',
          email: 'driver@gmail.com',
          password: 'driver123',
          role: 'driver'
        },
      },
    },
  })
  async registerDriver(@Body() data: ICreateUserDto) {
    return this.authService.register({ ...data, role: UserRole.DRIVER });
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register account',
    examples: {
      'Register': {
        value: {
          name: 'User',
          phone: '0838683868',
          email: 'userEmail@gmail.com',
          password: 'userPassword',
          role: 'customer'
        },
      },
    },
  })
  async register(@Body() data: ICreateUserDto) {
    return this.authService.register(data);
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
          phone: '0838683868',
        },
      },
    },
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
      Login: {
        value: {
          email: 'khanhHg@gmail.com',
          password: '123',
        },
      },
    },
  })
  async loginByPassword(@Body() data: { email: string; password: string }) {
    return this.authService.loginByPassword(data.email, data.password);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    type: 'changeUserPassword',
    description: 'Change user password',
    examples: {
      'Change Password': {
        value: {
          oldPassword: '123',
          newPassword: '1234',
        },
      },
    },
  })
  async changePassword(@Request() req, @Body() data: { oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user._id, data.oldPassword, data.newPassword);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req) {
    console.log('req.headers[HEADER.CLIENT_ID]', req.headers[HEADER.CLIENT_ID]);
    console.log('req.headers[HEADER.REFRESH_TOKEN]', req.headers[HEADER.REFRESH_TOKEN]);
    return this.keyTokenService.handleRefreshToken(
      req.headers[HEADER.CLIENT_ID],
      req.headers[HEADER.REFRESH_TOKEN],
    );
  }
}
