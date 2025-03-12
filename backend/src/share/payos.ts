import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import { IPayosService } from 'src/share/interface';

@Injectable()
export class PayosService implements IPayosService {
  private readonly payos: InstanceType<typeof PayOS>;

  constructor() {
    this.payos = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }

  async createPaymentLink(createPaymentDto: {
    bookingCode: number;
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
  }) {
    const domain = process.env.DOMAIN_URL;
    const requestData = {
      orderCode: createPaymentDto.bookingCode,
      amount: createPaymentDto.amount,
      description: createPaymentDto.description,
      cancelUrl: `${domain}/checkout${createPaymentDto.cancelUrl}`,
      returnUrl: `${domain}/checkout${createPaymentDto.returnUrl}`,
      expiredAt: Math.floor((Date.now() + 1 * 60 * 1000) / 1000),
    };

    return this.payos.createPaymentLink(requestData);
  }
}
