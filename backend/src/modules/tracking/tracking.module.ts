import { Module } from '@nestjs/common';

import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { TrackingController } from 'src/modules/tracking/tracking.controller';
import { TRACKING_GATEWAY, TRACKING_SERVICE } from 'src/modules/tracking/tracking.di-token';
import { TrackingGateway } from 'src/modules/tracking/tracking.gateway';
import { TrackingService } from 'src/modules/tracking/tracking.service';

import { ShareModule } from 'src/share/share.module';

const dependencies = [
    {
        provide: TRACKING_GATEWAY,
        useClass: TrackingGateway,
    },
    {
        provide: TRACKING_SERVICE,
        useClass: TrackingService,
    },

];
@Module({
    imports: [
        ShareModule,
        KeytokenModule,
    ],
    controllers: [TrackingController],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class TrackingModule { }