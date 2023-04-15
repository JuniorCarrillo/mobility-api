import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ParseIntPipe,
  Controller,
  UseGuards,
  Request,
  Param,
  Post,
} from '@nestjs/common';

import { DriverService } from '../services/driver.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PayloadToken } from '../../auth/models/token.model';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/models/roles.model';

@ApiTags('Driver')
@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverController {
  constructor(private driverService: DriverService) {}

  @ApiBearerAuth('jwt')
  @Roles(Role.DRIVER)
  @Post('finish/:id')
  async finishRide(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as PayloadToken;
    return await this.driverService.finishRideById(user.sub, id);
  }
}
