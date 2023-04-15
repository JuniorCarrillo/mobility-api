import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';

import {
  ResponseCardTokenizationDto,
  CreateCardTokenizationDto,
} from '../../gateway/dtos/cardTokenization.dto';
import { CreateCardTokenizeDto } from '../dtos/cards.dto';
import { GatewayService } from '../../gateway/services/gateway.service';
import { UsersService } from './users.service';
import { RegisterDto } from '../../auth/dtos/register.dto';
import { CardToken } from '../entities/cardToken.entity';
import { Role } from '../../auth/models/roles.model';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let cardTokenRepository: Repository<CardToken>;
  let gatewayService: GatewayService;

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
  const expectedResponse: AxiosResponse<ResponseCardTokenizationDto> = {
    config: undefined,
    headers: undefined,
    status: 0,
    statusText: '',
    data: {
      data: {
        id: 'some-token-id',
        created_at: new Date(),
        brand: 'brand',
        name: 'name',
        last_four: 'last_four',
        exp_year: 'exp_year',
        exp_month: 'exp_month',
      },
    },
  };
  const createCardTokenizeDto: CreateCardTokenizeDto = {
    user,
    brand: 'brand',
    token: 'token',
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
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    cardTokenRepository = moduleRef.get<Repository<CardToken>>(
      getRepositoryToken(CardToken),
    );
    gatewayService = moduleRef.get<GatewayService>(GatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with a hashed password', async () => {
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockReturnValue(user);

      const result = await usersService.create(registerDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(registerDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await usersService.findById(1);
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      const result = await usersService.findById(1);
      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await usersService.findByEmail('test@example.com');
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      const result = await usersService.findByEmail('test@example.com');
      expect(result).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('findByRole', () => {
    it('should find a user by role', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await usersService.findByRole(Role.DRIVER);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { role: Role.DRIVER },
        order: { createAt: 'DESC' },
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      const result = await usersService.findByRole(Role.DRIVER);
      expect(result).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { role: Role.DRIVER },
        order: { createAt: 'DESC' },
      });
    });
  });

  describe('addCardUser', () => {
    it('should add a new card for the user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(gatewayService, 'cardTokenize')
        .mockResolvedValue(expectedResponse);
      mockCardTokenRepository.create.mockResolvedValue(cardToken);
      mockCardTokenRepository.save.mockResolvedValue(cardToken);

      const result = await usersService.addCardUser(user.id, payload);

      expect(result.user).toEqual(user);
      expect(cardTokenRepository.save).toHaveBeenCalledWith(result);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      await expect(
        usersService.addCardUser(user.id, payload),
      ).rejects.toThrowError('User not found');
      expect(cardTokenRepository.create).not.toHaveBeenCalled();
      expect(cardTokenRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if cardTokenize fails', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      mockGatewayService.cardTokenize.mockRejectedValue(undefined);

      await expect(
        usersService.addCardUser(user.id, payload),
      ).rejects.toThrowError('Gateway connections is error');
      expect(cardTokenRepository.create).not.toHaveBeenCalled();
      expect(cardTokenRepository.save).not.toHaveBeenCalled();
    });

    it('should add a new card for a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      mockGatewayService.cardTokenize.mockResolvedValue(expectedResponse);
      mockCardTokenRepository.create.mockResolvedValue(createCardTokenizeDto);
      mockCardTokenRepository.save.mockResolvedValue(createCardTokenizeDto);

      const response = await usersService.addCardUser(user.id, payload);
      expect(response).toBeDefined();
      expect(response.token).toEqual(createCardTokenizeDto.token);
    });
  });

  describe('getCardByUserId', () => {
    it('should return the latest card token for the user', async () => {
      jest
        .spyOn(cardTokenRepository, 'findOne')
        .mockResolvedValueOnce(cardToken);
      const result = await usersService.getCardByUserId(user.id);
      expect(cardTokenRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { createAt: 'DESC' },
      });
      expect(result).toEqual(cardToken);
    });

    it('should return undefined if no card tokens are found for the user', async () => {
      jest
        .spyOn(cardTokenRepository, 'findOne')
        .mockResolvedValueOnce(undefined);
      const result = await usersService.getCardByUserId(user.id);
      expect(cardTokenRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { createAt: 'DESC' },
      });
      expect(result).toBeUndefined();
    });
  });
});
