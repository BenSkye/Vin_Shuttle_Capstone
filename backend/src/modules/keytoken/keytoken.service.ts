import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IKeyTokenService, KeyTokenCreateDTO } from 'src/modules/keytoken/keytoken.port';
import { KeyToken } from 'src/modules/keytoken/keytoken.schema';
import { TOKEN_PROVIDER } from 'src/share/di-token';
import { ITokenProvider } from 'src/share/interface';
import * as crypto from 'crypto';

@Injectable()
export class KeyTokenService implements IKeyTokenService {
  constructor(
    @InjectModel(KeyToken.name) private readonly keyTokenModel: Model<KeyToken>,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async createKeyToken(data: KeyTokenCreateDTO): Promise<object> {
    try {
      const payload = {
        _id: data.userId.toString(),
        role: data.role,
        name: data.name,
        phone: data.phone,
      };
      const privateKey = crypto.randomBytes(64).toString('hex');
      const publicKey = crypto.randomBytes(64).toString('hex');
      console.log('publicKey', publicKey.toString());
      const token = await this.tokenProvider.generateTokenPair(
        payload,
        publicKey.toString(),
        privateKey.toString(),
      );
      const update = {
        publicKey: publicKey,
        privateKey: privateKey,
        refreshToken: token.refreshToken,
        refreshTokenUsed: [],
      };
      const tokens = await this.keyTokenModel.findOneAndUpdate({ user: data.userId }, update, {
        new: true,
        upsert: true,
      });
      return tokens ? token : null;
    } catch (err) {
      return err;
    }
  }

  async findByUserId(userId: string): Promise<KeyToken> {
    try {
      return await this.keyTokenModel.findOne({ user: userId });
    } catch (err) {
      return err;
    }
  }
}
