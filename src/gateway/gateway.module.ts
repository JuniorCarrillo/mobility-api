import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GatewayService } from './services/gateway.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gateway } from './entities/gateway.entity';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Gateway]),
  ],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
