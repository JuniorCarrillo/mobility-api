import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';

import { RequestARideDto } from '../dtos/requestARide.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RiderService } from '../services/rider.service';
import { PayloadToken } from '../models/token.model';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/models/roles.model';

@ApiTags('Rider')
@Controller('rider')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiderController {
  constructor(private riderService: RiderService) {}

  @ApiBearerAuth('jwt')
  @Roles(Role.RIDER)
  @Post()
  async requestARide(@Request() req: any, @Body() payload: RequestARideDto) {
    const user = req.user as PayloadToken;
    return await this.riderService.create(user.sub, payload);
  }
}
