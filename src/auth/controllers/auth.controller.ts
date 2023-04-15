import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto, ResponseLoginDto } from '../dtos/login.dto';
import { RequestRegisterDto } from '../dtos/register.dto';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import { User } from '../../users/entities/user.entity';
import { Role } from '../models/roles.model';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiProperty({ title: 'Login' })
  @UseGuards(AuthGuard('local'))
  async login(@Body() payload: LoginDto): Promise<ResponseLoginDto> {
    const user = await this.authService.login(payload.email, payload.password);
    return await this.authService.generateJWT(user as User);
  }

  @Public()
  @Post('driver/register')
  @ApiProperty({ title: 'Driver register' })
  async driverRegister(@Body() payload: RequestRegisterDto) {
    return await this.authService.register(payload, Role.DRIVER);
  }

  @Public()
  @Post('rider/register')
  @ApiProperty({ title: 'Rider register' })
  async riderRegister(@Body() payload: RequestRegisterDto) {
    return await this.authService.register(payload, Role.RIDER);
  }
}
