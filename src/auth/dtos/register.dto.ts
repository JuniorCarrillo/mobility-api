import {
  IsNotEmpty,
  MinLength,
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../models/roles.model';
import { Type } from 'class-transformer';

export class RequestRegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name', required: true })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Password', minLength: 8, required: true })
  @MinLength(8)
  readonly password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email', required: true })
  readonly email: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name', required: true })
  readonly name: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Role', required: true, enum: Role })
  role: Role;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Password', minLength: 8, required: true })
  @MinLength(8)
  readonly password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email', required: true })
  readonly email: string;
}

export class ResponseRegisterDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Id', required: true })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name', required: true })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email', required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Role', required: true, enum: Role })
  role: Role;

  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ description: 'Updated at', required: false })
  updatedAt?: Date;

  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ description: 'Created at', required: false })
  createdAt?: Date;
}

export function convertToRegisterDto(
  payload: RequestRegisterDto,
  role: Role,
): RegisterDto {
  return {
    ...payload,
    role,
  };
}
