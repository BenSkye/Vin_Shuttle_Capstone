import { ICreateUserDto, IUpdateUserDto } from "src/modules/users/users.dto";
import { UserDocument } from "src/modules/users/users.schema";



export interface IUserRepository {
    listUsers(select: string[]): Promise<UserDocument[]>;
    getUserById(id: string, select: string[]): Promise<UserDocument>;
    findUser(query: any): Promise<UserDocument>;
    createUser(user: ICreateUserDto): Promise<UserDocument>;
    updateUser(id: string, user: IUpdateUserDto): Promise<UserDocument>;
}

export interface IUserService {
    listUsers(): Promise<object>;
    viewProfile(id: string): Promise<object>;
    updateProfile(id: string, user: IUpdateUserDto): Promise<object>;
}


