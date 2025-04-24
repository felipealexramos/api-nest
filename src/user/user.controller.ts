/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
    return {
      users: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ],
    };
  }

  @Get(':id')
  readOne(@Param() params) {
    return { user: {}, params };
  }

  @Post()
  create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Put(':id')
  update(@Param() params, @Body() { name, email, password }: UpdatePutUserDTO) {
    return {
      method: 'PUT',
      params,
      name,
      email,
      password,
    };
  }

  @Patch(':id')
  updatePartial(
    @Param() params,
    @Body() { name, email, password }: UpdatePatchUserDTO,
  ) {
    return { user: {}, params, name, email, password };
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return { id };
  }
}
