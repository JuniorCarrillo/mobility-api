import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { ResponseLoginDto, LoginDto } from '../dtos/login.dto';
import { RequestRegisterDto } from '../dtos/register.dto';
import { AuthController } from './auth.controller';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from '../services/auth.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../models/roles.model';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockUser: User = {
    id: 1,
    name: 'name',
    email: 'test@example.com',
    password: 'password',
    role: Role.RIDER,
  };
  const loginResponseMock: ResponseLoginDto = {
    token: 'token',
    user: mockUser,
  };
  const loginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password',
  };
  const payload: RequestRegisterDto = {
    name: 'name',
    email: 'test@example.com',
    password: 'password',
  };

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
      controllers: [AuthController],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return a ResponseLoginDto on successful login', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockUser);
      jest
        .spyOn(authService, 'generateJWT')
        .mockResolvedValue(loginResponseMock);

      expect(await authController.login(loginDto)).toEqual(loginResponseMock);
    });
  });

  describe('driverRegister', () => {
    it('should call authService.register with payload and Role.DRIVER', async () => {
      const spy = jest
        .spyOn(authService, 'register')
        .mockResolvedValue(undefined);
      await authController.driverRegister(payload);
      expect(spy).toHaveBeenCalledWith(payload, Role.DRIVER);
    });
  });

  describe('riderRegister', () => {
    it('should call authService.register with payload and Role.RIDER', async () => {
      const spy = jest
        .spyOn(authService, 'register')
        .mockResolvedValue(undefined);
      await authController.riderRegister(payload);
      expect(spy).toHaveBeenCalledWith(payload, Role.RIDER);
    });
  });
});
