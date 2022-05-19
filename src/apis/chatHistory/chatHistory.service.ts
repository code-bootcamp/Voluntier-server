import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chatHistory.entity';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
  ) {}

  async findAll({ boardId }) {
    return await this.chatHistoryRepository.find({
      where: { board: { id: boardId } },
      relations: ['board', 'user'],
    });
  }

  async create({ userId, boardId, message }) {
    const result = await this.chatHistoryRepository.save({
      user: { id: userId },
      board: { id: boardId },
      message: message,
    });
    return result;
  }
}
