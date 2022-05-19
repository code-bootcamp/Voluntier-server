import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board.entity';
import { User } from '../user/entities/user.entity';
import { ChatHistoryResolver } from './chatHistory.resolver';
import { ChatHistoryService } from './chatHistory.service';
import { ChatHistory } from './entities/chatHistory.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ChatHistory, Board, User])],
  providers: [
    ChatHistoryResolver, //
    ChatHistoryService,
  ],
})
export class ChatHistoryModule {}
