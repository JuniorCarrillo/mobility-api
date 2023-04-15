import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';

import { ResponseAcceptanceTokenDto } from '../../gateway/dtos/acceptanceToken.dto';
import { ResponseCardTransactionDto } from '../../gateway/dtos/cardTransaction.dto';
import { GatewayCurrency } from '../../gateway/models/gatewayCurrency.model';
import { GatewayService } from '../../gateway/services/gateway.service';
import { GatewayMethod } from '../../gateway/models/gatewayMethod.model';
import { GatewayStatus } from '../../gateway/models/gatewayStatus.model';
import { DriverService } from './driver.service';
import { UsersService } from '../../users/services/users.service';
import { RequestARide } from '../entities/requestARide.entity';
import { RideStatus } from '../models/rideStatus.model';
import { Gateway } from '../../gateway/entities/gateway.entity';
import { Role } from '../../auth/models/roles.model';
import config from '../../config';

describe('DriverService', () => {
  let driverService: DriverService;
  let gatewayService: GatewayService;
  let requestARideRepo: Repository<RequestARide>;

  const mockConfigService = {
    param: {
      pricePerMinute: 0.01,
      pricePerKm: 0.5,
      baseFee: 1.5,
    },
  };
  const mockGatewayService = {
    getAcceptanceToken: jest
      .fn()
      .mockResolvedValue({ token: 'acceptance_token' }),
    createTransaction: jest
      .fn()
      .mockResolvedValue({ data: 'transaction_data' }),
    saveTransaction: jest.fn(),
  };
  const mockUsersService = {};
  const mockRequestARideRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
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
    }).compile();

    driverService = moduleRef.get<DriverService>(DriverService);
    gatewayService = moduleRef.get<GatewayService>(GatewayService);
    requestARideRepo = moduleRef.get<Repository<RequestARide>>(
      getRepositoryToken(RequestARide),
    );
  });

  describe('finishRideById', () => {
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

    it('should throw BadRequestException if ride does not exist', async () => {
      mockRequestARideRepo.findOne.mockResolvedValueOnce(undefined);

      await expect(
        driverService.finishRideById(ride.driver.id, ride.id),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestARideRepo.findOne).toHaveBeenCalledWith({
        where: { id: ride.id },
        relations: { driver: true, rider: true, card: true },
      });
    });

    it('should throw BadRequestException if ride status is COMPLETE', async () => {
      mockRequestARideRepo.findOne.mockResolvedValueOnce({
        ...ride,
        status: RideStatus.COMPLETE,
      });
      jest.spyOn(requestARideRepo, 'findOne').mockResolvedValue(ride);

      await expect(
        driverService.finishRideById(ride.driver.id, ride.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if ride status is CANCELLED', async () => {
      mockRequestARideRepo.findOne.mockResolvedValueOnce({
        ...ride,
        status: RideStatus.CANCELLED,
      });
      jest.spyOn(requestARideRepo, 'findOne').mockResolvedValue(ride);

      await expect(
        driverService.finishRideById(ride.driver.id, ride.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if driver does not match', async () => {
      mockRequestARideRepo.findOne.mockResolvedValueOnce(ride);
      jest.spyOn(requestARideRepo, 'findOne').mockResolvedValue(ride);

      await expect(driverService.finishRideById(3, ride.id)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should calculate total price and make card transaction', async () => {
      const responseCardTransaction: AxiosResponse<ResponseCardTransactionDto> =
        {
          config: undefined,
          headers: undefined,
          status: 0,
          statusText: '',
          data: {
            data: {
              id: '1',
              amount_in_cents: 350000,
              reference: 'reference',
              currency: GatewayCurrency.COP,
              payment_method: {
                type: GatewayMethod.CARD,
                installments: 2,
              },
              payment_method_type: GatewayMethod.CARD,
              status: GatewayStatus.APPROVED,
            },
          },
        };
      const responseGateway: Gateway = {
        id: 1,
        service: ride,
        hash: 'hash',
        reference: 'reference',
        currency: GatewayCurrency.COP,
        status: GatewayStatus.APPROVED,
        method: GatewayMethod.CARD,
        priceInCents: responseCardTransaction.data.data.amount_in_cents,
        installments:
          responseCardTransaction.data.data.payment_method.installments,
      };

      jest.spyOn(requestARideRepo, 'findOne').mockResolvedValue(ride);
      jest
        .spyOn(gatewayService, 'getAcceptanceToken')
        .mockResolvedValue({ token: 'token' } as ResponseAcceptanceTokenDto);
      jest
        .spyOn(gatewayService, 'createTransaction')
        .mockResolvedValue(responseCardTransaction);
      jest
        .spyOn(gatewayService, 'saveTransaction')
        .mockResolvedValue(responseGateway);

      await expect(
        driverService.finishRideById(ride.driver.id, ride.id),
      ).toBeDefined();
    });
  });
});
