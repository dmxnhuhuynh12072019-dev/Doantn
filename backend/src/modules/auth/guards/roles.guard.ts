import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    const userRole = user.role ? user.role.trim().toLowerCase() : '';

    // Quản trị viên (Admin) luôn có quyền truy cập mọi tính năng
    if (userRole === 'admin') {
      return true;
    }

    const hasRole = requiredRoles.some(role => role.trim().toLowerCase() === userRole);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }
    return true;
  }
}
