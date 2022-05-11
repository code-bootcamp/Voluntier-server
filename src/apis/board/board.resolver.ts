import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService, //
  ) {}

  @Query(() => Board)
  fetchBoard() {
    return;
  }

  @Query(() => [Board])
  fetchBoards() {
    return;
  }

  @Query(() => [Board])
  fetchBoardsNearDeadline() {
    return;
  }

  @Mutation(() => Board)
  createBoard() {
    return;
  }

  @Mutation(() => Board)
  updatedBoard() {
    return;
  }

  @Mutation(() => Boolean)
  deleteBoard() {
    return;
  }
}
