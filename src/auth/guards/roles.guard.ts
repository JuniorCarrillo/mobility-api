import {
  UnauthorizedException,
  ExecutionContext,
  CanActivate,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { PayloadToken } from '../models/token.model';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../models/roles.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as PayloadToken;
    if (!user) return true;
    const response = roles.includes(user.role as Role);
    if (!response) throw new UnauthorizedException('Your role is wrong');
    return response;
  }
}
