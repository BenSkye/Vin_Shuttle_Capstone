import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto, JoinRoomDto, CreateRoomDto } from './dto/chat.dto';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger('ChatGateway');
    private userSocketMap: Map<string, string> = new Map();

    @WebSocketServer() server: Server;

    constructor(private chatService: ChatService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.userSocketMap.set(userId, client.id);
            client.join(`user_${userId}`);
            this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.findUserIdBySocketId(client.id);
        if (userId) {
            this.userSocketMap.delete(userId);
            this.logger.log(`Client disconnected: ${client.id} for user: ${userId}`);
        }
    }

    private findUserIdBySocketId(socketId: string): string | undefined {
        for (const [userId, id] of this.userSocketMap.entries()) {
            if (id === socketId) return userId;
        }
        return undefined;
    }

    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: JoinRoomDto,
    ) {
        client.join(data.roomId);
        this.logger.log(`Client ${client.id} joined room: ${data.roomId}`);
    }

    @SubscribeMessage('leave_room')
    async handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: JoinRoomDto,
    ) {
        client.leave(data.roomId);
        this.logger.log(`Client ${client.id} left room: ${data.roomId}`);
    }

    @SubscribeMessage('create_room')
    async handleCreateRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: CreateRoomDto,
    ) {
        try {
            const room = await this.chatService.createRoom(data);
            // Join all participants to the room
            room.participants.forEach(participantId => {
                const socketId = this.userSocketMap.get(participantId);
                if (socketId) {
                    this.server.in(socketId).socketsJoin(room.id);
                }
            });
            return { event: 'room_created', data: room };
        } catch (error) {
            this.logger.error('Error creating room:', error);
            return { event: 'error', data: 'Failed to create room' };
        }
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: SendMessageDto & { roomId: string },
    ) {
        try {
            const userId = this.findUserIdBySocketId(client.id);
            if (!userId) {
                throw new Error('User not found');
            }

            const message = await this.chatService.saveMessage(data.roomId, {
                ...data,
                senderId: userId,
            });

            // Emit the message to the room
            this.server.to(data.roomId).emit('new_message', message);

            return { event: 'message_sent', data: message };
        } catch (error) {
            this.logger.error('Error sending message:', error);
            return { event: 'error', data: 'Failed to send message' };
        }
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; isTyping: boolean },
    ) {
        const userId = this.findUserIdBySocketId(client.id);
        if (userId) {
            client.to(data.roomId).emit('user_typing', {
                userId,
                isTyping: data.isTyping,
            });
        }
    }
}
