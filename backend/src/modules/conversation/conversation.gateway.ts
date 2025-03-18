import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { WsAuthGuard } from '../auth/wsAuth.guard';
import { ConversationService } from './conversation.service';
import { REDIS_PROVIDER, TOKEN_PROVIDER } from '../../share/di-token';
import { IRedisService, ITokenProvider } from '../../share/share.port';
import { SOCKET_NAMESPACE } from '../../share/enums/socket.enum';
import { ConversationDocument } from 'src/modules/conversation/conversation.schema';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { CONVERSATION_SERVICE } from 'src/modules/conversation/conversation.di-token';

@WebSocketGateway({
    namespace: `/${SOCKET_NAMESPACE.CONVERSATIONS}`,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
})
@UseGuards(WsAuthGuard)
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        @Inject(REDIS_PROVIDER) private readonly redisService: IRedisService,
        @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
        @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,
        @Inject(CONVERSATION_SERVICE) private readonly conversationService: ConversationService
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
                console.log('error', error)
                next(error);
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const user = (client as any).user;
            await this.redisService.setUserSocket(
                SOCKET_NAMESPACE.CONVERSATIONS,
                user._id,
                client.id
            );
            // Tự động join room user khi connect
            client.join(`user_${user._id}`);
            console.log(`Client connected to conversations: ${client.id}, User: ${user._id}`);
        } catch (error) {
            client.disconnect(true);
            console.error('Connection error:', error);
        }
    }

    handleDisconnect(client: Socket) {
        this.redisService.deleteUserSocket(SOCKET_NAMESPACE.CONVERSATIONS, client.id);
        console.log(`Client disconnected from conversations: ${client.id}`);
    }

    async emitNewConversation(conversation: ConversationDocument) {
        try {
            const customerSocketId = await this.redisService.getUserSockets(
                SOCKET_NAMESPACE.NOTIFICATIONS,
                conversation.customerId._id.toString()
            );
            const driverSocketId = await this.redisService.getUserSockets(
                SOCKET_NAMESPACE.NOTIFICATIONS,
                conversation.driverId._id.toString()
            )
            if (customerSocketId) {
                this.server.to(customerSocketId).emit('newConversation', conversation);
            }
            if (driverSocketId) {
                this.server.to(driverSocketId).emit('newConversation', conversation);
            }
        } catch (error) {
            console.error('Error emitting new conversation:', error);
        }
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(client: Socket, conversationId: string) {
        try {
            const user = (client as any).user;
            const conversation = await this.conversationService.getConversationById(conversationId, user._id);
            if (!conversation || ![conversation.driverId._id.toString(), conversation.customerId._id.toString()].includes(user._id.toString())) {
                throw new Error('Bạn không có quyền truy cập conversation này');
            }
            // Verify user is participant
            if (
                [
                    conversation.driverId._id.toString(),
                    conversation.customerId._id.toString()
                ].includes(user._id.toString())
            ) {
                client.join(conversation._id.toString());
                client.emit('conversationJoined', conversation);
            }
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }


    @SubscribeMessage('leaveConversation')
    async handleLeaveConversation(client: Socket, conversationId: string) {
        client.leave(conversationId);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        client: Socket,
        payload: { conversationId: string; content: string }
    ) {
        try {
            const user = (client as any).user;
            const updatedConversation = await this.conversationService.addMessage(
                payload.conversationId,
                user._id,
                payload.content
            );
            console.log('updatedConversation', updatedConversation);

            // Broadcast message đến room conversation
            this.server.to(payload.conversationId).emit('newMessage', updatedConversation);

            const customerSocketId = await this.redisService.getUserSockets(
                SOCKET_NAMESPACE.CONVERSATIONS,
                updatedConversation.customerId._id.toString()
            );
            const driverSocketId = await this.redisService.getUserSockets(
                SOCKET_NAMESPACE.CONVERSATIONS,
                updatedConversation.driverId._id.toString()
            )
            console.log('customerSocketId', customerSocketId);
            if (customerSocketId) {
                const conversationsList = await this.conversationService.getUserConversations(updatedConversation.customerId._id.toString());
                this.server.to(customerSocketId).emit('conversationsList', conversationsList);
            }
            if (driverSocketId) {
                const conversationsList = await this.conversationService.getUserConversations(updatedConversation.driverId._id.toString());
                this.server.to(driverSocketId).emit('conversationsList', conversationsList);
            }
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

}