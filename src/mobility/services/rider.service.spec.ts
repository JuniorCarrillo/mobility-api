import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { GatewayService } from '../../gateway/services/gateway.service';
import { UsersService } from '../../users/services/users.service';
import { RequestARide } from '../entities/requestARide.entity';
import { RiderService } from './rider.service';
import { RideStatus } from '../models/rideStatus.model';
import { Role } from '../../auth/models/roles.model';
import config from '../../config';

describe('RiderService', () => {
  let riderService: RiderService;
  let usersService: UsersService;

  const mockConfigService = {
    param: {
      pricePerMinute: 0.01,
      pricePerKm: 0.5,
      baseFee: 1.5,
    },
  };

  const mockGatewayService = {};

  const mockUsersService = {
    getCardByUserId: jest.fn(),
    findByRole: jest.fn(),
    findById: jest.fn(),
  };

  const mockRequestARideRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RiderService,
        {
          provide: GatewayService,
          useValue: mockGatewayService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getRepositoryToken(RequestARide),
          useValue: mockRequestARideRepo,
        },
        {
          provide: config.KEY,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    riderService = moduleRef.get<RiderService>(RiderService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const ride: RequestARide = {
      id: 1,
      location: [6.227613, -75.5799254],
      destination: [6.1664595, -75.625661],
      status: RideStatus.REQUEST,
      driver: {
        id: 2,
        name: 'driver',
        email: 'driver@email.co',
        role: Role.DRIVER,
        password: 'password',
      },
      rider: {
        id: 1,
        name: 'rider',
        email: 'rider@email.co',
        role: Role.RIDER,
        password: 'password',
      },
      card: {
        id: 1,
        user: {
          id: 1,
          name: 'rider',
          email: 'rider@email.co',
          role: Role.RIDER,
          password: 'password',
        },
        token: 'token',
        brand: 'brand',
        last_four: 'last_four',
        exp_year: 'exp_year',
        exp_month: 'exp_month',
      },
      createAt: new Date(),
      installments: 1,
    };

    it('should throw a BadRequestException if the user does not have a credit card linked to their account', async () => {
      jest.spyOn(usersService, 'getCardByUserId').mockResolvedValue(undefined);

      await expect(riderService.create(1, ride)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException if there are no registered drivers', async () => {
      jest.spyOn(usersService, 'getCardByUserId').mockResolvedValue(ride.card);
      jest.spyOn(usersService, 'findByRole').mockResolvedValue(undefined);

      await expect(riderService.create(1, ride)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new RequestARide object and return it', async () => {
      mockUsersService.getCardByUserId.mockResolvedValueOnce(ride.card);
      mockUsersService.findByRole.mockResolvedValueOnce(ride.driver);
      mockUsersService.findById.mockResolvedValueOnce(ride.rider);
      mockRequestARideRepo.create.mockReturnValueOnce(ride);
      mockRequestARideRepo.save.mockResolvedValueOnce(ride);

      const result = await riderService.create(1, ride);

      expect(result).toEqual(ride);
      expect(mockUsersService.getCardByUserId).toHaveBeenCalledWith(
        ride.card.id,
      );
      expect(mockUsersService.findByRole).toHaveBeenCalledWith(Role.DRIVER);
      expect(mockUsersService.findById).toHaveBeenCalledWith(ride.rider.id);
      expect(mockRequestARideRepo.save).toHaveBeenCalledWith(ride);
    });
  });
});
