// filepath: c:\Users\Admin\Desktop\FOR STUDY\SEP\Vin_Shuttle_Capstone\backend\src\modules\conversation\conversation.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import {
  ICreateConversation,
  IUpdateConversation,
} from 'src/modules/conversation/conversation.dto';
import { IConversationService } from 'src/modules/conversation/conversation.port';
import { CONVERSATION_SERVICE } from 'src/modules/conversation/conversation.di-token';
import { HEADER } from 'src/share/interface';

@ApiTags('conversation')
@Controller('conversation')
export class ConversationController {
  constructor(
    @Inject(CONVERSATION_SERVICE)
    private readonly conversationService: IConversationService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Create a conversation' })
  @ApiBody({
    type: ICreateConversation,
    description: 'Create a conversation',
  })
  @ApiBody({
    type: ICreateConversation,
    description: 'Create a conversation',
    examples: {
      'Create a conversation': {
        value: {
          tripId: '67873bb9cf95c847fe62ba5f',
          customerId: '67873bb9cf95c847fe62ba5f',
          driverId: '67873bb9cf95c847fe62ba5f',
        },
      },
    },
  })
  async createConversation(@Body() data: ICreateConversation) {
    return await this.conversationService.createConversation(data);
  }

  @Get('personal-conversation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get conversations for a user' })
  async getUserConversations(@Request() req) {
    return await this.conversationService.getPersonalConversations(req.user._id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get conversation by id' })
  async getConversationById(@Param('id') id: string, @Request() req) {
    return await this.conversationService.getConversationById(id, req.user._id);
  }

  @Delete(':id/close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Close a conversation' })
  async closeConversation(@Param('id') id: string) {
    return await this.conversationService.closeConversation(id);
  }
}
