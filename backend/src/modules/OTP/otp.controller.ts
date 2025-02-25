import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OTP_SERVICE } from 'src/modules/OTP/otp.di-token';
import { OTPVerifyDTO } from 'src/modules/OTP/otp.dto';
import { IOTPService } from 'src/modules/OTP/otp.port';

@ApiTags('otp')
@Controller('otp')
export class OTPController {
  constructor(@Inject(OTP_SERVICE) private readonly otpService: IOTPService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'verify otp code' })
  @ApiBody({
    type: OTPVerifyDTO,
    examples: {
      'OTP Code is received': {
        value: {
          phone: '0838683868',
          code: '12345',
        },
      },
    },
  })
  async verify(@Body() data: OTPVerifyDTO) {
    const result = this.otpService.verify(data);
    return result;
  }
}
