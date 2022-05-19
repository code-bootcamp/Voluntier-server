import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatHistoryService } from './chatHistory.service';
import { ChatHistory } from './entities/chatHistory.entity';

@Resolver()
export class ChatHistoryResolver {
  constructor(
    private readonly chatHistoryService: ChatHistoryService, //
  ) {}

  // @Mutation(() => ChatHistory)
  // async createChatHistory(
  // ) {
  //   return await this.chatHistoryService.create();
  // }

  @Query(() => [ChatHistory])
  async fetchChatHistory(
    @Args('boardId') boardId: string, //
  ) {
    return this.chatHistoryService.findAll({ boardId });
  }
}
