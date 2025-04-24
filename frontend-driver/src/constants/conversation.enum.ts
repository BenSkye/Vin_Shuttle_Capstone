export enum ConversationStatus {
  PENDING = 'pending',
  OPENED = 'opened',
  CLOSED = 'closed',
}

export const timeToOpenConversation = 0 - 30 * 60 * 1000; // 30 minutes before trip started
export const timeToCloseConversation = 30 * 60 * 1000; // 30 minutes after trip completed
