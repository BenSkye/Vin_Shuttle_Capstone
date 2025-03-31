import { ICreateUserDto, IUpdateUserDto, userParams } from 'src/modules/users/users.dto';
import { UserDocument } from 'src/modules/users/users.schema';
import { UserRole } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';

export interface IUserRepository {
  listUsers(
    select: string[],
    query?: object,
    options?: QueryOptions,
  ): Promise<UserDocument[]>;
  getUserById(id: string, select: string[]): Promise<UserDocument>;
  findUser(query: any): Promise<UserDocument>;
  findManyUsers(query: any, select: string[]): Promise<UserDocument[]>;
  createUser(user: ICreateUserDto): Promise<UserDocument>;
  updateUser(id: string, user: IUpdateUserDto): Promise<UserDocument>;
  saveUserPushToken(userId: string, pushToken: string): Promise<void>;
  getUserPushToken(userId: string): Promise<string | null>;
  deletePushToken(userId: string): Promise<void>;
}

export interface IUserService {
  listUsers(query: userParams): Promise<UserDocument[]>;
  getUserByRole(role: UserRole): Promise<UserDocument[]>;
  viewProfile(id: string): Promise<object>;
  updateProfile(id: string, user: IUpdateUserDto): Promise<object>;
  updateDriverProfile(id: string, user: IUpdateUserDto): Promise<object>;
  saveUserPushToken(userId: string, pushToken: string): Promise<void>;
  getUserPushToken(userId: string): Promise<string | null>;
  deletePushToken(userId: string): Promise<void>;
}
