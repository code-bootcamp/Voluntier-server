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
import * as fs from 'fs';
const list = fs.readFileSync('src/gateways/chat/list.txt', 'utf8').split(',');
let reStr = '';
for (let i = 0; i < list.length; i++) {
  reStr += `${list[i]}`;
  if (i !== list.length - 1) {
    reStr = `${reStr}|`;
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

  @SubscribeMessage('send')
  async sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message, userId] = data;
    // 채팅 필터링
    const filteredMessage = message.replace(re, '**');
    console.log(message);
    console.log(`${client.id} : ${data}`);
    this.server.emit(room, [nickname, filteredMessage, userId]);
    await this.chatService.create({ userId: userId, boardId: room, message });
  }
}
