import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import {
  convertToCreateRequestARideDto,
  RequestARideDto,
} from '../dtos/requestARide.dto';
import { GatewayService } from '../../gateway/services/gateway.service';
import { RequestARide } from '../entities/requestARide.entity';
import { UsersService } from '../../users/services/users.service';
import { Role } from '../../auth/models/roles.model';

@Injectable()
export class RiderService {
  constructor(
    private usersService: UsersService,
    private gatewayService: GatewayService,
    @InjectRepository(RequestARide)
    private requestARideRepo: Repository<RequestARide>,
  ) {}

  async create(userId: number, payload: RequestARideDto) {
    const card = await this.usersService.getCardByUserId(userId);
    if (!card)
      throw new BadRequestException(
        'You do not have credit cards linked to your user. Link one and try again.',
      );

    const driver = await this.usersService.findByRole(Role.DRIVER);
    if (!driver)
      throw new BadRequestException('There are no registered drivers.');

    const rider = await this.usersService.findById(userId);
    const requestARide = convertToCreateRequestARideDto(
      rider,
      driver,
      card,
      payload,
    );

    const newRequestARide = await this.requestARideRepo.create(requestARide);
    return await this.requestARideRepo.save(newRequestARide);
  }
}
