import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import Expo from "expo-server-sdk";
import { NOTIFICATION_GATEWAY, NOTIFICATION_REPOSITORY } from "src/modules/notification/notification.di-token";
import { ICreateNotification, notificationParams } from "src/modules/notification/notification.dto";
import { NotificationGateway } from "src/modules/notification/notification.gateway";
import { INotificationRepository, INotificationService } from "src/modules/notification/notification.port";
import { NotificationDocument } from "src/modules/notification/notification.schema";
import { USER_REPOSITORY } from "src/modules/users/users.di-token";
import { IUserRepository } from "src/modules/users/users.port";
import { UserRole } from "src/share/enums";
import { processQueryParams } from "src/share/utils/query-params.util";

@Injectable()
export class NotificationService implements INotificationService {
    private readonly expo: Expo;
    constructor(
        @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: INotificationRepository,
        @Inject(NOTIFICATION_GATEWAY)
        private readonly notificationGateway: NotificationGateway,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository
    ) {
        this.expo = new Expo()
    }

    async createNotification(data: ICreateNotification): Promise<NotificationDocument> {
        const newNotification = await this.notificationRepository.create(data)
        await this.notificationGateway.emitNewNotification(newNotification.received.toString(), newNotification)
        const user = await this.userRepository.getUserById(newNotification.received.toString(), ['_id', 'role'])
        if (user.role === UserRole.DRIVER) {
            await this.sendPushNotification(newNotification)
        }
        return newNotification
    }

    async getNotificationById(id: string): Promise<NotificationDocument> {
        const notification = await this.notificationRepository.getNotificationById(id)
        if (!notification) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Notification not found ${id}`,
                vnMessage: `Không tìm thấy thông báo ${id}`
            }, HttpStatus.NOT_FOUND)
        }
        return notification
    }

    async getUserNotifications(userId: string, query: notificationParams): Promise<NotificationDocument[]> {
        const { filter, options } = processQueryParams(query, ['title', 'body']);
        filter.received = userId
        return await this.notificationRepository.getNotifications(filter, [], options)
    }

    async markAsRead(id: string): Promise<NotificationDocument> {
        const notification = await this.notificationRepository.getNotificationById(id)
        if (!notification) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Notification not found ${id}`,
                vnMessage: `Không tìm thấy thông báo ${id}`
            }, HttpStatus.NOT_FOUND)
        }
        return await this.notificationRepository.updateNotification(id, { isRead: true })
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const notifications = await this.notificationRepository.getNotifications({ received: userId, isRead: false }, ['_id'])
        if (notifications.length === 0) {
            return true
        }
        const updatePromises = notifications.map(notification =>
            this.notificationRepository.updateNotification(notification._id.toString(), { isRead: true })
        )
        await Promise.all(updatePromises)
        return true
    }

    async deleteNotification(id: string): Promise<boolean> {
        const notification = await this.notificationRepository.getNotificationById(id)
        if (!notification) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Notification not found ${id}`,
                vnMessage: `Không tìm thấy thông báo ${id}`
            }, HttpStatus.NOT_FOUND)
        }
        return await this.notificationRepository.deleteNotification(id)
    }

    async sendPushNotification(data: NotificationDocument): Promise<void> {
        const received = data.received.toString()

        const pushToken = await this.userRepository.getUserPushToken(received)
        if (!pushToken) {
            return
        }
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`)
            return
        }
        const message = {
            to: pushToken,
            sound: 'default',
            title: data.title,
            body: data.body,
            data: {}
        }
        try {
            await this.expo.sendPushNotificationsAsync([message])
        } catch (error) {
            console.error('Error sending push notification:', error)
        }
    }
}