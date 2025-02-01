import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { OTP_SERVICE } from "src/modules/OTP/otp.di-token";
import { IOTPService, OTPVerifyDTO } from "src/modules/OTP/otp.port";



@Controller('otp')
export class OTPController {
    constructor(
        @Inject(OTP_SERVICE) private readonly otpService: IOTPService
    ) { }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Body() data: OTPVerifyDTO) {
        const result = this.otpService.verify(data);
        return result;
    }
}