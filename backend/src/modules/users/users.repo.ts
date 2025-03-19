import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from 'src/modules/users/users.dto';
import { IUserRepository } from 'src/modules/users/users.port';
import { User, UserDocument } from 'src/modules/users/users.schema';
import { REDIS_CLIENT } from 'src/share/di-token';
import { getSelectData } from 'src/share/utils';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) { }

  async listUsers(select: string[]): Promise<UserDocument[]> {
    const result = await this.userModel.find().select(getSelectData(select)).exec();
    return result;
  }
  async getUserById(id: string, select: string[]): Promise<UserDocument> {
    const result = await this.userModel.findById(id).select(getSelectData(select)).exec();
    return result;
  }
  async createUser(user: ICreateUserDto): Promise<UserDocument> {
    const newUser = await this.userModel.create(user);
    return newUser;
  }
  async updateUser(id: string, user: IUpdateUserDto): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
    return updatedUser;
  }
  async findUser(query: any): Promise<UserDocument> {
    const result = await this.userModel.findOne(query).exec();
    return result;
  }

  async findManyUsers(query: any, select: string[]): Promise<UserDocument[]> {
    const result = await this.userModel.find(query).select(getSelectData(select)).exec();
    return result;
  }

  async saveUserPushToken(userId: string, pushToken: string): Promise<void> {
    const key = `userPushToken:${userId}`;
    await this.redisClient.set(key, pushToken);
  }

  async getUserPushToken(userId: string): Promise<string | null> {
    const key = `userPushToken:${userId}`;
    const pushToken = await this.redisClient.get(key);
    return pushToken;
  }

  async deletePushToken(userId: string): Promise<void> {
    const key = `userPushToken:${userId}`;
    await this.redisClient.del(key);
  }
}
