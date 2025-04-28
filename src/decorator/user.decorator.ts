import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'generated/prisma';

export const UserDecorator = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: User }>();

    if (request.user) {
      if (filter) {
        if (filter in request.user) {
          return request.user[filter as keyof User]; // Access filtered user property safely
        } else {
          throw new NotFoundException(
            `Property '${filter}' not found on user.`,
          );
        }
      } else {
        return request.user;
      }
    } else {
      throw new NotFoundException(
        'Usuário não encontrado no Request. Use o AuthGuard para obter o usuário.',
      );
    }
  },
);
