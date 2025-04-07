import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
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
    namespace: `/${SOCKET_NAMESPACE.SHARE_ITINERARY}`,
    cors: {
        origin: '*',
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 30000,
})
@UseGuards(WsAuthGuard)
export class SharedItineraryGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(
        @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
        @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
        @Inject(REDIS_PROVIDER) private readonly redisService: IRedisService,
    ) { }

    afterInit(server: Server) {
        server.use(async (socket: Socket, next) => {
            try {
                const guard = new WsAuthGuard(this.tokenProvider, this.keyTokenService);
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
                console.log('error50', error);
                next(error);
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const payload = (client as any).user;
            client.join(`user_${payload._id}`);
            this.redisService.setUserSocket(SOCKET_NAMESPACE.SHARE_ITINERARY, payload._id, client.id);
            console.log(`Client connected: ${client.id}, User: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.SHARE_ITINERARY, client.id);
        console.log(`Client disconnected: ${client.id}`);
    }

    async emitUpdatedSharedItineraryDetail(userId: string, sharedItineraryId: string, sharedItinerary: any, message: string, isTripInItineraryCancel?: boolean) {
        const socketIds = await SocketUtils.getSocketIds(
            this.redisService,
            SOCKET_NAMESPACE.SHARE_ITINERARY,
            userId,
        );
        const data = {
            message: message,
            sharedItinerary: sharedItinerary,
            isTripInItineraryCancel: isTripInItineraryCancel || false
        }
        console.log('data93', data);
        await SocketUtils.safeEmit(this.server, socketIds, `updated_shared_itinerary_${sharedItineraryId}`, data,
            {
                debug: true,
            }
        );
    }


}
