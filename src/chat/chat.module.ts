import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesService } from '../messages/messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [ChatGateway, MessagesService],
  exports: [ChatGateway],
  controllers: [],
})
export class ChatModule {}
