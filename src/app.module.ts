import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { Message } from './messages/message.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Credenciais hardcoded
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '172.19.64.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'chat_app',
      entities: [Message],
      synchronize: true,
    }),
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
