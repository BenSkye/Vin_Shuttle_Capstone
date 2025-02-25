import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from 'src/modules/auth/auth.port';
import { OTP_SERVICE } from 'src/modules/OTP/otp.di-token';
import { IOTPService } from 'src/modules/OTP/otp.port';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import * as bcrypt from 'bcrypt';

import { ICreateUserDto } from 'src/modules/users/users.dto';
import { IUserRepository } from 'src/modules/users/users.port';
import { convertObjectId } from 'src/share/utils';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { SMS_PROVIDER } from 'src/share/di-token';
import { ISMSProvider } from 'src/share/interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(OTP_SERVICE) private readonly otpService: IOTPService,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
    @Inject(SMS_PROVIDER) private readonly smsService: ISMSProvider,
  ) {}

  async registerCustomer(data: ICreateUserDto): Promise<object> {
    //check if phone allready exist
    const userExist = await this.userRepository.findUser({ phone: data.phone });
    if (userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Phone number already exist',
          vnMessage: 'Số điện thoại đã tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      data.password = passwordHash;
    }
    const newUser = await this.userRepository.createUser(data);
    if (!newUser) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to create user',
          vnMesage: 'Lỗi khi tạo tài khoản',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return newUser;
  }

  async loginCustomer(phone: string): Promise<string> {
    //check if phone allready exist
    const userExist = await this.userRepository.findUser({ phone });
    if (!userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Phone number not exist',
          vnMesage: 'Số điện thoại không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const otp = await this.otpService.create({
      phone,
      role: userExist.role,
      name: userExist.name,
      _id: userExist._id.toString(),
    });
    // await this.smsService.sendOTP(phone, otp);
    return otp;
  }

  async loginByPassword(email: string, password: string): Promise<object> {
    const userExist = await this.userRepository.findUser({ email });
    if (!userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'email not exist',
          vnMesage: 'Email không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const match = await bcrypt.compare(password, userExist.password);
    if (!match) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Password not true',
          vnMesage: 'Mật khẩu sai',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const token = await this.keyTokenService.createKeyToken({
      userId: convertObjectId(userExist._id.toString()),
      role: userExist.role,
      name: userExist.name,
      phone: userExist.phone,
    });
    return { isValid: true, token: token, userId: userExist._id };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<object> {
    const userExist = await this.userRepository.findUser({ _id: userId });
    if (!userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'user not exist',
          vnMesage: 'Người dùng không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const match = await bcrypt.compare(oldPassword, userExist.password);
    if (!match) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Old Password not true',
          vnMesage: 'Mật khẩu cũ không đúng',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userRepository.updateUser(userExist._id.toString(), {
      password: passwordHash,
    });
    if (!updatedUser) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Change password fail',
          vnMesage: 'Đổi mật khẩu thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.keyTokenService.createKeyToken({
      userId: convertObjectId(updatedUser._id.toString()),
      role: updatedUser.role,
      name: updatedUser.name,
      phone: updatedUser.phone,
    });
    return { isValid: true, token: token, userId: userExist._id };
  }
}
