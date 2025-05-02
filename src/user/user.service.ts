import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async read(id: number) {
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
    try {
      const userExists = await this.usersRepository.findOneBy({
        email: data.email,
      });

      if (userExists) {
        throw new BadRequestException('Este e-mail já está em uso');
      }

      const salt = await bycript.genSalt();
      data.password = await bycript.hash(data.password, salt);

      const user = this.usersRepository.create(data);
      return this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Repassa o erro original, como o de e-mail já em uso
      }
      throw new BadRequestException(
        'Erro ao criar usuário',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: number, data: UpdatePutUserDTO) {
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
    id: number,
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

  async delete(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    await this.exists(id);

    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async exists(id: number): Promise<void> {
    const userExists = await this.usersRepository.findOneBy({ id });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
  }
}
