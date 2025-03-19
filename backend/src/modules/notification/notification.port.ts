
import { ICreateNotification, IUpdateNotification } from "src/modules/notification/notification.dto"
import { NotificationDocument } from "src/modules/notification/notification.schema"

export interface INotificationRepository {
    create(data: ICreateNotification): Promise<NotificationDocument>
    getNotificationById(id: string): Promise<NotificationDocument>
    getNotifications(query: object, select: string[]): Promise<NotificationDocument[]>
    findOneNotification(query: object, select: string[]): Promise<NotificationDocument>
    updateNotification(id: string, data: IUpdateNotification): Promise<NotificationDocument>
    deleteNotification(id: string): Promise<boolean>
}

export interface INotificationService {
    createNotification(data: ICreateNotification): Promise<NotificationDocument>
    getNotificationById(id: string): Promise<NotificationDocument>
    getUserNotifications(userId: string): Promise<NotificationDocument[]>
    markAsRead(id: string): Promise<NotificationDocument>
    markAllAsRead(userId: string): Promise<boolean>
    deleteNotification(id: string): Promise<boolean>
    sendPushNotification(data: NotificationDocument): Promise<void>
}