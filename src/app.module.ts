import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { MobilityModule } from './mobility/mobility.module';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './gateway/gateway.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import configSchema from './config.schema';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [config],
      validationSchema: configSchema,
    }),
    MobilityModule,
    DatabaseModule,
    GatewayModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
