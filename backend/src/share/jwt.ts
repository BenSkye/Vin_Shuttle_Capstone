import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { tokenDTO, TokenPayload } from 'src/share/interface';
import * as jwt from 'jsonwebtoken';
import { ITokenProvider } from 'src/share/share.port';
import { HttpStatusCustom } from 'src/share/enums/HttpStatusCustom.enum';

@Injectable()
export class JwtTokenService implements ITokenProvider {
  private readonly expiresInAccessToken: string | number;
  private readonly expiresInRefreshToken: string | number;
  private readonly expiresInResetPasswordToken: string | number;

  constructor(
    expiresInAccessToken: string | number,
    expiresInRefreshToken: string | number,
    expiresInResetPasswordToken: string | number
  ) {
    this.expiresInAccessToken = expiresInAccessToken;
    this.expiresInRefreshToken = expiresInRefreshToken;
    this.expiresInResetPasswordToken = expiresInResetPasswordToken;
  }

  async generateTokenPair(
    payload: TokenPayload,
    publicKey: string,
    privateKey: string,
  ): Promise<tokenDTO> {
    try {
      const accessToken = jwt.sign(payload, privateKey, {
        expiresIn: this.expiresInAccessToken,
        algorithm: 'RS256',
      });
      const refreshToken = jwt.sign(payload, privateKey, {
        expiresIn: this.expiresInRefreshToken,
        algorithm: 'RS256',
      });
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      jwt.verify(
        accessToken,
        publicKey,
        {
          algorithms: ['RS256'],
        },
        (err: any, decoded: any) => {
          if (err) {
            console.error('error::', err);
          } else {
            console.log('decoded::', decoded);
          }
        },
      );
      console.log('publicKey', publicKey);

      return { accessToken, refreshToken };
    } catch (error) {
      return error;
    }
  }

  async verifyToken(token: string, key: string): Promise<any> {
    try {
      const decode = (await jwt.verify(token, key, {
        algorithms: ['RS256'],
      })) as TokenPayload;
      console.log('decode56', decode);
      return decode;
    } catch (error) {
      console.error('Error in verifyToken:', error.message);
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException(
          {
            statusCode: HttpStatusCustom.ACCESS_TOKEN_EXPIRED,
            message: 'Token has expired',
            vnMessage: 'Token đã hết hạn',
          },
          HttpStatusCustom.ACCESS_TOKEN_EXPIRED,
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid token',
            vnMessage: 'Token không hợp lệ',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async decodeToken(token: string): Promise<any> {
    try {
      console.log('token', token);
      const decode = await jwt.decode(token);
      console.log('decode', decode);
      return decode;
    } catch (error) {
      console.error('Error in verifyToken:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException(
          {
            statusCode: HttpStatusCustom.ACCESS_TOKEN_EXPIRED,
            message: 'Token has expired',
            vnMessage: 'Token đã hết hạn',
          },
          HttpStatusCustom.ACCESS_TOKEN_EXPIRED,
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid token',
            vnMessage: 'Token không hợp lệ',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async generateResetPasswordToken(
    payload: TokenPayload,
    privateKey: string,
  ): Promise<string> {
    try {
      const resetToken = jwt.sign(payload, privateKey, {
        expiresIn: this.expiresInResetPasswordToken,
        algorithm: 'RS256', // Sử dụng RS256 như hệ thống chính
      });

      console.log('Reset password token generated:', resetToken);
      return resetToken;
    } catch (error) {
      console.error('Error generating reset password token:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate reset password token',
          vnMessage: 'Lỗi khi tạo token đặt lại mật khẩu',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyResetToken(
    token: string,
    publicKey: string
  ): Promise<TokenPayload> {
    try {
      return await this.verifyToken(token, publicKey);
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error; // Giữ nguyên các error đã được xử lý trong verifyToken
    }
  }
}
