import { ICreateUserDto } from 'src/modules/users/users.dto';
import { TokenPayload } from 'src/share/interface';

export interface IAuthService {
  register(data: ICreateUserDto): Promise<object>;
  loginCustomer(phone: string): Promise<string>;
  loginByPassword(email: string, passport: string): Promise<object>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<object>;

  createResetPasswordToken(email: string): Promise<boolean>
  verifyResetToken(token: string): Promise<TokenPayload | null>
  resetPassword(token: string, newPassword: string): Promise<boolean>
}
