import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserServiceService } from './user.service/user.service.service';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserServiceService, UserService],
  exports: [],
})
export class UserModule {}
