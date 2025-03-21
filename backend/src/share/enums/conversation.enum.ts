export enum ConversationStatus {
    PENDING = 'pending',
    OPENED = 'opened',
    CLOSED = 'closed',
}


export const timeToOpenConversation = 0 - (30 * 60 * 1000);
export const timeToCloseConversation = 30 * 60 * 1000;