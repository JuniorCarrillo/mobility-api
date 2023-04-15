import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCardTokenizationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Card number', required: true })
  number: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Card cvc', required: true })
  cvc: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Card exp month', required: true })
  exp_month: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Card exp year', required: true })
  exp_year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Card holder', required: true })
  card_holder: string;
}

class ResponseCardTokenizationDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Id', required: true })
  id: string;

  @Type(() => Date)
  @IsNotEmpty()
  @ApiProperty({ description: 'Create at date', required: true })
  created_at: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Brand', required: true })
  brand: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name', required: true })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Last four', required: true })
  last_four: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Exp year', required: true })
  exp_year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Exp month', required: true })
  exp_month: string;
}

export class ResponseCardTokenizationDto {
  @Type(() => ResponseCardTokenizationDataDto)
  @IsNotEmpty()
  @ApiProperty({ description: 'Exp month', required: true })
  data: ResponseCardTokenizationDataDto;
}
