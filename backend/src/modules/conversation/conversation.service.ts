// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.service.ts
import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { IConversationService } from "src/modules/conversation/conversation.port";
import { ICreateConversation, IUpdateConversation } from "src/modules/conversation/conversation.dto";
import { ConversationDocument } from "src/modules/conversation/conversation.schema";
import { IConversationRepository } from "src/modules/conversation/conversation.port";
import { CONVERSATION_REPOSITORY } from "src/modules/conversation/conversation.di-token";

@Injectable()
export class ConversationService implements IConversationService {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: IConversationRepository
    ) { }

    async createConversation(data: ICreateConversation): Promise<ConversationDocument> {
        return await this.conversationRepository.create(data);
    }

    async getConversationByTripId(tripId: string): Promise<ConversationDocument> {
        const conversation = await this.conversationRepository.getConversation({ tripId });
        if (!conversation) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Conversation not found with tripId ${tripId}`,
            }, HttpStatus.NOT_FOUND);
        }
        return conversation;
    }

    async getConversationById(id: string, userId: string): Promise<ConversationDocument> {
        const conversation = await this.conversationRepository.getConversationById(id);
        if (!conversation) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Conversation not found ${id}`,
            }, HttpStatus.NOT_FOUND);
        }
        console.log('userId', userId);
        console.log('conversation.customerId', conversation.customerId);
        console.log('conversation.driverId', conversation.driverId);
        if (conversation.customerId._id.toString() !== userId && conversation.driverId._id.toString() !== userId) {
            throw new HttpException({
                statusCode: HttpStatus.FORBIDDEN,
                message: `You do not have permission to access this conversation`,
            }, HttpStatus.FORBIDDEN);
        }
        console.log('conversation', conversation);
        return conversation;
    }

    async getUserConversations(userId: string): Promise<ConversationDocument[]> {
        return await this.conversationRepository.getUserConversations(userId);
    }

    async closeConversation(id: string): Promise<boolean> {
        const conversation = await this.conversationRepository.closeConversation(id);
        if (!conversation) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Conversation not found ${id}`,
            }, HttpStatus.NOT_FOUND);
        }
        return conversation;
    }

    async addMessage(id: string, senderId: string, content: string): Promise<ConversationDocument> {
        return await this.conversationRepository.addMessage(id, senderId, content);
    }
}