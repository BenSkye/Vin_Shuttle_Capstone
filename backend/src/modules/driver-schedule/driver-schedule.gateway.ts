import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { REDIS_PROVIDER, TOKEN_PROVIDER } from 'src/share/di-token';
import { IRedisService, ITokenProvider } from 'src/share/interface';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';

@WebSocketGateway({
    namespace: `/${SOCKET_NAMESPACE.DRIVER_SCHEDULE}`,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 30000,
})
@UseGuards(WsAuthGuard)
export class DriverScheduleGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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
            client.join(`driver_${payload._id}`);
            await this.redisService.setUserSocket(SOCKET_NAMESPACE.DRIVER_SCHEDULE, payload._id, client.id);
            console.log(`Driver connected: ${client.id}, Driver: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.DRIVER_SCHEDULE, client.id);
        console.log(`Driver disconnected: ${client.id}`);
    }

    async handleDriverCheckin(driverId: string, vehicleId: string) {
        await this.redisService.set(`${SOCKET_NAMESPACE.DRIVER_SCHEDULE}-vehicle-${driverId}`, vehicleId, 86400);
        console.log(`Driver ${driverId} checked in with vehicle ${vehicleId}`);
    }
}
