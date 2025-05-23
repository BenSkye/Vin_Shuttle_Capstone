// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.repo.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ICreateConversation,
  IUpdateConversation,
} from 'src/modules/conversation/conversation.dto';
import { IConversationRepository } from 'src/modules/conversation/conversation.port';
import { Conversation, ConversationDocument } from 'src/modules/conversation/conversation.schema';
import { ConversationStatus } from 'src/share/enums/conversation.enum';
import { getSelectData } from 'src/share/utils';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) { }

  private getPopulateOptions() {
    return [
      { path: 'customerId', select: '-password' },
      { path: 'driverId', select: '-password' },
      { path: 'tripId' }
    ];
  }

  async create(data: ICreateConversation): Promise<ConversationDocument> {
    const newConversation = new this.conversationModel(data);
    return await newConversation.save();
  }

  async getConversation(query: any, select: string[]): Promise<ConversationDocument> {
    return await this.conversationModel
      .findOne(query)
      .select(getSelectData(select))
      .populate(this.getPopulateOptions());
  }

  async getListConversation(query: any, select: string[]): Promise<ConversationDocument[]> {
    return await this.conversationModel
      .find(query)
      .select(getSelectData(select))
      .populate(this.getPopulateOptions());
  }

  async getConversationById(id: string): Promise<ConversationDocument> {
    return await this.conversationModel.findById(id).populate(this.getPopulateOptions());
  }

  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    return await this.conversationModel
      .find({ $or: [{ customerId: userId }, { driverId: userId }] })
      .populate(this.getPopulateOptions())
      .sort({ updatedAt: -1 });
  }

  async updateConversation(id: string, data: IUpdateConversation): Promise<ConversationDocument> {
    return await this.conversationModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate(this.getPopulateOptions());
  }

  async closeConversation(id: string): Promise<boolean> {
    const conversation = await this.conversationModel.findById(id);
    if (!conversation) return false;
    conversation.status = ConversationStatus.CLOSED;
    await conversation.save();
    return true;
  }

  async openConversation(id: string): Promise<boolean> {
    const conversation = await this.conversationModel.findById(id);
    if (!conversation) return false;
    conversation.status = ConversationStatus.OPENED;
    await conversation.save();
    return true;
  }

  async cancelConversation(id: string): Promise<boolean> {
    const conversation = await this.conversationModel.findById(id);
    if (!conversation) return false;
    conversation.status = ConversationStatus.CANCELLED;
    await conversation.save();
    return true;
  }

  async addMessage(id: string, senderId: string, content: string): Promise<ConversationDocument> {
    return this.conversationModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            listMessage: {
              senderId,
              content,
              timestamp: new Date(),
            },
          },
          $set: {
            lastMessage: {
              senderId,
              content,
              timestamp: new Date(),
            },
          },
        },
        {
          new: true,
        },
      )
      .populate(this.getPopulateOptions());
  }
}
