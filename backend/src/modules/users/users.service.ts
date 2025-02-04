import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/modules/users/users.di-token';
import { IUserRepository, IUserService } from 'src/modules/users/users.port';
import { UserDocument } from 'src/modules/users/users.schema';

@Injectable()
export class UsersService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository
    ) { }

    async listUsers(): Promise<UserDocument[]> {
        const select = ['name', 'phone', 'email', 'role']
        const listUsers = await this.userRepository.listUsers(select);
        return listUsers
    }
    async viewProfile(id: string): Promise<object> {
        const select = ['name', 'phone', 'email']
        const user = await this.userRepository.getUserById(id, select)
        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'User Not Found'
            }, HttpStatus.NOT_FOUND);
        }
        return user;
    }

}
