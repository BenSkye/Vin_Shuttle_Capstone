import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { REDIS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { IRedisService, ITokenProvider } from 'src/share/share.port';



@WebSocketGateway({
    namespace: `/${SOCKET_NAMESPACE.TRIPS}`,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 30000,
})
@UseGuards(WsAuthGuard)
export class TripGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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
                console.log('error50', error)
                next(error);
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const payload = (client as any).user;
            client.join(`user_${payload._id}`);
            this.redisService.setUserSocket(SOCKET_NAMESPACE.TRIPS, payload._id, client.id);
            console.log(`Client connected: ${client.id}, User: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.TRIPS, client.id);
        console.log(`Client disconnected: ${client.id}`);
    }

    async emitTripUpdate(userId: string, tripData: any) {
        const socketId = await this.redisService.getUserSockets(SOCKET_NAMESPACE.TRIPS, userId);
        if (socketId) {
            console.log('socketId84', socketId)
            this.server.to(socketId).emit('trip_updated', tripData);
        }
    }

    async emitTripUpdateDetail(userId: string, tripId: string, tripData: any) {
        const socketId = await this.redisService.getUserSockets(SOCKET_NAMESPACE.TRIPS, userId);
        console.log('socketId', socketId)
        console.log('trip_updated_detail_', tripId)
        if (socketId) {
            this.server.to(socketId).emit(`trip_updated_detail_${tripId}`, tripData);
        }
    }
}
