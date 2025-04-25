import { IsJWT, IsString } from 'class-validator';

export class AuthResetDTO {
  @IsString()
  password: string;

  @IsJWT()
  token: string;
}
