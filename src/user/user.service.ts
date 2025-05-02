import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import * as bycript from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}
  async list() {
    return this.usersRepository.find();
  }

  async read(id: string) {
    if (!id) {
      throw new Error('ID is required');
    }

    const user = await this.usersRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: CreateUserDTO) {
    const salt = await bycript.genSalt();

    data.password = await bycript.hash(data.password, salt);

    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: UpdatePutUserDTO) {
    const salt = await bycript.genSalt();

    data.password = await bycript.hash(data.password, salt);

    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.save({ ...user, ...data });
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

    if (password) {
      const salt = await bycript.genSalt();
      data.password = await bycript.hash(password, salt);
    }
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersRepository.save({ ...user, ...data });
  }

  async delete(id: string) {
    if (!id) {
      throw new Error('ID is required');
    }

    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
