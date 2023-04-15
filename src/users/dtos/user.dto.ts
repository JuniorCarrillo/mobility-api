import { IsNotEmpty, MinLength, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../auth/models/roles.model';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email', required: true })
  readonly email: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name', required: true })
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Role', required: true, enum: Role })
  role: Role;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Password', minLength: 8, required: true })
  @MinLength(8)
  readonly password: string;
}
