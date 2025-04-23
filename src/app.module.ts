import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UserServiceService } from './user.service/user.service.service';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService, UserServiceService],
})
export class AppModule {}
