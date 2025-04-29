import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthService } from './auth.service';
import { UserDecorator } from '../decorator/user.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileService } from 'src/file/file.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  async uploadPhoto(
    @UserDecorator() user: { id: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/png',
          }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024, // 1MB
          }),
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const filePath = await this.fileService.upload(user.id, photo.buffer);
    return { message: 'Photo uploaded successfully', filePath };
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files')) // Note: Use `FilesInterceptor` for multiple files
  @Post('files')
  async uploadFiles(
    @UserDecorator() user: { id: string },
    @UploadedFiles() files: Express.Multer.File[], // Use `@UploadedFiles` for multiple files
  ) {
    const filePaths = await this.fileService.uploadFiles(user.id, files); // Pass the `files` array directly
    return { message: 'Files uploaded successfully', filePaths };
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'photo',
        maxCount: 1,
      },
      {
        name: 'documents',
        maxCount: 10,
      },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post('files-fields')
  async uploadFilesFields(
    @UserDecorator() user: { id: string },
    @UploadedFiles()
    files: { photo: Express.Multer.File[]; documents: Express.Multer.File[] },
  ) {
    const result = await this.fileService.uploadFilesWithFields(user.id, files);
    return {
      message: 'Files uploaded successfully',
      ...result,
    };
  }
}
