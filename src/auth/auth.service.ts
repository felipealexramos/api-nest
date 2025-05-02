import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bycript from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  createToken(user: UserEntity): { accessToken: string } {
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
  verify(token: string, expectedIssuer: string) {
    try {
      const data: { id: number; name: string; email: string } =
        this.jwtService.verify(token, {
          audience: 'users',
          issuer: expectedIssuer, // Verifica o issuer esperado
        });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({
      email,
    });

    console.log(user);
    if (!user) {
      throw new UnauthorizedException('Usuário não existe. Faça cadastro.');
    }
    const isValidPassword = await bycript.compare(password, user.password);
    console.log(isValidPassword);
    if (!isValidPassword) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    return this.createToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.usersRepository.findOneBy({
      email,
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

    return { success: true, token };
  }

  async reset(password: string, token: string) {
    try {
      const data = this.verify(token, 'forget'); // Passa o issuer correto

      const user = await this.userService.read(data.id);

      if (!user) {
        throw new ForbiddenException('Usuário não encontrado.');
      }

      const salt = await bycript.genSalt(10);
      password = await bycript.hash(password, salt);

      await this.usersRepository.update({ id: user.id }, { password });

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token: string): boolean {
    try {
      this.verify(token, 'users'); // Verifica o issuer correto
      return true;
    } catch {
      return false;
    }
  }
}
