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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
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
  verify(token: string) {
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

    const token = this.jwtService.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      {
        audience: 'users',
        issuer: 'forget',
        expiresIn: '1h',
      },
    );

    await this.mailService.sendMail({
      subject: 'Recuperação de senha',
      to: email,
      template: 'forget',
      context: {
        // Passa as variáveis para o template
        name: user.name,
        token: this.createToken(user).accessToken,
      },
    });

    return { success: true };
  }

  async reset(password: string, token: string) {
    try {
      const data = this.verify(token);

      const user = await this.userService.read(data.id);

      if (!user) {
        throw new ForbiddenException('Usuário não encontrado.');
      }

      const salt = await bycript.genSalt(10);
      password = await bycript.hash(password, salt);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password,
        },
      });

      // Enviar e-mail de confirmação
      await this.mailService.sendMail({
        subject: 'Senha alterada com sucesso',
        to: user.email,
        template: 'reset',
        context: {
          // Passa as variáveis para o template
          name: user.name,
        },
      });

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token: string): boolean {
    try {
      this.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
