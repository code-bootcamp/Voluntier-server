import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatHistory } from './entities/chatHistory.entity';

/**
 * Chat History Service
 */
@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
  ) {}

  /**
   * Find All Chat History
   * @param boardId ID of Board
   * @returns `[ChatHistory]`
   */
  async findAll({ boardId }: { boardId: string }) {
    return await this.chatHistoryRepository.find({
      order: { createdAt: 'ASC' },
      where: { board: { id: boardId } },
      relations: ['board', 'user'],
    });
  }
}
