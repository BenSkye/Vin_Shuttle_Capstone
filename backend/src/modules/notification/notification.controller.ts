import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { NOTIFICATION_SERVICE } from "src/modules/notification/notification.di-token";
import { ICreateNotification, notificationParams } from "src/modules/notification/notification.dto";
import { INotificationService } from "src/modules/notification/notification.port";
import { SortOrderOption } from "src/share/enums/sortOrderOption.enum";
import { HEADER } from "src/share/interface";

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService
    ) { }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Create a notification' })
    @ApiBody({
        type: ICreateNotification,
        description: 'Create a notification',
        examples: {
            'Create a notification': {
                value: {
                    received: '67873bb9cf95c847fe62ba5f',
                    title: 'New message',
                    body: 'You have a new message'
                }
            }
        }
    })
    async createNotification(
        @Body() data: ICreateNotification
    ) {
        return await this.notificationService.createNotification(data)
    }

    @Get('get/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Get notification by id' })
    async getNotificationById(
        @Param('id') id: string
    ) {
        return await this.notificationService.getNotificationById(id)
    }

    @Get('personal-notification')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiQuery({ name: 'title', required: false, type: String, description: 'Title of the notification' })
    @ApiQuery({ name: 'body', required: false, type: String, description: 'Body of the notification' })
    @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Is read' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of vehicles' })
    @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of vehicles' })
    @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by field' })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: SortOrderOption,
        description: 'Sort order (asc, desc)'
    })
    async getUserNotifications(
        @Request() req,
        @Query() query: notificationParams
    ) {
        return await this.notificationService.getUserNotifications(req.user._id, query)
    }

    @Patch('mark-read/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(
        @Param('id') id: string
    ) {
        return await this.notificationService.markAsRead(id)
    }

    @Patch('mark-all-read')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(
        @Request() req
    ) {
        return await this.notificationService.markAllAsRead(req.user._id)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'Delete notification' })
    async deleteNotification(
        @Param('id') id: string
    ) {
        return await this.notificationService.deleteNotification(id)
    }
}