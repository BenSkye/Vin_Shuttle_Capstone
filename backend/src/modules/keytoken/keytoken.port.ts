import { Types } from 'mongoose';
import { KeyToken } from 'src/modules/keytoken/keytoken.schema';

export interface KeyTokenCreateDTO {
  userId: Types.ObjectId;
  role: string;
  name: string;
  phone: string;
}

export interface IKeyTokenService {
  createKeyToken(data: KeyTokenCreateDTO): Promise<object>;
  handleRefreshToken(userId: string, refreshToken: string): Promise<object>;
  findByUserId(userId: string): Promise<KeyToken>;
}
