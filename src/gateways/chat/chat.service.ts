import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/apis/board/entities/board.entity';
import { ChatHistory } from 'src/apis/chatHistory/entities/chatHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatHistory)
    private readonly chatHistoryRepository: Repository<ChatHistory>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async create({
    userId,
    boardId,
    message,
  }: {
    userId: string;
    boardId: string;
    message: string;
  }) {
    const result = await this.chatHistoryRepository.save({
      user: { id: userId },
      board: { id: boardId },
      message: message,
    });
    return result;
  }

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
