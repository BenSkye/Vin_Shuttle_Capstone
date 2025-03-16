import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { INotificationRepository } from "src/modules/notification/notification.port";
import { Notification, NotificationDocument } from "src/modules/notification/notification.schema";
import { getSelectData } from "src/share/utils";

@Injectable()
export class NotificationRepository implements INotificationRepository {
    constructor(
        @InjectModel(Notification.name) private readonly NotificationModel: Model<Notification>
    ) { }

    async create(data: any): Promise<NotificationDocument> {
        const newNotification = new this.NotificationModel(data)
        const savedNotification = await newNotification.save();
        return savedNotification
    }

    async getNotificationById(id: string): Promise<NotificationDocument> {
        const notification = await this.NotificationModel.findById(id)
        return notification
    }

    async getNotifications(query: object, select: string[]): Promise<NotificationDocument[]> {
        const notifications = await this.NotificationModel.find(query).select(getSelectData(select))
        return notifications
    }

    async findOneNotification(query: object, select: string[]): Promise<NotificationDocument> {
        const notification = await this.NotificationModel.findOne(query).select(getSelectData(select))
        return notification
    }

    async updateNotification(id: string, data: any): Promise<NotificationDocument> {
        const notification = await this.NotificationModel.findByIdAndUpdate(id, data, { new: true })
        return notification
    }

    async deleteNotification(id: string): Promise<boolean> {
        const result = await this.NotificationModel.findByIdAndDelete(id)
        return !!result
    }
}