import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bycript from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  createToken(user: User): { accessToken: string } {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const options: JwtSignOptions = {
      expiresIn: '7 days',
      subject: String(user.id),
      issuer: 'login',
      audience: 'users',
    };

    const token = this.jwtService.sign(payload, options);
    return { accessToken: token };
  }
  checkToken(token: string) {
    try {
      const data: { id: string; name: string; email: string } =
        this.jwtService.verify(token, {
          audience: 'users',
          issuer: 'login',
        });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const isValidPassword = await bycript.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    return this.createToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ForbiddenException('E-mail está incorreto.');
    }

    //TO DO: Enviar e-mail de recuperação
    return true;
  }

  async reset(password: string, token: string) {
    //TO DO: Validar o token

    const id = '0';
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
    return this.createToken(user);
  }

  isValidToken(token: string): boolean {
    try {
      this.checkToken(token);
      return true;
    } catch {
      return false;
    }
  }
}
