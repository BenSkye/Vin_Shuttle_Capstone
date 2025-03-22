import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IKeyTokenService, KeyTokenCreateDTO } from 'src/modules/keytoken/keytoken.port';
import { KeyToken } from 'src/modules/keytoken/keytoken.schema';
import { TOKEN_PROVIDER } from 'src/share/di-token';
import * as crypto from 'crypto';
import { ITokenProvider } from 'src/share/share.port';
import { convertObjectId } from 'src/share/utils';
import { TokenPayload } from 'src/share/interface';

@Injectable()
export class KeyTokenService implements IKeyTokenService {
  constructor(
    @InjectModel(KeyToken.name) private readonly keyTokenModel: Model<KeyToken>,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) { }

  async createKeyToken(data: KeyTokenCreateDTO): Promise<object> {
    try {
      const payload = {
        _id: data.userId.toString(),
        role: data.role,
        name: data.name,
        phone: data.phone,
      };
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      })
      console.log('publicKey', publicKey.toString());
      const token = await this.tokenProvider.generateTokenPair(
        payload,
        publicKey.toString(),
        privateKey.toString(),
      );
      const update = {
        publicKey: publicKey,
        // privateKey: privateKey,
        refreshToken: token.refreshToken,
        refreshTokenUsed: [],
      };
      const tokens = await this.keyTokenModel.findOneAndUpdate({ user: data.userId }, update, {
        new: true,
        upsert: true,
      });
      return tokens ? token : null;
    } catch (err) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleRefreshToken(userId: string, refreshToken: string): Promise<object> {
    try {
      const keyToken = await this.keyTokenModel.findOne({ user: convertObjectId(userId) });
      if (!keyToken) {
        return null;
      }
      if (keyToken.refreshTokenUsed.includes(refreshToken)) {
        //it mean someone has used this refresh token and want to get access token by it (may be hacker get the refresh token)
        //delete keytoken and return null
        await this.keyTokenModel.deleteOne({ user: convertObjectId(userId) });
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Refresh token has been used',
            vnMessage: 'Phiên đăng nhập không hợp lệ',
          },
          HttpStatus.UNAUTHORIZED)
      }
      if (keyToken.refreshToken !== refreshToken) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Refresh token not true',
            vnMessage: 'Phiên đăng nhập không hợp lệ',
          },
          HttpStatus.UNAUTHORIZED)
      }
      const decode = await this.tokenProvider.verifyToken(refreshToken, keyToken.publicKey);
      const payload: TokenPayload = {
        _id: decode._id,
        role: decode.role,
        name: decode.name,
        phone: decode.phone
      };
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      })
      const token = await this.tokenProvider.generateTokenPair(
        payload,
        publicKey.toString(),
        privateKey.toString(),
      )
      console.log('token99', token)
      const refreshTokenUsedList = [...keyToken.refreshTokenUsed, refreshToken];
      const update = {
        publicKey: publicKey,
        refreshToken: token.refreshToken,
        refreshTokenUsed: refreshTokenUsedList,
      };
      const tokens = await this.keyTokenModel.findOneAndUpdate({ user: keyToken.user }, update, {
        new: true,
        upsert: true,
      });
      return tokens ? token : null;
    } catch (err) {
      console.error('Error in handleRefreshToken:', err);
      if (err instanceof HttpException) {
        throw err;
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

  async findByUserId(userId: string): Promise<KeyToken> {
    try {
      return await this.keyTokenModel.findOne({ user: userId });
    } catch (err) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
