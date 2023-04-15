import { Controller, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';

import { CreateCardTokenizationDto } from '../../gateway/dtos/cardTokenization.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PayloadToken } from '../../auth/models/token.model';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('card')
  @ApiBearerAuth('jwt')
  @ApiProperty({ name: 'Add card for user' })
  async addCardUser(
    @Request() req: any,
    @Body() payload: CreateCardTokenizationDto,
  ) {
    const user = req.user as PayloadToken;
    return await this.usersService.addCardUser(user.sub, payload);
  }
}
