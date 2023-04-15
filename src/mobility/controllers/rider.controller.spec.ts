import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { RequestARideDto } from '../dtos/requestARide.dto';
import { RiderController } from './rider.controller';
import { GatewayService } from '../../gateway/services/gateway.service';
import { UsersService } from '../../users/services/users.service';
import { RequestARide } from '../entities/requestARide.entity';
import { RiderService } from '../services/rider.service';
import { PayloadToken } from '../models/token.model';
import { RideStatus } from '../models/rideStatus.model';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../auth/models/roles.model';
import config from '../../config';

describe('RiderController', () => {
  let riderController: RiderController;
  let riderService: RiderService;

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
      controllers: [RiderController],
    }).compile();

    riderService = moduleRef.get<RiderService>(RiderService);
    riderController = moduleRef.get<RiderController>(RiderController);
  });

  describe('requestARide', () => {
    const requestARide: RequestARideDto = {
      location: [6.227613, -75.5799254],
      destination: [6.1664595, -75.625661],
      installments: 1,
    };
    const userRider: User = {
      id: 1,
      name: 'rider',
      email: 'rider@email.co',
      role: Role.RIDER,
      password: 'password',
    };
    const userDriver: User = {
      id: 2,
      name: 'driver',
      email: 'driver@email.co',
      role: Role.DRIVER,
      password: 'password',
    };
    const mockUserRider: PayloadToken = {
      sub: userRider.id,
      role: userRider.role,
    };
    const ride: RequestARide = {
      id: 1,
      location: requestARide.location,
      destination: requestARide.destination,
      status: RideStatus.REQUEST,
      driver: userDriver,
      rider: userRider,
      card: {
        id: 1,
        user: userRider,
        token: 'token',
        brand: 'brand',
        last_four: 'last_four',
        exp_year: 'exp_year',
        exp_month: 'exp_month',
      },
      createAt: new Date(),
      installments: requestARide.installments,
    };

    it('should return created ride', async () => {
      jest.spyOn(riderService, 'create').mockResolvedValue(ride);

      const result = await riderController.requestARide(
        { user: userRider },
        requestARide,
      );

      expect(result).toBeDefined();
      expect(result.id).toEqual(ride.id);
    });

    it('should throw an error if user is not a rider', async () => {
      await expect(
        riderController.requestARide({ user: mockUserRider }, ride),
      ).rejects.toThrowError(
        'You do not have credit cards linked to your user. Link one and try again.',
      );
    });
  });
});
