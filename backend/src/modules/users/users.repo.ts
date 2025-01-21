import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateUserDto, IUpdateUserDto } from "src/modules/users/users.dto";
import { IUserRepository } from "src/modules/users/users.port";
import { User, UserDocument } from "src/modules/users/users.schema";
import { getSelectData } from "src/share/utils";


@Injectable()
export class UsersRepository implements IUserRepository {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {
    }

    async listUsers(select: string[]): Promise<UserDocument[]> {
        const result = await this.userModel.find().select(getSelectData(select)).exec()
        return result
    }
    async getUserById(id: string, select: string[]): Promise<UserDocument> {
        const result = await this.userModel.findById(id).select(getSelectData(select)).exec()
        return result
    }
    async createUser(user: ICreateUserDto): Promise<UserDocument> {
        const newUser = await this.userModel.create(user)
        return newUser
    }
    async updateUser(id: string, user: IUpdateUserDto): Promise<UserDocument> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, user, { new: true }).exec()
        return updatedUser
    }
    async findUser(query: any): Promise<UserDocument> {
        const result = await this.userModel.findOne(query).exec()
        return result
    }

}