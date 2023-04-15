import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { convertToRegisterDto, RequestRegisterDto } from '../dtos/register.dto';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../models/roles.model';
import { PayloadToken } from '../models/token.model';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should throw an UnauthorizedException when email is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'The user who entered is not registered',
      );
    });

    it('should throw an UnauthorizedException when password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'password';
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: 1,
        email,
        name: 'name',
        password: 'wrongpassword',
      } as User);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'The entered password is incorrect',
      );
    });

    it('should return a ResponseLoginDto when email and password are correct', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user: User = {
        id: 1,
        email,
        name: 'name',
        role: Role.RIDER,
        password: await bcrypt.hash(password, 10),
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);

      const result = await authService.login(email, password);

      expect(result.email).toEqual(email);
      expect(result.password).toBeUndefined();
    });
  });

  describe('register', () => {
    it('should throw a BadRequestException when email already exists', async () => {
      const payload: RequestRegisterDto = {
        name: 'name',
        email: 'test@example.com',
        password: 'password',
      };
      const role = Role.DRIVER;
      jest.spyOn(usersService, 'create').mockRejectedValue({
        code: '23505',
      });

      await expect(authService.register(payload, role)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.register(payload, role)).rejects.toThrow(
        'User already exists',
      );
    });

    it('should throw a BadRequestException when an error occurs while creating a user', async () => {
      const payload: RequestRegisterDto = {
        name: 'name',
        email: 'test@example.com',
        password: 'password',
      };
      const role = Role.DRIVER;
      const error = {
        code: 'anycode',
      };
      jest.spyOn(usersService, 'create').mockRejectedValue({
        code: 'anycode',
      });

      await expect(authService.register(payload, role)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.register(payload, role)).rejects.toThrow(
        error.code,
      );
    });

    it('should return a ResponseRegisterDto when the user is successfully created', async () => {
      const payload: RequestRegisterDto = {
        name: 'name',
        email: 'test@example.com',
        password: 'password',
      };
      const role = Role.DRIVER;
      const register = convertToRegisterDto(payload, role);
      const response: User = {
        id: 1,
        name: payload.name,
        email: payload.email,
        role: Role.DRIVER,
        password: await bcrypt.hash(payload.password, 10),
      };
      jest.spyOn(usersService, 'create').mockResolvedValue(response);

      const result = await authService.register(payload, role);

      expect(usersService.create).toHaveBeenCalledWith(register);
      expect(result).toEqual(response);
    });
  });

  describe('generateJWT', () => {
    it('should return a ResponseLoginDto with a token and a user', async () => {
      const user: User = {
        id: 1,
        name: 'name',
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: Role.DRIVER,
      };
      const payload: PayloadToken = {
        role: user.role,
        sub: user.id,
      };
      const token = 'token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.generateJWT(user);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result.token).toEqual(token);
      expect(result.user).toEqual(user);
    });
  });
});
