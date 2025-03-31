import { forwardRef, Module } from '@nestjs/common';
import { BookingModule } from 'src/modules/booking/booking.module';
import { CheckoutController } from 'src/modules/checkout/checkout.controller';
import { CHECKOUT_SERVICE } from 'src/modules/checkout/checkout.di-token';
import { CheckoutService } from 'src/modules/checkout/checkout.service';
import { ShareModule } from 'src/share/share.module';
const dependencies = [
  {
    provide: CHECKOUT_SERVICE,
    useClass: CheckoutService,
  },
];
@Module({
  imports: [forwardRef(() => BookingModule), ShareModule],
  controllers: [CheckoutController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class CheckoutModule {}
