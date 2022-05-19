import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistory } from 'src/apis/chatHistory/entities/chatHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatSerivce {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
  ) {}

  async create({ userId, boardId, message }) {
    const result = await this.chatHistoryRepository.save({
      user: { id: userId },
      board: { id: boardId },
      message: message,
    });
    return result;
  }
}
