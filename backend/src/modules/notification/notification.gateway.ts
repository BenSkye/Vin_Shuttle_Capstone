import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { REDIS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { IRedisService, ITokenProvider } from 'src/share/share.port';
import { SocketUtils } from 'src/share/utils/socket.utils';

@WebSocketGateway({
    namespace: `/${SOCKET_NAMESPACE.NOTIFICATIONS}`,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 30000,
})
@UseGuards(WsAuthGuard)
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(
        @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
        @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
        @Inject(REDIS_PROVIDER) private readonly redisService: IRedisService,
    ) { }

    afterInit(server: Server) {
        server.use(async (socket: Socket, next) => {
            try {
                const guard = new WsAuthGuard(
                    this.tokenProvider,
                    this.keyTokenService
                );
                const canActivate = await guard.canActivate({
                    switchToWs: () => ({ getClient: () => socket }),
                    getHandler: () => null,
                    getClass: () => null,
                } as ExecutionContext);

                if (canActivate) {
                    next();
                } else {
                    throw new HttpException(
                        {
                            statusCode: HttpStatus.UNAUTHORIZED,
                            message: 'Unauthorized',
                            vnMessage: 'Không có quyền truy cập',
                        },
                        HttpStatus.UNAUTHORIZED,
                    );
                }
            } catch (error) {
                next(error);
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const payload = (client as any).user;
            client.join(`user_${payload._id}`);
            this.redisService.setUserSocket(SOCKET_NAMESPACE.NOTIFICATIONS, payload._id, client.id);
            console.log(`Client connected to notification gateway: ${client.id}, User: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Notification connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.NOTIFICATIONS, client.id);
        console.log(`Client disconnected from notification gateway: ${client.id}`);
    }

    async emitNewNotification(userId: string, notificationData: any) {
        const socketIds = await SocketUtils.getSocketIds(
            this.redisService,
            SOCKET_NAMESPACE.NOTIFICATIONS,
            userId
        )
        await SocketUtils.safeEmit(
            this.server,
            socketIds,
            'new_notification',
            notificationData
        )
    }

    async emitNotificationUpdate(userId: string, notificationId: string, notificationData: any) {
        const socketIds = await SocketUtils.getSocketIds(
            this.redisService,
            SOCKET_NAMESPACE.NOTIFICATIONS,
            userId
        )
        await SocketUtils.safeEmit(
            this.server,
            socketIds,
            `notification_updated_${notificationId}`,
            notificationData
        )
    }

    async emitUnreadCount(userId: string, count: number) {
        const socketIds = await SocketUtils.getSocketIds(
            this.redisService,
            SOCKET_NAMESPACE.NOTIFICATIONS,
            userId
        )
        await SocketUtils.safeEmit(
            this.server,
            socketIds,
            'unread_notification_count',
            { count }
        )
    }
}