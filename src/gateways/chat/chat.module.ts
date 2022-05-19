import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistory } from 'src/apis/chatHistory/entities/chatHistory.entity';
import { ChatGateway } from './chat.gatewy';
import { ChatSerivce } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatHistory, //
    ]),
  ],
  providers: [ChatGateway, ChatSerivce],
})
export class ChatModule {}
