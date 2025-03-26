
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OsrModule } from 'src/modules/OSR/osr.module';
import { SHARE_ROUTE_REPOSITORY, SHARE_ROUTE_SERVICE } from 'src/modules/shared-route/shared-route.di-token';
import { SharedRouteRepository } from 'src/modules/shared-route/shared-route.repo';
import { SharedRoute, SharedRouteSchema } from 'src/modules/shared-route/shared-route.schema';
import { SharedRouteService } from 'src/modules/shared-route/shared-route.service';
import { TrackingModule } from 'src/modules/tracking/tracking.module';
import { TripModule } from 'src/modules/trip/trip.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ShareModule } from 'src/share/share.module';


const dependencies = [
    {
        provide: SHARE_ROUTE_SERVICE,
        useClass: SharedRouteService,
    },
    {
        provide: SHARE_ROUTE_REPOSITORY,
        useClass: SharedRouteRepository,
    },
];

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: SharedRoute.name,
                schema: SharedRouteSchema,
            },
        ]),
        OsrModule,
        ShareModule,
        forwardRef(() => TripModule),
        VehiclesModule,
        TrackingModule
    ],
    controllers: [],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class ShareRouteModule { }
