import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { UsersService } from './services/users.service';
import { CardToken } from './entities/cardToken.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [GatewayModule, TypeOrmModule.forFeature([User, CardToken])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
