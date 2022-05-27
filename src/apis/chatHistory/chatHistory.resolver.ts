import { Args, Query, Resolver } from '@nestjs/graphql';
import { ChatHistoryService } from './chatHistory.service';
import { ChatHistory } from './entities/chatHistory.entity';

/**
 * Chat History GraphQL API Resolver
 * @APIs `fetchChatHistory`
 */
@Resolver()
export class ChatHistoryResolver {
  constructor(
    private readonly chatHistoryService: ChatHistoryService, //
  ) {}

  /**
   * Fetch Chat History of Board
   * @type [`Query`]
   * @param boardId 채팅내역을 가져올 게시물의 ID
   * @returns `[ChatHistory]`
   */
  @Query(() => [ChatHistory])
  async fetchChatHistory(
    @Args('boardId') boardId: string, //
  ) {
    return await this.chatHistoryService.findAll({ boardId });
  }
}
