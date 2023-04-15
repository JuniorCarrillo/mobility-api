import { ApiProperty } from '@nestjs/swagger';
import {
  IsPositive,
  IsNotEmpty,
  IsNumber,
  IsArray,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CardToken } from '../../users/entities/cardToken.entity';
import { User } from '../../users/entities/user.entity';

// @ApiSchema({name: 'User'})
export class RequestARideDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Location coords',
    example: [6.227613, -75.5799254],
  })
  readonly location: number[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Destination coords',
    example: [6.1664595, -75.625661],
  })
  readonly destination: number[];

  @IsNumber()
  @IsPositive()
  @Max(12)
  @IsNotEmpty()
  @ApiProperty({ description: 'Installments payment', example: 5 })
  readonly installments: number;
}

export class CreateARideDto {
  @Type(() => User)
  @IsNotEmpty()
  @ApiProperty({ description: 'Rider' })
  rider: User;

  @Type(() => User)
  @IsNotEmpty()
  @ApiProperty({ description: 'Driver' })
  driver: User;

  @Type(() => CardToken)
  @IsNotEmpty()
  @ApiProperty({ description: 'Card' })
  card: CardToken;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: 'Location coords' })
  location: number[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: 'Destination coords' })
  destination: number[];

  @IsNumber()
  @IsPositive()
  @Max(12)
  @IsNotEmpty()
  @ApiProperty({ description: 'Installments payment' })
  installments: number;
}

export function convertToCreateRequestARideDto(
  rider: User,
  driver: User,
  card: CardToken,
  payload: RequestARideDto,
): CreateARideDto {
  return {
    rider,
    driver,
    card,
    location: payload.location,
    destination: payload.destination,
    installments: payload.installments,
  };
}
