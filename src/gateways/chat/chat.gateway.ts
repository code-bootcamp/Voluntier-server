import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatSerivce } from './chat.service';

// 채팅 필터링용 정규표현식 생성
const fs = require('fs');
const list = fs.readFileSync('src/gateways/chat/list.txt', 'utf8').split(',');
let reStr = '';
for (let i = 0; i < list.length; i++) {
  reStr += `(${list[i]})`;
  if (i === list.length - 1) {
    reStr = `[${reStr}]`;
  }
}
const re = new RegExp(reStr, 'g');

@Injectable()
@WebSocketGateway({
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
    // 채팅 필터링
    const filteredMessage = message.replace(re, '**');
    console.log(message);
    console.log(`${client.id} : ${data}`);
    this.broadcast(room, client, [nickname, filteredMessage]);
    await this.chatService.create({ userId: nickname, boardId: room, message });
  }
}
