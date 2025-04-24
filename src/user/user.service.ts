import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async list() {
    return this.prisma.user.findMany();
  }

  async read(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create({ email, name, password }: CreateUserDTO) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }

  async update(id: string, { email, name, password }: CreateUserDTO) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        password,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
