import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { BoardService } from './board.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService, //
  ) {}

  @Query(() => Board)
  async fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    await this.boardService.checkExist({ boardId });

    return await this.boardService.findOne({ boardId });
  }

  @Query(() => [Board])
  async fetchBoards(
    @Args('search', { nullable: true }) search: string, //
    @Args('location1', { nullable: true }) location1: string,
    @Args('location2', { nullable: true }) location2: string,
    @Args('page', { type: () => Int }) page: number,
  ) {
    // 0. Redis, ElasticSearch 적용 전 MySQL 조회
    //
    return await this.boardService.findAll({
      search,
      location1,
      location2,
      page,
    });
    // 1. Redis에서 캐시 확인
    //
    // 2. 있으면 결과 반환
    //
    // 3. 없으면 ElasticSearch 검색
    //
    // 4. 검색 결과가 있으면 Redis에 저장
    //
    // 5. 조회 결과 반환
  }

  @Query(() => [Board])
  async fetchBoardsNearDeadline(
    @Args('location1', { nullable: true }) location1: string, //
    @Args('location2', { nullable: true }) location2: string,
  ) {
    return await this.boardService.findAllNearDeadline({
      location1,
      location2,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.boardService.create({
      createBoardInput,
      userId: currentUser.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('boardId') boardId: string, //
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    await this.boardService.checkExist({ boardId });

    return await this.boardService.update({
      boardId,
      updateBoardInput,
      userId: currentUser.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId') boardId: string, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    await this.boardService.checkExist({ boardId });

    return await this.boardService.delete({ boardId, userId: currentUser.id });
  }
}
