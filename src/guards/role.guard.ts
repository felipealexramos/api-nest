import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Role } from '../enums/role.enum';

interface User {
  role: Role;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requeridRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log({ requeridRoles });

    if (!requeridRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    const rolesFilted = requeridRoles.filter((role) => role === user.role);

    return rolesFilted.length > 0;
  }
}
