import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: CreateUserDTO) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdatePutUserDTO) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePartial(
    id: string,
    { email, name, password, birth_date, role }: UpdatePatchUserDTO,
  ) {
    const data: Partial<UpdatePatchUserDTO> = {};
    if (typeof email !== 'undefined') data.email = email;
    if (typeof name !== 'undefined') data.name = name;
    if (typeof password !== 'undefined') data.password = password;
    if (typeof birth_date !== 'undefined') {
      data.birth_date = new Date(birth_date).toISOString();
    }
    if (typeof role !== 'undefined') {
      data.role = role;
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    if (!id) {
      throw new Error('ID is required');
    }

    const user = await this.prisma.user.count({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
