import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { paymentTime } from 'src/share/enums/payment.enum';
import { IMomoService } from 'src/share/share.port';
import { generateSignature } from 'src/share/utils';

@Injectable()
export class MomoService implements IMomoService {
  private readonly ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
  private readonly PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  private readonly SECRET_KEY = process.env.MOMO_SECRET_KEY;
  private readonly FRONTEND_URL = process.env.FRONTEND_URL;
  private readonly MOMO_ENDPOINT = process.env.MOMO_ENDPOINT;
  private readonly MOMO_REFUND_ENDPOINT = process.env.MOMO_REFUND_ENDPOINT;
  constructor() { }

  async createPaymentLink(createPaymentDto: {
    bookingCode: number;
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
  }): Promise<any> {
    // Implement the logic to create a payment link using MoMo API
    // For now, returning a dummy URL
    const orderId = createPaymentDto.bookingCode;
    const requestId = `${orderId}-req`;
    const amount = createPaymentDto.amount;
    const orderInfo = createPaymentDto.description;
    const extraData = Buffer.from(
      JSON.stringify({ bookingCode: createPaymentDto.bookingCode }),
    ).toString('base64');
    const domain = process.env.DOMAIN_URL;
    const IPN_URL = `${domain}/checkout/momo/${createPaymentDto.returnUrl}`;
    const REDIRECT_URL = this.FRONTEND_URL + '/payment-callback';
    const requestType = 'captureWallet';
    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.PARTNER_CODE}&redirectUrl=${REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`;
    const signature = generateSignature(rawSignature);
    const autoCapture = true
    const orderExpireTime = 30  // 1 minute


    const requestBody = JSON.stringify({
      partnerCode: this.PARTNER_CODE,
      // partnerName: 'VinShuttle',
      // accessKey: this.ACCESS_KEY,
      amount: amount,
      lang: 'vi',
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      autoCapture: autoCapture,
      requestType: requestType,
      // orderExpireTime: orderExpireTime,
      requestId: requestId,
      extraData: extraData,
      signature: signature,
    });



    const options = {
      method: 'POST',
      url: this.MOMO_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    try {
      const result = await axios(options);
      console.log('result68', result.data);
      if (result.data.resultCode == 0) {
        return result.data.payUrl;
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'create payment link failed',
            vnMessage: 'Tạo liên kết thanh toán thất bại',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      console.log('Error creating payment link:', err);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'create payment link failed',
          vnMessage: 'Tạo liên kết thanh toán thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTransferTripPaymentLink(createPaymentDto: {
    bookingCode: number;
    amount: number;
    tripIds: string[];
    description: string;
    returnUrl: string;
  }): Promise<any> {
    const orderId = createPaymentDto.bookingCode;
    const requestId = `${orderId}-req`;
    const amount = createPaymentDto.amount;
    const orderInfo = createPaymentDto.description;
    const extraData = Buffer.from(
      JSON.stringify({ tripIds: createPaymentDto.tripIds }),
    ).toString('base64');
    const domain = process.env.DOMAIN_URL;
    const IPN_URL = `${domain}/checkout/momo/${createPaymentDto.returnUrl}`;
    console.log('IPN_URL', IPN_URL);
    const REDIRECT_URL = "";
    const requestType = 'captureWallet';
    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.PARTNER_CODE}&redirectUrl=${REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`;
    const signature = generateSignature(rawSignature);
    const autoCapture = true
    const orderExpireTime = 30  // 1 minute


    const requestBody = JSON.stringify({
      partnerCode: this.PARTNER_CODE,
      // partnerName: 'VinShuttle',
      // accessKey: this.ACCESS_KEY,
      amount: amount,
      lang: 'vi',
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      autoCapture: autoCapture,
      requestType: requestType,
      // orderExpireTime: orderExpireTime,
      requestId: requestId,
      extraData: extraData,
      signature: signature,
    });



    const options = {
      method: 'POST',
      url: this.MOMO_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    try {
      const result = await axios(options);
      console.log('result68', result.data);
      if (result.data.resultCode == 0) {
        return result.data.deeplink;
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'create payment link failed',
            vnMessage: 'Tạo liên kết thanh toán thất bại',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      console.log('Error creating payment link:', err);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'create payment link failed',
          vnMessage: 'Tạo liên kết thanh toán thất bại',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async initiateRefund(createRefundDto: {
    orderId: string;
    amount: number;
    description: string;
    transId: string;
  }): Promise<any> {
    // Implement the logic to initiate a refund using MoMo API
    const orderId = createRefundDto.orderId + 'refund';
    const requestId = `${orderId}-req`;
    const amount = createRefundDto.amount;
    const transId = createRefundDto.transId;
    const description = createRefundDto.description;

    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${this.PARTNER_CODE}&requestId=${requestId}&transId=${transId}`;
    const signature = generateSignature(rawSignature);

    const requestBody = JSON.stringify({
      partnerCode: this.PARTNER_CODE,
      accessKey: this.ACCESS_KEY,
      requestId,
      orderId,
      amount: amount.toString(),
      transId,
      description: description,
      signature,
    });

    const options = {
      method: 'POST',
      url: this.MOMO_REFUND_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };
    try {
      const result = await axios(options);
      console.log('result130', result.data);
      return result.data;
    } catch (err) {
      console.log('Error refund transaction:', err);
      // throw new HttpException(
      //   {
      //     statusCode: HttpStatus.BAD_REQUEST,
      //     message: 'initiate refund failed',
      //     vnMessage: 'Khởi tạo hoàn tiền thất bại',
      //   },
      //   HttpStatus.BAD_REQUEST,
      // );
    }
  }
}
