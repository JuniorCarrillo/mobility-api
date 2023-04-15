import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ResponseCardTokenizationDto } from '../../gateway/dtos/cardTokenization.dto';
import { User } from '../entities/user.entity';

export class CreateCardTokenizeDto {
  @Type(() => User)
  @IsNotEmpty()
  @ApiProperty({ description: 'User', required: true })
  readonly user: User;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Brand', required: true })
  readonly brand: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Token', required: true })
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Last four number', required: true })
  readonly last_four: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Exp year', required: true })
  readonly exp_year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Exp month', required: true })
  readonly exp_month: string;
}

export function convertToCreateCardTokenizeDto(
  user: User,
  payload: ResponseCardTokenizationDto,
): CreateCardTokenizeDto {
  return {
    user,
    brand: payload.data.brand,
    last_four: payload.data.last_four,
    exp_year: payload.data.exp_year,
    exp_month: payload.data.exp_month,
    token: payload.data.id,
  };
}
