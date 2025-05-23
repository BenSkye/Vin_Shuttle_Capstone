import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import { IUpdateUserDto, userParams } from 'src/modules/users/users.dto';
import { IUserRepository, IUserService } from 'src/modules/users/users.port';
import { UserDocument } from 'src/modules/users/users.schema';
import { UserRole } from 'src/share/enums';
import { processQueryParams } from 'src/share/utils/query-params.util';

@Injectable()
export class UsersService implements IUserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async listUsers(query: userParams): Promise<UserDocument[]> {
    const { filter, options } = processQueryParams(query, ['name', 'phone', 'email']);
    const select = ['name', 'phone', 'email', 'role', 'status', 'avatar'];
    const listUsers = await this.userRepository.listUsers(select, filter, options);
    return listUsers;
  }

  async getUserByRole(role: UserRole): Promise<UserDocument[]> {
    const select = ['name', 'phone', 'email', 'role', 'status', 'avatar'];
    const listUsers = await this.userRepository.findManyUsers(
      {
        role,
      },
      select,
    );
    return listUsers;
  }

  async viewProfile(id: string): Promise<object> {
    const select = ['name', 'phone', 'email', 'avatar'];
    const user = await this.userRepository.getUserById(id, select);
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User Not Found',
          vnMessage: 'Không tìm thấy người dùng',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateProfile(id: string, user: IUpdateUserDto): Promise<object> {
    const updatedUser = await this.userRepository.updateUser(id, user);
    return updatedUser;
  }

  async updateDriverProfile(id: string, user: IUpdateUserDto): Promise<object> {
    const driver = await this.userRepository.getUserById(id, ['role']);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Driver Not Found',
          vnMessage: 'Không tìm thấy tài xế',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedDriver = await this.userRepository.updateUser(id, user);
    if (!updatedDriver) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Update Driver Failed',
          vnMessage: 'Cập nhật tài xế thất bại',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return updatedDriver;
  }

  async saveUserPushToken(userId: string, pushToken: string): Promise<void> {
    console.log('saveUserPushToken', userId, pushToken);
    await this.userRepository.saveUserPushToken(userId, pushToken);
  }

  async getUserPushToken(userId: string): Promise<string | null> {
    const pushToken = await this.userRepository.getUserPushToken(userId);
    return pushToken;
  }

  async deletePushToken(userId: string): Promise<void> {
    await this.userRepository.deletePushToken(userId);
  }

  async getDriverById(id: string): Promise<object> {
    const select = ['name', 'phone', 'email', 'role', 'status', 'avatar'];
    const driver = await this.userRepository.getUserById(id, select);
    
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Driver Not Found',
          vnMessage: 'Không tìm thấy tài xế',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    
    return driver;
  }
}
