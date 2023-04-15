import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Column,
  Entity,
} from 'typeorm';

import { RideStatus } from '../models/rideStatus.model';
import { CardToken } from '../../users/entities/cardToken.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'requests_a_ride' })
export class RequestARide {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  rider: User;

  @ManyToOne(() => User)
  @JoinColumn()
  driver: User;

  @Column('float', { array: true })
  location: number[];

  @Column('float', { array: true })
  destination: number[];

  @Column('varchar', { default: RideStatus.REQUEST })
  status: RideStatus;

  @Column('integer', { default: 1 })
  installments: number;

  @ManyToOne(() => CardToken)
  @JoinColumn()
  card: CardToken;

  @CreateDateColumn({
    name: 'finish_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  finishAt?: Date;

  @CreateDateColumn({
    name: 'create_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt?: Date;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt?: Date;
}
