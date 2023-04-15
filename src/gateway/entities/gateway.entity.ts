import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Column,
  Entity,
} from 'typeorm';

import { GatewayCurrency } from '../models/gatewayCurrency.model';
import { GatewayMethod } from '../models/gatewayMethod.model';
import { GatewayStatus } from '../models/gatewayStatus.model';
import { RequestARide } from '../../mobility/entities/requestARide.entity';

@Entity({ name: 'gateway_payments' })
export class Gateway {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RequestARide)
  @JoinColumn()
  service: RequestARide;

  @Column('varchar')
  hash: string;

  @Column('varchar')
  reference: string;

  @Column('varchar')
  currency: GatewayCurrency;

  @Column('varchar')
  status: GatewayStatus;

  @Column('varchar')
  method: GatewayMethod;

  @Column('integer', { name: 'price_in_cents' })
  priceInCents: number;

  @Column('integer', { default: 1 })
  installments: number;

  @Exclude()
  @CreateDateColumn({
    name: 'create_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt?: Date;

  @Exclude()
  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt?: Date;
}
