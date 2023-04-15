import { Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import {
  ResponseCardTransactionDataDto,
  ResponseCardTransactionDto,
  CreateCardTransactionDto,
  convertToTransactionDto,
} from '../dtos/cardTransaction.dto';
import {
  ResponseCardTokenizationDto,
  CreateCardTokenizationDto,
} from '../dtos/cardTokenization.dto';
import { ResponseAcceptanceTokenDto } from '../dtos/acceptanceToken.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestARide } from '../../mobility/entities/requestARide.entity';
import { Repository } from 'typeorm';
import { Gateway } from '../entities/gateway.entity';
import config from '../../config';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @InjectRepository(Gateway)
    private gatewayRepo: Repository<Gateway>,
  ) {}

  async cardTokenize(
    payload: CreateCardTokenizationDto,
  ): Promise<AxiosResponse<ResponseCardTokenizationDto>> {
    return await this.httpService.axiosRef.post(
      `${this.configService.gateway.uri}/tokens/cards`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.gateway.key}`,
        },
      },
    );
  }

  async getAcceptanceToken(): Promise<ResponseAcceptanceTokenDto> {
    const response: AxiosResponse<any> = await this.httpService.axiosRef.get(
      `${this.configService.gateway.uri}/merchants/${this.configService.gateway.key}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const { acceptance_token: token } = response.data.data.presigned_acceptance;
    return { token };
  }

  async createTransaction(
    payload: CreateCardTransactionDto,
  ): Promise<AxiosResponse<ResponseCardTransactionDto>> {
    return await this.httpService.axiosRef.post(
      `${this.configService.gateway.uri}/transactions`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.gateway.key}`,
        },
      },
    );
  }

  async saveTransaction(
    ride: RequestARide,
    transaction: ResponseCardTransactionDataDto,
  ) {
    const transactionMerged = convertToTransactionDto(ride, transaction);
    const newTransaction = await this.gatewayRepo.create(transactionMerged);
    return await this.gatewayRepo.save(newTransaction);
  }
}
