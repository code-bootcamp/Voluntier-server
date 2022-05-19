import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatHistoryService } from 'src/apis/chatHistory/chatHistory.service';
import { ChatSerivce } from './chat.service';

@Injectable()
@WebSocketGateway(8080, {
  namespace: 'chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatSerivce, //
  ) {}
  @WebSocketServer()
  server;

  wsClients = [];

  @SubscribeMessage('joinRoom')
  connectSomeone(@MessageBody() data: string, @ConnectedSocket() client) {
    const [nickname, room] = data;
    console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`);
    const comeOn = `${nickname}님이 입장했습니다.`;
    this.server.emit('comeOn' + room, comeOn);
    this.wsClients.push(client);
  }

  private broadcast(event, client, message: any) {
    for (let c of this.wsClients) {
      if (client.id == c.id) continue;
      c.emit(event, message);
    }
  }

  @SubscribeMessage('send')
  async sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;
    console.log(`${client.id} : ${data}`);
    this.broadcast(room, client, [nickname, message]);
    // await this.chatService.create({ userId: nickname, boardId: room, message });
  }
}
