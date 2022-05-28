import { Injectable } from '@nestjs/common';
import {
  // ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';

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
    private readonly chatService: ChatService, //
  ) {}
  @WebSocketServer()
  server;

  @SubscribeMessage('send')
  async sendMessage(
    @MessageBody() data: string, //
    // @ConnectedSocket() client,
  ) {
    const [room, nickname, message, userId] = data;

    const filteredMessage = message.replace(re, '**');
    const boardUser = await this.chatService.findBoard({ boardId: room });
    const boardUserId = boardUser.user.id;

    this.server.emit(room, [nickname, filteredMessage, userId]);
    if (boardUserId !== userId)
      this.server.emit(boardUserId, [nickname, filteredMessage, userId]);
    await this.chatService.create({ userId: userId, boardId: room, message });
  }
}
