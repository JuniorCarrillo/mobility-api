import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Column,
  Entity,
} from 'typeorm';
import { PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { User } from './user.entity';

@Entity({ name: 'card_tokens' })
export class CardToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar' })
  token: string;

  @Column({ type: 'varchar' })
  brand: string;

  @Column({ type: 'varchar' })
  last_four: string;

  @Column({ type: 'varchar' })
  exp_year: string;

  @Column({ type: 'varchar' })
  exp_month: string;

  @CreateDateColumn({
    name: 'created_at',
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

export class UpdateCardToken extends PartialType(CardToken) {}
