import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { REDIS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { IRedisService, ITokenProvider, Position } from 'src/share/interface';
import { UserRole } from 'src/share/enums';



@WebSocketGateway({
    namespace: `/${SOCKET_NAMESPACE.TRACKING}`,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 30000,
})
@UseGuards(WsAuthGuard)
export class TrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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
                            vnMesage: 'Không có quyền truy cập',
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
            console.log('payload', payload);
            if (payload.role === UserRole.CUSTOMER) {
                client.join(`user_${payload._id}`);
            }
            if (payload.role === UserRole.DRIVER) {
                client.join(`driver_${payload._id}`);
            }
            this.redisService.setUserSocket(SOCKET_NAMESPACE.TRACKING, payload._id, client.id);
            console.log(`Client connected: ${client.id}, User: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.TRACKING, client.id);
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('driver_location_update')
    async onDriverLocationUpdate(client: Socket, location: Position) {
        const payload = (client as any).user;
        const driverId = payload._id
        const vehicleId = await this.redisService.get(`${SOCKET_NAMESPACE.DRIVER_SCHEDULE}-vehicle-${driverId}`);
        console.log('driver_location_update', driverId, vehicleId, location);
        const ListUserIdTrackingVehicle = await this.redisService.getListUserTrackingVehicle(vehicleId);
        ListUserIdTrackingVehicle.forEach(userId => {
            this.emitLocationUpdate(userId, vehicleId, location);
        });
    }

    async emitLocationUpdate(userId: string, vehicleId: string, location: Position) {
        const socketId = await this.redisService.getUserSocket(SOCKET_NAMESPACE.TRACKING, userId);
        if (socketId) {
            console.log(`Emitting location update to: ${socketId} for vehicle: ${vehicleId} - ${location.lat}, ${location.lng}`);
            this.server.to(socketId).emit(`update_location_${vehicleId}`, location);
        }
    }
}
