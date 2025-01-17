import { Types } from "mongoose";
import { KeyToken } from "src/modules/keytoken/keytoken.schema";


export interface KeyTokenCreateDTO {
    userId: Types.ObjectId,
    publicKey: string,
    privateKey: string,
    refreshToken: string
}

export interface IKeyTokenService {
    createKeyToken(data: KeyTokenCreateDTO): Promise<string>
    findByUserId(userId: string): Promise<KeyToken>
}