import { ICreateUserDto } from "src/modules/users/users.dto";


export interface IAuthService {
    registerCustomer(data: ICreateUserDto): Promise<object>;
    loginCustomer(phone: string): Promise<string>;
}
