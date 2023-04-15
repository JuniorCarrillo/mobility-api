import { Role } from './roles.model';

export interface PayloadToken {
  role: Role;
  sub: number;
}
