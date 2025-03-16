import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { NOTIFICATION_REPOSITORY } from "src/modules/notification/notification.di-token";
import { ICreateNotification } from "src/modules/notification/notification.dto";
import { INotificationRepository, INotificationService } from "src/modules/notification/notification.port";
import { NotificationDocument } from "src/modules/notification/notification.schema";

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: INotificationRepository,
    ) { }

    async createNotification(data: ICreateNotification): Promise<NotificationDocument> {
        return await this.notificationRepository.create(data)
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

    async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
        return await this.notificationRepository.getNotifications({ received: userId }, [])
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
}