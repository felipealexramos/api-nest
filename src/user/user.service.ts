import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';

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

  async create({ email, name, password, birth_date }: CreateUserDTO) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
        birth_date,
      },
    });
  }

  async update(
    id: string,
    { email, name, password, birth_date }: UpdatePutUserDTO,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        password,
        birth_date: birth_date ? new Date(birth_date) : null,
      },
    });
  }

  async updatePartial(
    id: string,
    { email, name, password, birth_date }: UpdatePatchUserDTO,
  ) {
    const data: Partial<UpdatePatchUserDTO> = {};
    if (typeof email !== 'undefined') data.email = email;
    if (typeof name !== 'undefined') data.name = name;
    if (typeof password !== 'undefined') data.password = password;
    if (typeof birth_date !== 'undefined')
      data.birth_date = birth_date
        ? new Date(birth_date).toISOString()
        : undefined;
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
