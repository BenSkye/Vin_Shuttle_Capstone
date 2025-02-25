import { ICreateUserDto } from 'src/modules/users/users.dto';

export interface IAuthService {
  registerCustomer(data: ICreateUserDto): Promise<object>;
  loginCustomer(phone: string): Promise<string>;
  loginByPassword(email: string, passport: string): Promise<object>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<object>;
}
