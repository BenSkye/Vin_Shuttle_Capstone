import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import { IUpdateUserDto } from 'src/modules/users/users.dto';
import { IUserRepository, IUserService } from 'src/modules/users/users.port';
import { UserDocument } from 'src/modules/users/users.schema';
import { UserRole } from 'src/share/enums';

@Injectable()
export class UsersService implements IUserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async listUsers(): Promise<UserDocument[]> {
    const select = ['name', 'phone', 'email', 'role', 'status', 'avatar'];
    const listUsers = await this.userRepository.listUsers(select);
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
          vnMesage: 'Không tìm thấy người dùng',
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
}
