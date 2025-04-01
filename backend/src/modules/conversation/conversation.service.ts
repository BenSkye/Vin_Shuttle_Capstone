// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.service.ts
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { IConversationService } from 'src/modules/conversation/conversation.port';
import {
  ICreateConversation,
  IUpdateConversation,
} from 'src/modules/conversation/conversation.dto';
import { ConversationDocument } from 'src/modules/conversation/conversation.schema';
import { IConversationRepository } from 'src/modules/conversation/conversation.port';
import { CONVERSATION_REPOSITORY } from 'src/modules/conversation/conversation.di-token';
import { ConversationStatus } from 'src/share/enums/conversation.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ConversationService implements IConversationService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async createConversation(data: ICreateConversation): Promise<ConversationDocument> {
    const { tripId, customerId, driverId, timeToOpen, timeToClose } = data;
    //nếu timeToOpen trước hiện tại thì thêm status open vào conversation
    const current = new Date();
    if (timeToOpen < current) {
      data = {
        ...data,
        status: ConversationStatus.OPENED,
      };
    }
    return await this.conversationRepository.create(data);
  }

  async getConversationByTripId(tripId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationRepository.getConversation({ tripId }, []);
    if (!conversation) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Conversation not found with tripId ${tripId}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return conversation;
  }

  async getConversationById(id: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationRepository.getConversationById(id);
    if (!conversation) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Conversation not found ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    console.log('userId', userId);
    console.log('conversation.customerId', conversation.customerId);
    console.log('conversation.driverId', conversation.driverId);
    if (
      conversation.customerId._id.toString() !== userId &&
      conversation.driverId._id.toString() !== userId
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `You do not have permission to access this conversation`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    console.log('conversation', conversation);
    return conversation;
  }

  async getPersonalConversations(userId: string): Promise<ConversationDocument[]> {
    return await this.conversationRepository.getListConversation(
      {
        $or: [{ customerId: userId }, { driverId: userId }],
        status: ConversationStatus.OPENED,
      },
      [],
    );
  }

  async closeConversation(id: string): Promise<boolean> {
    const result = await this.conversationRepository.closeConversation(id);
    if (!result) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Conversation not found ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async openConversation(id: string): Promise<boolean> {
    const result = await this.conversationRepository.openConversation(id);
    if (!result) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Conversation not found ${id}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async addMessage(id: string, senderId: string, content: string): Promise<ConversationDocument> {
    return await this.conversationRepository.addMessage(id, senderId, content);
  }

  //run every 1 minute function check timeToOpen and timeToClose
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'checkTimeToOpenAndClose',
  })
  async checkTimeToOpenAndClose() {
    const current = new Date();
    const conversations = await this.conversationRepository.getListConversation(
      {
        status: ConversationStatus.PENDING,
        timeToOpen: { $lte: current },
      },
      [],
    );
    conversations.forEach(async conversation => {
      await this.conversationRepository.openConversation(conversation._id.toString());
    });

    const conversationsClose = await this.conversationRepository.getListConversation(
      {
        status: ConversationStatus.OPENED,
        timeToClose: { $lte: current },
      },
      [],
    );
    conversationsClose.forEach(async conversation => {
      await this.conversationRepository.closeConversation(conversation._id.toString());
    });
  }
}
