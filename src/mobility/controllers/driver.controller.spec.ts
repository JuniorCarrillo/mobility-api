import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DriverController } from './driver.controller';
import { RequestARideDto } from '../dtos/requestARide.dto';
import { GatewayService } from '../../gateway/services/gateway.service';
import { DriverService } from '../services/driver.service';
import { UsersService } from '../../users/services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestARide } from '../entities/requestARide.entity';
import { PayloadToken } from '../models/token.model';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RideStatus } from '../models/rideStatus.model';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../auth/models/roles.model';
import config from '../../config';

describe('DriverController', () => {
  let driverController: DriverController;
  let driverService: DriverService;

  const mockConfigService = {};
  const mockGatewayService = {};
  const mockUsersService = {};
  const mockRequestARideRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [
        DriverService,
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    driverController = module.get<DriverController>(DriverController);
    driverService = module.get<DriverService>(DriverService);
  });

  describe('finishRide', () => {
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

    it('should return the result of driverService.finishRideById', async () => {
      jest.spyOn(driverService, 'finishRideById').mockResolvedValueOnce(ride);

      const req = { user: mockUserRider };
      const response = await driverController.finishRide(req, 1);

      expect(response).toBe(ride);
      expect(driverService.finishRideById).toHaveBeenCalledWith(
        mockUserRider.sub,
        1,
      );
    });

    it('should throw an error if the user is not a driver', async () => {
      const req = { user: mockUserRider };
      await expect(driverController.finishRide(req, 1)).rejects.toThrowError(
        'Ride not exist',
      );
    });

    it('should parse the id parameter to a number', async () => {
      jest.spyOn(driverService, 'finishRideById').mockResolvedValueOnce(ride);

      const req = { user: mockUserRider };
      const response = await driverController.finishRide(req, 1);

      expect(response).toBe(ride);
      expect(driverService.finishRideById).toHaveBeenCalledWith(
        mockUserRider.sub,
        1,
      );
    });
  });
});
