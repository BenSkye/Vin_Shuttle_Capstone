import { Controller, Get, Inject, Request, Res } from '@nestjs/common';
import { CHECKOUT_SERVICE } from 'src/modules/checkout/checkout.di-token';
import { ICheckoutService } from 'src/modules/checkout/checkout.port';

@Controller('checkout')
export class CheckoutController {
  constructor(
    @Inject(CHECKOUT_SERVICE)
    private readonly checkoutService: ICheckoutService,
  ) { }

  @Get('return-booking-payment')
  async getPayOsReturn(@Request() req, @Res() res) {
    await this.checkoutService.getPayOsReturn(req.query);
    const redirectUrl = new URL(process.env.FRONTEND_URL + '/booking');
    return res.redirect(redirectUrl.toString());
  }
  @Get('cancel-booking-payment')
  async getPayOsCancel(@Request() req) {
    await this.checkoutService.getPayOsCancel(req.query);
  }
}
