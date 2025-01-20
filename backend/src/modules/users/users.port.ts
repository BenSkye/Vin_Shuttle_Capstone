import { ICreateUserDto, IUpdateUserDto } from "src/modules/users/users.dto";
import { UserDocument } from "src/modules/users/users.schema";

export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    DRIVER = 'driver'
}


export interface IUserRepository {
    listUsers(): Promise<UserDocument[]>;
    getUserById(id: string, select: string[]): Promise<UserDocument>;
    findUser(query: any): Promise<UserDocument>;
    createUser(user: ICreateUserDto): Promise<UserDocument>;
    updateUser(id: string, user: IUpdateUserDto): Promise<UserDocument>;
}

export interface IUserService {
    listUsers(): Promise<UserDocument[]>;
    viewProfile(id: string): Promise<object>;

}


