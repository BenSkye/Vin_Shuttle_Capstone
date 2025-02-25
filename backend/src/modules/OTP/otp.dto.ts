import { ApiProperty } from '@nestjs/swagger';

export class OTPVerifyDTO {
  @ApiProperty({
    description: 'user login phone',
    example: '0838683868',
  })
  phone: string;

  @ApiProperty({
    description: 'OTP is received',
    example: '12345',
  })
  code: string;
}
