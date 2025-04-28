import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return Promise.resolve(true);
    }

    const { user } = context.switchToHttp().getRequest<Request>();

    console.log('Required Roles:', requiredRoles, user);

    const rolesFiltered = requiredRoles.filter(role => role === user.rule);

    return Promise.resolve(rolesFiltered.length > 0);
  }
}
