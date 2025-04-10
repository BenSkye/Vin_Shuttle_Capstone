import { User } from '~/interface/user';

export interface IConversation {
  _id: string;
  tripId: object;
  tripCode: string;
  customerId: User;
  driverId: User;
  listMessage: IMessage[];
  lastMessage: IMessage;
  createdAt: string;
}

export interface IMessage {
  senderId: string;
  content: string;
  timestamp: string;
}
