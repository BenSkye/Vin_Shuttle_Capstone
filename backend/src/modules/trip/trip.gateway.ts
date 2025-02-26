import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, Inject, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/modules/auth/wsAuth.guard';
import { SOCKET_NAMESPACE } from 'src/share/enums/socket.enum';
import { TOKEN_PROVIDER } from 'src/share/di-token';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { ITokenProvider } from 'src/share/interface';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';

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
    ) { }

    private userRooms = new Map<string, string>(); // userId -> socketId
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
                    next(new Error('Unauthorized'));
                }
            } catch (error) {
                console.log('error50', error)
                next(error);
            }
        });
    }

    async handleConnection(client: Socket) {
        console.log('client', client)
        console.log('user', (client as any).user);
        try {
            const payload = (client as any).user;

            // Join user-specific room
            client.join(`user_${payload._id}`);
            this.userRooms.set(payload._id, client.id);

            console.log(`Client connected: ${client.id}, User: ${payload._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Unauthorized connection attempt:', error.message);
        }
    }

    handleDisconnect(client: Socket) {
        const [userId] = [...this.userRooms.entries()]
            .find(([, socketId]) => socketId === client.id) || [];

        if (userId) {
            this.userRooms.delete(userId);
            console.log(`Client disconnected: ${client.id}, User: ${userId}`);
        }
    }

    emitTripUpdate(userId: string, tripData: any) {
        this.server.to(`user_${userId}`).emit('trip_updated', tripData);
    }

    emitDriverUpdate(tripId: string, driverData: any) {
        this.server.to(`trip_${tripId}`).emit('driver_updated', driverData);
    }
}
