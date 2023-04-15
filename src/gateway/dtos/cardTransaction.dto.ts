import {
  IsNotEmpty,
  IsPositive,
  MaxLength,
  IsString,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { GatewayCurrency } from '../models/gatewayCurrency.model';
import { GatewayMethod } from '../models/gatewayMethod.model';
import { GatewayStatus } from '../models/gatewayStatus.model';
import { RequestARide } from '../../mobility/entities/requestARide.entity';

class CreateCardTransactionPaymentMethodDto {
  type: GatewayMethod;
  installments: number;
  token: string;
}

export class CreateCardTransactionDto {
  payment_method: CreateCardTransactionPaymentMethodDto;
  amount_in_cents: number;
  reference: string;
  currency: GatewayCurrency;
  customer_email: string;
  acceptance_token: string;
}

export class ResponseCardTransactionDto {
  data: ResponseCardTransactionDataDto;
}

export class ResponseCardTransactionDataDto {
  id: string;
  amount_in_cents: number;
  reference: string;
  currency: GatewayCurrency;
  payment_method: ResponseCardTransactionPaymentMethodDto;
  payment_method_type: GatewayMethod;
  status: GatewayStatus;
}

export class ResponseCardTransactionPaymentMethodDto {
  type: GatewayMethod;
  installments: number;
}

export class TransactionDto {
  @Type(() => RequestARide)
  @IsNotEmpty()
  @ApiProperty({ description: 'Request a ride service', required: true })
  service: RequestARide;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Hash payment or payment id', required: true })
  hash: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Reference', required: true })
  reference: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @ApiProperty({
    description: 'Currency',
    required: true,
    enum: GatewayCurrency,
  })
  currency: GatewayCurrency;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Status', required: true, enum: GatewayStatus })
  status: GatewayStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Method', required: true, enum: GatewayMethod })
  method: GatewayMethod;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(350000)
  @ApiProperty({ description: 'Price in cents', required: true })
  priceInCents: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(12)
  @ApiProperty({ description: 'Installments', required: true })
  installments: number;
}

export function convertToTransactionDto(
  ride: RequestARide,
  transaction: ResponseCardTransactionDataDto,
): TransactionDto {
  return {
    service: ride,
    hash: transaction.id,
    reference: transaction.reference,
    currency: transaction.currency,
    status: transaction.status,
    method: transaction.payment_method_type,
    priceInCents: transaction.amount_in_cents,
    installments: ride.installments,
  };
}
