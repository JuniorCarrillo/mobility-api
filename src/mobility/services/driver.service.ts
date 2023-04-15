import { InjectRepository } from '@nestjs/typeorm';
import {
  UnauthorizedException,
  BadRequestException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as moment from 'moment';

import { CreateCardTransactionDto } from '../../gateway/dtos/cardTransaction.dto';
import { GatewayCurrency } from '../../gateway/models/gatewayCurrency.model';
import { GatewayService } from '../../gateway/services/gateway.service';
import { GatewayMethod } from '../../gateway/models/gatewayMethod.model';
import { UsersService } from '../../users/services/users.service';
import { RequestARide } from '../entities/requestARide.entity';
import { RideStatus } from '../models/rideStatus.model';
import { ConfigType } from '@nestjs/config';
import config from '../../config';
import Tools from '../tools';

@Injectable()
export class DriverService {
  constructor(
    private usersService: UsersService,
    private gatewayService: GatewayService,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @InjectRepository(RequestARide)
    private requestARideRepo: Repository<RequestARide>,
  ) {}

  async finishRideById(driverId: number, id: number) {
    const ride = await this.requestARideRepo.findOne({
      where: { id },
      relations: { driver: true, rider: true, card: true },
    });

    if (!ride) {
      throw new BadRequestException('Ride not exist');
    }

    if (
      ride.status === RideStatus.COMPLETE ||
      ride.status === RideStatus.CANCELLED
    ) {
      throw new BadRequestException(`Ride status is ${ride.status}`);
    }

    if (ride.driver.id !== driverId) {
      throw new UnauthorizedException(
        'You cannot operate rides that are not yours',
      );
    }

    const [startLat, startLng] = ride.location;
    const [endLat, endLng] = ride.destination;
    const distanceKm = Tools.getDistance(
      { lat: startLat, lon: startLng },
      { lat: endLat, lon: endLng },
    );

    const now = moment();
    const rideStart = moment(ride.createAt);
    const durationInMinutes = now.diff(rideStart, 'minutes', true);

    const priceForMinutes =
      durationInMinutes * this.configService.param.pricePerMinute;
    const priceForKms = distanceKm * this.configService.param.pricePerKm;
    const baseFee = this.configService.param.baseFee;

    const totalPrice = baseFee + priceForKms + priceForMinutes;
    const amount_in_cents = Math.trunc(totalPrice * 100);

    const { token: acceptance_token } =
      await this.gatewayService.getAcceptanceToken();

    const transaction: CreateCardTransactionDto = {
      payment_method: {
        type: GatewayMethod.CARD,
        installments: ride.installments,
        token: ride.card.token,
      },
      amount_in_cents,
      reference: `Mobility App Payment: ${moment().format('lll')} #${ride.id}`,
      currency: GatewayCurrency.COP,
      customer_email: ride.rider.email,
      acceptance_token,
    };

    const { data: responseTransaction } =
      await this.gatewayService.createTransaction(transaction);

    await this.gatewayService.saveTransaction(ride, responseTransaction.data);

    this.requestARideRepo.merge(ride, {
      status: RideStatus.COMPLETE,
      finishAt: new Date(),
    });
    return this.requestARideRepo.save(ride);
  }
}
