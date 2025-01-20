import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { IAuthService } from "src/modules/auth/auth.port";
import { OTP_SERVICE } from "src/modules/OTP/otp.di-token";
import { IOTPService } from "src/modules/OTP/otp.port";
import { USER_REPOSITORY } from "src/modules/users/users.di-token";
import * as bcrypt from 'bcrypt';

import { ICreateUserDto } from "src/modules/users/users.dto";
import { IUserRepository } from "src/modules/users/users.port";


@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(OTP_SERVICE) private readonly otpService: IOTPService
    ) { }

    async registerCustomer(data: ICreateUserDto): Promise<object> {
        //check if phone allready exist
        const userExist = await this.userRepository.findUser({ phone: data.phone });
        if (userExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Phone number already exist'
            }, HttpStatus.BAD_REQUEST);
        }
        if (data.password) {
            const passwordHash = await bcrypt.hash(data.password, 10);
            data.password = passwordHash
        }
        const newUser = await this.userRepository.createUser(data);
        if (!newUser) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Failed to create user'
            }, HttpStatus.BAD_REQUEST);
        }
        return newUser;
    }


    async loginCustomer(phone: string): Promise<string> {
        //check if phone allready exist
        const userExist = await this.userRepository.findUser({ phone });
        if (!userExist) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Phone number not exist'
            }, HttpStatus.NOT_FOUND);
        }
        console.log('userExist', userExist);
        const otp = await this.otpService.create({ phone, role: userExist.role, name: userExist.name, _id: userExist._id.toString() });
        return otp;
    }

}