import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KeytokenModule } from "src/modules/keytoken/keytoken.module";
import { NotificationController } from "src/modules/notification/notification.controller";
import { NOTIFICATION_REPOSITORY, NOTIFICATION_SERVICE } from "src/modules/notification/notification.di-token";
import { NotificationRepository } from "src/modules/notification/notification.repo";
import { Notification, NotificationSchema } from "src/modules/notification/notification.schema";
import { NotificationService } from "src/modules/notification/notification.service";
import { ShareModule } from "src/share/share.module";

const dependencies = [
    {
        provide: NOTIFICATION_SERVICE,
        useClass: NotificationService,
    },
    {
        provide: NOTIFICATION_REPOSITORY,
        useClass: NotificationRepository,
    },
];

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
        ]),
        ShareModule,
        KeytokenModule,
    ],
    controllers: [NotificationController],
    providers: [...dependencies],
    exports: [...dependencies],
})
export class NotificationModule { }