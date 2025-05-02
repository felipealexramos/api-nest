import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    {
      const request = context.switchToHttp().getRequest<Request>();
      console.log('Request Body:', request.body);
      const authHeader = request.headers['authorization'];
      const token =
        typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

      if (!token) {
        return Promise.resolve(false);
      }

      try {
        const userData = this.authService.verify(token, 'login');
        const user = await this.userService.read(userData.id);
        if (!user) {
          return Promise.resolve(false);
        }
        request.user = user;
        return Promise.resolve(true);
      } catch (error) {
        console.error('Error in AuthGuard:', error);
        return Promise.resolve(false);
      }
    }
  }
}
