import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Password' })
  readonly password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email' })
  readonly email: string;
}

export class ResponseLoginDto {
  token: string;
  user: any;
}
