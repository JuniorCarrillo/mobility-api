import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { convertToCreateCardTokenizeDto } from '../dtos/cards.dto';
import { CreateCardTokenizationDto } from '../../gateway/dtos/cardTokenization.dto';
import { GatewayService } from '../../gateway/services/gateway.service';
import { RegisterDto } from '../../auth/dtos/register.dto';
import { CardToken } from '../entities/cardToken.entity';
import { Role } from '../../auth/models/roles.model';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CardToken) private cardTokenRepo: Repository<CardToken>,
    private gatewayService: GatewayService,
  ) {}

  async create(payload: RegisterDto) {
    const newUser = await this.usersRepo.create(payload);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return this.usersRepo.save(newUser);
  }

  async findById(id: number) {
    return this.usersRepo.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email },
    });
  }

  async findByRole(role: Role) {
    return this.usersRepo.findOne({
      where: { role },
      order: {
        createAt: 'DESC',
      },
    });
  }

  async addCardUser(userId: number, payload: CreateCardTokenizationDto) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('User not found');

    let responseGateway;
    try {
      const response = await this.gatewayService.cardTokenize(payload);
      responseGateway = response.data;
    } catch (e) {
      throw new BadRequestException('Gateway connections is error');
    }

    const toSave = convertToCreateCardTokenizeDto(user, responseGateway);
    const newCardUser = await this.cardTokenRepo.create(toSave);
    return this.cardTokenRepo.save(newCardUser);
  }

  async getCardByUserId(id: number) {
    return await this.cardTokenRepo.findOne({
      where: { user: { id } as User },
      order: { createAt: 'DESC' },
    });
  }
}
