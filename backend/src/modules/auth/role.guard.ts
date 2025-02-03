import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
        if (!requiredRoles) {
            return true; // Nếu không có roles yêu cầu, cho phép truy cập
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: User or roles not found');
        }

        const hasRole = requiredRoles.some((role) => user.role.includes(role));
        if (!hasRole) {
            throw new ForbiddenException('Access denied: User does not have the required role');
        }

        return true;
    }
}