import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  convertToRegisterDto,
  ResponseRegisterDto,
  RequestRegisterDto,
} from '../dtos/register.dto';
import { ResponseLoginDto } from '../dtos/login.dto';
import { UsersService } from '../../users/services/users.service';
import { PayloadToken } from '../models/token.model';
import { User } from '../../users/entities/user.entity';
import { Role } from '../models/roles.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException('The user who entered is not registered');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('The entered password is incorrect');

    const response = await user;
    delete response.password;
    return response;
  }

  async register(
    payload: RequestRegisterDto,
    role: Role,
  ): Promise<ResponseRegisterDto> {
    const register = convertToRegisterDto(payload, role);
    try {
      return await this.usersService.create(register);
    } catch (e) {
      if (e.code === '23505') {
        throw new BadRequestException('User already exists');
      }
      throw new BadRequestException(e.code);
    }
  }

  async generateJWT(user: User): Promise<ResponseLoginDto> {
    const payload: PayloadToken = { role: user.role, sub: user.id };
    delete user.password;
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
