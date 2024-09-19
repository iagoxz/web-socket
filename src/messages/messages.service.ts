import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async saveMessage(sender: string, roomName: string, content: string): Promise<Message> {
    const message = this.messagesRepository.create({ sender, roomName, content });
    return this.messagesRepository.save(message);
  }

  async getAllMessages(roomName: string): Promise<Message[]> {
    return this.messagesRepository.find({ where: { roomName } });
  }
}
