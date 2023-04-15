import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { DriverController } from './controllers/driver.controller';
import { RiderController } from './controllers/rider.controller';
import { DriverService } from './services/driver.service';
import { RequestARide } from './entities/requestARide.entity';
import { RiderService } from './services/rider.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([RequestARide])],
  controllers: [RiderController, DriverController],
  providers: [DriverService, RiderService],
  exports: [DriverService, RiderService],
})
export class MobilityModule {}
