import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDTO {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minNumbers: 1,
  })
  password: string;
  @IsOptional()
  @IsDateString()
  birth_date: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
