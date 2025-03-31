import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repo';
import { ConversationGateway } from './conversation.gateway';
import { Conversation, ConversationSchema } from './conversation.schema';
import {
  CONVERSATION_GATEWAY,
  CONVERSATION_REPOSITORY,
  CONVERSATION_SERVICE,
} from 'src/modules/conversation/conversation.di-token';
import { ShareModule } from 'src/share/share.module';
import { KeytokenModule } from 'src/modules/keytoken/keytoken.module';

const dependencies = [
  {
    provide: CONVERSATION_SERVICE,
    useClass: ConversationService,
  },
  {
    provide: CONVERSATION_REPOSITORY,
    useClass: ConversationRepository,
  },
  {
    provide: CONVERSATION_GATEWAY,
    useClass: ConversationGateway,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
    ]),
    ShareModule,
    KeytokenModule,
  ],
  controllers: [ConversationController],
  providers: [...dependencies],
  exports: [...dependencies],
})
export class ConversationModule {}
