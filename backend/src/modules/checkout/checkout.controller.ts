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
    const redirectUrl = process.env.FRONTEND_URL + '/booking';
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            // Chuyển hướng trang cha đến URL đích
            window.top.location.href = '${redirectUrl}';
          </script>
        </body>
      </html>
    `);
  }
  @Get('cancel-booking-payment')
  async getPayOsCancel(@Request() req) {
    await this.checkoutService.getPayOsCancel(req.query);
  }
}
