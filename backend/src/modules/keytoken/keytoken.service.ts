import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IKeyTokenService, KeyTokenCreateDTO } from "src/modules/keytoken/keytoken.port";
import { KeyToken } from "src/modules/keytoken/keytoken.schema";


@Injectable()
export class KeyTokenService implements IKeyTokenService {
    constructor(
        @InjectModel(KeyToken.name) private readonly keyTokenModel: Model<KeyToken>
    ) { }

    async createKeyToken(data: KeyTokenCreateDTO): Promise<string> {
        try {
            const update = {
                publicKey: data.publicKey,
                privateKey: data.privateKey,
                refreshToken: data.refreshToken,
                refreshTokenUsed: []
            }
            const tokens = await this.keyTokenModel.findOneAndUpdate({ user: data.userId }, update, { new: true, upsert: true });
            return tokens ? tokens.publicKey : null;
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