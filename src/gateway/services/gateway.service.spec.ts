import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import {
  ResponseCardTransactionDataDto,
  ResponseCardTransactionDto,
  CreateCardTransactionDto,
} from '../dtos/cardTransaction.dto';
import {
  ResponseCardTokenizationDto,
  CreateCardTokenizationDto,
} from '../dtos/cardTokenization.dto';
import { GatewayCurrency } from '../models/gatewayCurrency.model';
import { GatewayService } from './gateway.service';
import { GatewayStatus } from '../models/gatewayStatus.model';
import { GatewayMethod } from '../models/gatewayMethod.model';
import { RequestARide } from '../../mobility/entities/requestARide.entity';
import { RideStatus } from '../../mobility/models/rideStatus.model';
import { Gateway } from '../entities/gateway.entity';
import { Role } from '../../auth/models/roles.model';
import config from '../../config';

describe('GatewayService', () => {
  let gatewayService: GatewayService;
  let httpService: HttpService;
  let configService: ConfigType<typeof config>;

  const mockConfig = {
    gateway: {
      uri: 'uri',
      key: 'key',
    },
  };
  const createCardTokenization: CreateCardTokenizationDto = {
    number: 'number',
    cvc: 'cvc',
    exp_month: 'exp_month',
    exp_year: 'exp_year',
    card_holder: 'card_holder',
  };
  const responseCardTokenization: ResponseCardTokenizationDto = {
    data: {
      id: 'id',
      created_at: new Date(2030, 1, 1),
      brand: 'brand',
      name: 'name',
      last_four: 'last_four',
      exp_year: 'exp_year',
      exp_month: 'exp_month',
    },
  };
  const responseCardTransaction: AxiosResponse<ResponseCardTransactionDto> = {
    status: 0,
    statusText: '',
    headers: undefined,
    config: undefined,
    data: {
      data: {
        id: 'id',
        amount_in_cents: 350000,
        reference: 'reference',
        currency: GatewayCurrency.COP,
        payment_method: {
          type: GatewayMethod.CARD,
          installments: 1,
        },
        payment_method_type: GatewayMethod.CARD,
        status: GatewayStatus.APPROVED,
      },
    },
  };
  const createCardTransaction: CreateCardTransactionDto = {
    payment_method: {
      type: GatewayMethod.CARD,
      installments: 1,
      token: 'token',
    },
    amount_in_cents: 350000,
    reference: 'reference',
    currency: GatewayCurrency.COP,
    customer_email: 'customer_email',
    acceptance_token: 'acceptance_token',
  };
  const responseCardTransactionData: ResponseCardTransactionDataDto = {
    id: '1',
    amount_in_cents: createCardTransaction.amount_in_cents,
    reference: createCardTransaction.reference,
    currency: createCardTransaction.currency,
    payment_method: createCardTransaction.payment_method,
    payment_method_type: createCardTransaction.payment_method.type,
    status: GatewayStatus.APPROVED,
  };
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
  const gateway: Gateway = {
    id: 1,
    service: ride,
    hash: 'hash',
    reference: 'reference',
    currency: GatewayCurrency.COP,
    status: GatewayStatus.APPROVED,
    method: GatewayMethod.CARD,
    priceInCents: 350000,
    installments: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
              post: jest.fn(),
            },
          },
        },
        {
          provide: config.KEY,
          useValue: mockConfig,
        },
        {
          provide: getRepositoryToken(Gateway),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    gatewayService = module.get<GatewayService>(GatewayService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigType<typeof config>>(config.KEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gatewayService).toBeDefined();
  });

  describe('cardTokenize', () => {
    it('should call httpService.post with the correct payload and headers', async () => {
      jest
        .spyOn(httpService.axiosRef, 'post')
        .mockResolvedValueOnce(responseCardTokenization);
      const result = await gatewayService.cardTokenize(createCardTokenization);
      expect(httpService.axiosRef.post).toHaveBeenCalledWith(
        `${configService.gateway.uri}/tokens/cards`,
        createCardTokenization,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${configService.gateway.key}`,
          },
        },
      );
      expect(result).toEqual(responseCardTokenization);
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token', async () => {
      const acceptanceToken = 'someToken';
      const response = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: acceptanceToken,
            },
          },
        },
      };
      jest
        .spyOn(gatewayService['httpService'].axiosRef, 'get')
        .mockResolvedValue(response);

      const result = await gatewayService.getAcceptanceToken();

      expect(result.token).toEqual(acceptanceToken);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction', async () => {
      jest
        .spyOn(gatewayService['httpService'].axiosRef, 'post')
        .mockResolvedValue(responseCardTransaction);

      const response = await gatewayService.createTransaction(
        createCardTransaction,
      );

      expect(response).toBeDefined();
      expect(response).toEqual(responseCardTransaction);
    });
  });

  describe('saveTransaction', () => {
    it('should save transaction', async () => {
      jest
        .spyOn(gatewayService['gatewayRepo'], 'create')
        .mockReturnValue(gateway);
      jest
        .spyOn(gatewayService['gatewayRepo'], 'save')
        .mockResolvedValue(gateway);

      const result = await gatewayService.saveTransaction(
        ride,
        responseCardTransactionData,
      );

      expect(gatewayService['gatewayRepo'].create).toBeDefined();
      expect(gatewayService['gatewayRepo'].save).toBeDefined();
      expect(result).toEqual(gateway);
    });
  });
});
