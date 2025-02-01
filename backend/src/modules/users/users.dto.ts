import { UserRole } from "src/modules/users/users.port";

export interface ICreateUserDto {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}

export interface IUpdateUserDto {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}