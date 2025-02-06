import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KeytokenModule } from "src/modules/keytoken/keytoken.module";
import { ROUTE_REPOSITORY, ROUTE_SERVICE } from "src/modules/route/route.di-token";
import { RouteRepository } from "src/modules/route/routerepo";
import { Route, RouteSchema } from "src/modules/route/route.schema";
import { RouteService } from "src/modules/route/route.service";
import { ShareModule } from "src/share/share.module";
import { RouteController } from "src/modules/route/route.controller";

const dependencies = [
    {
        provide: ROUTE_REPOSITORY,
        useClass: RouteRepository,
    },
    {
        provide: ROUTE_SERVICE,
        useClass: RouteService,
    }
]

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Route.name, schema: RouteSchema },
        ]),
        ShareModule,
        KeytokenModule
    ],
    controllers: [RouteController],
    providers: [...dependencies],
    exports: [...dependencies]
})
export class RouteModule { }