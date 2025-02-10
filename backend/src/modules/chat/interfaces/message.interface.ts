export interface Message {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    bookingId?: string;
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
}
