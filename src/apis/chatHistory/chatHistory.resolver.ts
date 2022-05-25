import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatHistoryService } from './chatHistory.service';
import { ChatHistory } from './entities/chatHistory.entity';

@Resolver()
export class ChatHistoryResolver {
  constructor(
    private readonly chatHistoryService: ChatHistoryService, //
  ) {}

  /**
   *
   * @param boardId 채팅내역을 가져올 게시물의 ID
   * @returns
   */
  @Query(() => [ChatHistory])
  async fetchChatHistory(
    @Args('boardId') boardId: string, //
  ) {
    return this.chatHistoryService.findAll({ boardId });
  }
}
