import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/apis/board/entities/board.entity';
import { ChatHistory } from 'src/apis/chatHistory/entities/chatHistory.entity';
import { Repository } from 'typeorm';

/**
 * Chat Service
 */
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  /**
   * Create Chat History
   * @param userId ID of User
   * @param boardId ID of Board
   * @param message Chat Message
   * @returns `Board`
   */
  async create({
    userId,
    boardId,
    message,
  }: {
    userId: string;
    boardId: string;
    message: string;
  }) {
    const result: ChatHistory = await this.chatHistoryRepository.save({
      user: { id: userId },
      board: { id: boardId },
      message: message,
    });
    return result;
  }

  /**
   * Find one Board
   * @param boardId ID of Board
   * @returns `Board`
   */
  async findBoard({ boardId }: { boardId: string }) {
    const result = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
      relations: ['user'],
    });
    return result;
  }
}
