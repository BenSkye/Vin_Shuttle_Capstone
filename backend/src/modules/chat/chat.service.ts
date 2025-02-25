import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { CreateRoomDto, MessageResponseDto, RoomResponseDto, SendMessageDto } from './dto/chat.dto';
import { Message } from './interfaces/message.interface';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    const roomId = `room_${Date.now()}`;
    const newRoom = await this.chatModel.create({
      roomId,
      participants: createRoomDto.participants,
      bookingId: createRoomDto.bookingId,
    });

    return {
      id: newRoom.roomId,
      participants: newRoom.participants,
      bookingId: newRoom.bookingId,
      createdAt: newRoom.createdAt,
      updatedAt: newRoom.updatedAt,
    };
  }

  async saveMessage(
    roomId: string,
    message: SendMessageDto & { senderId: string },
  ): Promise<MessageResponseDto> {
    const newMessage: Message = {
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: new Date(),
      isRead: false,
    };

    const room = await this.chatModel.findOneAndUpdate(
      { roomId },
      { lastMessage: newMessage },
      { new: true },
    );

    if (!room) {
      throw new Error('Room not found');
    }

    return {
      id: `msg_${Date.now()}`,
      ...newMessage,
      roomId,
    };
  }

  async getRoomByBookingId(bookingId: string): Promise<RoomResponseDto | null> {
    const room = await this.chatModel.findOne({ bookingId }).exec();
    if (!room) return null;

    return {
      id: room.roomId,
      participants: room.participants,
      bookingId: room.bookingId,
      lastMessage: room.lastMessage
        ? {
            id: `msg_${room.lastMessage.timestamp.getTime()}`,
            senderId: room.lastMessage.senderId,
            receiverId: room.lastMessage.receiverId,
            content: room.lastMessage.content,
            timestamp: room.lastMessage.timestamp,
            isRead: room.lastMessage.isRead,
            roomId: room.roomId,
          }
        : undefined,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  async getRoomById(roomId: string): Promise<RoomResponseDto | null> {
    const room = await this.chatModel.findOne({ roomId }).exec();
    if (!room) return null;

    return {
      id: room.roomId,
      participants: room.participants,
      bookingId: room.bookingId,
      lastMessage: room.lastMessage
        ? {
            id: `msg_${room.lastMessage.timestamp.getTime()}`,
            senderId: room.lastMessage.senderId,
            receiverId: room.lastMessage.receiverId,
            content: room.lastMessage.content,
            timestamp: room.lastMessage.timestamp,
            isRead: room.lastMessage.isRead,
            roomId: room.roomId,
          }
        : undefined,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  async getRoomsByUserId(userId: string): Promise<RoomResponseDto[]> {
    const rooms = await this.chatModel.find({ participants: userId }).exec();

    return rooms.map(room => ({
      id: room.roomId,
      participants: room.participants,
      bookingId: room.bookingId,
      lastMessage: room.lastMessage
        ? {
            id: `msg_${room.lastMessage.timestamp.getTime()}`,
            senderId: room.lastMessage.senderId,
            receiverId: room.lastMessage.receiverId,
            content: room.lastMessage.content,
            timestamp: room.lastMessage.timestamp,
            isRead: room.lastMessage.isRead,
            roomId: room.roomId,
          }
        : undefined,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));
  }
}
