import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CreateCardTokenizationDto } from '../../gateway/dtos/cardTokenization.dto';
import { UsersController } from './users.controller';
import { GatewayService } from '../../gateway/services/gateway.service';
import { UsersService } from '../services/users.service';
import { RegisterDto } from '../../auth/dtos/register.dto';
import { CardToken } from '../entities/cardToken.entity';
import { Role } from '../../auth/models/roles.model';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
  let usersService: UsersService;
  let usersController: UsersController;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const mockCardTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const mockGatewayService = {
    cardTokenize: jest.fn(),
  };
  const registerDto: RegisterDto = {
    name: 'name',
    role: Role.DRIVER,
    email: 'test@example.com',
    password: '123456',
  };
  const user: User = {
    id: 1,
    name: 'name',
    email: registerDto.email,
    password: registerDto.password,
    role: registerDto.role,
  };
  const payload: CreateCardTokenizationDto = {
    number: '4111111111111111',
    card_holder: 'John Doe',
    exp_month: '10',
    exp_year: '28',
    cvc: '123',
  };
  const cardToken: CardToken = {
    id: 1,
    user,
    token: 'token',
    brand: 'brand',
    last_four: 'last_four',
    exp_year: 'exp_year',
    exp_month: 'exp_month',
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(CardToken),
          useValue: mockCardTokenRepository,
        },
        {
          provide: GatewayService,
          useValue: mockGatewayService,
        },
      ],
      controllers: [UsersController],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addCardUser', () => {
    it('should return a successful response', async () => {
      jest.spyOn(usersService, 'addCardUser').mockResolvedValue(cardToken);
      const result = await usersController.addCardUser({ user }, payload);
      expect(result).toBe(cardToken);
    });
  });
});
