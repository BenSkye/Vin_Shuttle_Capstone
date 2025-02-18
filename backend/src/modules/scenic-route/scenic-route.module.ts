import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KeytokenModule } from "src/modules/keytoken/keytoken.module";
import { SCENIC_ROUTE_REPOSITORY, SCENIC_ROUTE_SERVICE } from "src/modules/scenic-route/scenic-route.di-token";
import { ScenicRouteRepository } from "src/modules/scenic-route/scenic-route.repo";
import { ScenicRoute, ScenicRouteSchema } from "src/modules/scenic-route/scenic-route.schema";
import { ScenicRouteService } from "src/modules/scenic-route/scenic-route.service";
import { ShareModule } from "src/share/share.module";
import { ScenicRouteController } from "src/modules/scenic-route/scenic-route.controller";

const dependencies = [
    {
        provide: SCENIC_ROUTE_REPOSITORY,
        useClass: ScenicRouteRepository,
    },
    {
        provide: SCENIC_ROUTE_SERVICE,
        useClass: ScenicRouteService,
    }
]

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ScenicRoute.name, schema: ScenicRouteSchema },
        ]),
        ShareModule,
        KeytokenModule
    ],
    controllers: [ScenicRouteController],
    providers: [...dependencies],
    exports: [...dependencies]
})
export class ScenicRouteModule { }