import { Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { AUTH_SERVICE } from "src/modules/auth/auth.di-token";
import { IAuthService } from "src/modules/auth/auth.port";
import { ICreateUserDto } from "src/modules/users/users.dto";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authService: IAuthService
    ) { }

    @Post('register')
    @HttpCode(201)
    async registerCustomer(@Body() data: ICreateUserDto) {
        return this.authService.registerCustomer(data);
    }

    @Post('login')
    @HttpCode(200)
    async loginCustomer(@Body() phone: string) {
        return this.authService.loginCustomer(phone);
    }
}