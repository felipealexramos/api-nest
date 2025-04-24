import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  read() {
    return this.userService.list();
  }

  @Get(':id')
  readOne(@Param('id') id: string) {
    return this.userService.read(id);
  }

  @Post()
  create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() { name, email, password, birth_date }: UpdatePutUserDTO,
  ) {
    return this.userService.update(id, {
      name,
      email,
      password,
      birth_date,
    });
  }

  @Patch(':id')
  updatePartial(
    @Param('id') id: string,
    @Body() { name, email, password }: UpdatePatchUserDTO,
  ) {
    return this.userService.updatePartial(id, {
      name,
      email,
      password,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
