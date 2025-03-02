import { Module } from '@nestjs/common';

import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';
import { TRACKING_GATEWAY } from 'src/modules/tracking/tracking.di-token';
import { TrackingGateway } from 'src/modules/tracking/tracking.gateway';

import { ShareModule } from 'src/share/share.module';

const dependencies = [
    {
        provide: TRACKING_GATEWAY,
        useClass: TrackingGateway,
    }
];
@Module({
    imports: [
        ShareModule,
        KeytokenModule,
    ],
    controllers: [],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class TrackingModule { }
