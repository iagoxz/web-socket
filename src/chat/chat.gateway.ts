import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';


@WebSocketGateway({
  cors: {
    origin: '*', // Falha de segurança - Motivo: Todos os endereços podem acessar este serviço
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private rooms: Map<string, Set<Socket>> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id);
    this.leaveAllRooms(client);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    this.rooms.get(roomName).add(client);

    client.join(roomName);

    this.server
      .to(roomName)
      .emit('message', { sender: 'Sistema', message: `${client.id} entrou na sala ${roomName}` });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(client);
      client.leave(roomName);
      this.server
        .to(roomName)
        .emit('message', { sender: 'Sistema', message: `${client.id} saiu da sala ${roomName}` });
    }
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomName, message }: { roomName: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('ID do Cliente: ', client.id);
    console.log('Mensagem recebida:', message);
    
    await this.messagesService.saveMessage(client.id, roomName, message);

    const sender = client.id; 
    this.server.to(roomName).emit('message', { sender, message });
  }


  private leaveAllRooms(client: Socket) {
    this.rooms.forEach((sockets, roomName) => {
      if (sockets.has(client)) {
        sockets.delete(client);
        client.leave(roomName);
        this.server
          .to(roomName)
          .emit('message', { sender: 'Sistema', message: `${client.id} saiu da sala ${roomName}` });
      }
    });
  }
}
