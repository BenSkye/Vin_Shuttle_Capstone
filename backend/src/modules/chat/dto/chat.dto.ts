export class SendMessageDto {
  content: string;
  receiverId: string;
}

export class JoinRoomDto {
  roomId: string;
}

export class CreateRoomDto {
  participants: string[];
  bookingId?: string;
}

export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  roomId: string;
}

export class RoomResponseDto {
  id: string;
  participants: string[];
  bookingId?: string;
  lastMessage?: MessageResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
