import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesService } from '../messages/messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ConfigModule],
  providers: [ChatGateway, MessagesService, ChatService],
  exports: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
