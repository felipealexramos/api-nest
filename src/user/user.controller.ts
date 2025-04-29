import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UserService } from './user.service';
import { Roles } from 'src/decorator/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  read() {
    return this.userService.list();
  }

  @Roles(Role.Admin)
  @Get(':id')
  readOne(@Param('id') id: string) {
    return this.userService.read(id);
  }

  @Post()
  create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Roles(Role.Admin)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() { name, email, password, birth_date, role }: UpdatePutUserDTO,
  ) {
    return this.userService.update(id, {
      name,
      email,
      password,
      birth_date,
      role,
    });
  }

  @Roles(Role.Admin)
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

  @Roles(Role.Admin)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
