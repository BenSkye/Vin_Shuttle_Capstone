import { Inject, Injectable } from '@nestjs/common';
import { OTP_REPOSITORY } from 'src/modules/OTP/otp.di-token';
import { IOTPRepository, IOTPService, OTPPayload, OTPVerifyDTO } from 'src/modules/OTP/otp.port';
import * as otpGenerator from 'otp-generator';
import * as bcrypt from 'bcrypt';

import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { convertObjectId } from 'src/share/utils';
import { TOKEN_PROVIDER } from 'src/share/di-token';
import { ITokenProvider } from 'src/share/share.port';

@Injectable()
export class OTPService implements IOTPService {
  constructor(
    @Inject(OTP_REPOSITORY) private readonly OTPRepository: IOTPRepository,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
  ) { }

  async create(data: OTPPayload): Promise<string> {
    const { phone, role, name, _id } = data;
    //tạo ra code có 5 chữ số từ 9999 đến 99999
    const code = otpGenerator.generate(5, {
      // Tạo OTP dài 5 chữ số
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log('code', code);
    const salt = await bcrypt.genSalt(10);
    const hashcode = await bcrypt.hash(code, salt);
    const token = await this.keyTokenService.createKeyToken({
      userId: convertObjectId(_id),
      role: role,
      name: name,
      phone: phone,
    });
    const newOtp = await this.OTPRepository.insert({
      user: convertObjectId(_id),
      phone: phone,
      code: hashcode,
      token: token,
    });
    if (!newOtp) {
      throw new Error('Failed to create OTP');
    }

    return code;
  }

  async verify(data: OTPVerifyDTO): Promise<object> {
    const { phone, code } = data;
    const otpDatas = await this.OTPRepository.findOTPs({ phone: phone });
    if (!otpDatas || otpDatas.length === 0) {
      return { isValid: false };
    }
    const otpData = otpDatas[otpDatas.length - 1];
    console.log('code', code);
    const isValid = await bcrypt.compare(code, otpData.code);
    if (!isValid) {
      return { isValid: false };
    }
    const token = otpData.token;
    const userId = otpData.user;
    return { isValid: true, token: token, userId: userId };
  }
}
