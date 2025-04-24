import { ConversationStatus } from '~/constants/conversation.enum';
import { User } from '~/interface/user';

export interface IConversation {
  _id: string;
  tripId: object;
  tripCode: string;
  customerId: User;
  driverId: User;
  listMessage: IMessage[];
  lastMessage: IMessage;
  status: ConversationStatus
  timeToClose: Date;
  timeToOpen: Date;
  createdAt: string;
}

export interface IMessage {
  senderId: string;
  content: string;
  timestamp: string;
  createdAt: string;
}
