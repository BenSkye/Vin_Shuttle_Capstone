import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from 'src/modules/auth/auth.port';
import { OTP_SERVICE } from 'src/modules/OTP/otp.di-token';
import { IOTPService } from 'src/modules/OTP/otp.port';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { ICreateUserDto } from 'src/modules/users/users.dto';
import { IUserRepository } from 'src/modules/users/users.port';
import { convertObjectId } from 'src/share/utils';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { SMS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { ISMSProvider, ITokenProvider } from 'src/share/share.port';
import { UserRole } from 'src/share/enums';
import { MailerService } from '@nestjs-modules/mailer';
import { TokenPayload } from 'src/share/interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(OTP_SERVICE) private readonly otpService: IOTPService,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
    @Inject(SMS_PROVIDER) private readonly smsService: ISMSProvider,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    private readonly mailerService: MailerService,
  ) { }

  async register(data: ICreateUserDto): Promise<object> {
    //check if phone already exist
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

    // Validate required fields based on role
    if (data.role !== UserRole.CUSTOMER) {
      if (!data.email) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Email is required for non-customer roles',
            vnMessage: 'Email là bắt buộc đối với tài khoản không phải khách hàng',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!data.password) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Password is required for non-customer roles',
            vnMessage: 'Mật khẩu là bắt buộc đối với tài khoản không phải khách hàng',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const userExistEmail = await this.userRepository.findUser({ email: data.email });
    if (userExistEmail) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already exist',
          vnMessage: 'Email đã tồn tại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }


    // For customer role, only name and phone are required
    if (data.role === UserRole.CUSTOMER && (!data.name || !data.phone)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Name and phone are required for customer registration',
          vnMessage: 'Tên và số điện thoại là bắt buộc đối với đăng ký khách hàng',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash password if provided
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
          vnMessage: 'Lỗi khi tạo tài khoản',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return newUser;
  }
  async loginCustomer(phone: string): Promise<string> {
    //check if phone allready exist
    const userExist = await this.userRepository.findUser({ phone, role: UserRole.CUSTOMER });
    if (!userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Phone number not exist',
          vnMessage: 'Số điện thoại không tồn tại',
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
    await this.smsService.sendSmsWithoutBrandname(phone, `Mã OTP của bạn là: ${otp}`);
    return otp;
  }

  async loginByPassword(email: string, password: string): Promise<object> {
    const userExist = await this.userRepository.findUser({ email });
    if (!userExist) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'email not exist',
          vnMessage: 'Email không tồn tại',
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
          vnMessage: 'Mật khẩu sai',
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
          vnMessage: 'Người dùng không tồn tại',
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
          vnMessage: 'Mật khẩu cũ không đúng',
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
          vnMessage: 'Đổi mật khẩu thất bại',
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

  async createResetPasswordToken(email: string): Promise<boolean> {
    const user = await this.userRepository.findUser({ email });
    if (!user) {
      return;
    }
    console.log('user', user);
    // Tạo cặp key mới cho reset password

    const resetToken = await this.keyTokenService.createKeyTokenResetPassword({
      userId: convertObjectId(user._id.toString()),
      role: user.role,
      name: user.name,
      phone: user.phone,
    })

    const useRole = user.role
    let resetUrl: string
    if (useRole === UserRole.ADMIN) {
      resetUrl = `${process.env.FRONTEND_URL_ADMIN}/forgot-password?token=${resetToken}`;
    } else if (useRole === UserRole.MANAGER) {
      resetUrl = `${process.env.FRONTEND_URL_MANAGER}/forgot-password?token=${resetToken}`;
    } else if (useRole === UserRole.DRIVER) {
      resetUrl = `${process.env.FRONTEND_URL_DRIVER}/forgot-password?token=${resetToken}`;
    }

    console.log('resetUrl', resetUrl);
    const result = await this.mailerService.sendMail({
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl,
        currentYear: new Date().getFullYear(),
      },
    });
    console.log('result', result);
    return true;
  }

  async verifyResetToken(token: string): Promise<TokenPayload> {
    try {
      // Giải mã token để lấy userId mà không cần verify trước
      const decoded = jwt.decode(token) as TokenPayload;

      if (!decoded?._id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid reset token',
            vnMessage: 'Token đặt lại mật khẩu không hợp lệ',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Lấy publicKey từ keyTokenModel
      const keyToken = await this.keyTokenService.findByUserId(decoded._id);
      if (!keyToken?.resetPublicKey) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Reset token not found',
            vnMessage: 'Không tìm thấy thông tin token đặt lại',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Verify token với publicKey
      return await this.tokenProvider.verifyResetToken(token, keyToken.resetPublicKey);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error verifying reset token',
          vnMessage: 'Lỗi xác thực token đặt lại mật khẩu',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const decoded = await this.verifyResetToken(token);
    if (!decoded) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid reset token',
          vnMessage: 'Token đặt lại mật khẩu không hợp lệ',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const userId = decoded._id;
    const user = await this.userRepository.findUser({ _id: userId });
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
          vnMessage: 'Người dùng không tồn tại',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userRepository.updateUser(userId, {
      password: passwordHash,
    });
    if (!updatedUser) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to reset password',
          vnMessage: 'Đặt lại mật khẩu thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // Xóa cặp key reset password sau khi đã sử dụng
    await this.keyTokenService.handleClearPasswordToken(userId);
    return true;
  }
}
