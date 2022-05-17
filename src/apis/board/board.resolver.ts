import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { BoardService } from './board.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board } from './entities/board.entity';
import { Cache } from 'cache-manager';

@Resolver()
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService, //
    private readonly elasticsearchService: ElasticsearchService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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
    // return await this.boardService.findAll({
    //   search,
    //   location1,
    //   location2,
    //   page,
    // });

    // 1. Redis에서 캐시 확인
    const resultBoards = [];

    let searchKey = '';

    if (search !== undefined) {
      search = search.toLowerCase();
      searchKey += search;
    }
    if (location1 !== undefined) {
      searchKey += `:${location1}`;
    }
    if (location2 !== undefined) {
      searchKey += `:${location2}`;
    }
    searchKey += `:${page}`;

    const searchCache = await this.cacheManager.get(searchKey);

    // 2. 있으면 결과 반환
    if (searchCache) {
      for (let i = 0; i < searchCache.length; i++) {
        searchCache[i]['serviceDate'] = new Date(searchCache[i]['serviceDate']);
        searchCache[i]['createdAt'] = new Date(searchCache[i]['createdAt']);
      }
      console.log('🔴 On Redis:', searchCache);
      return searchCache;
    }

    // 3. 없으면 ElasticSearch 검색
    else {
      console.log('🔴 On Redis: No Data');

      const elasticQuery = [];

      if (search !== undefined) {
        elasticQuery.push({
          term: {
            title: search,
          },
        });
      }
      if (location1 !== undefined) {
        elasticQuery.push({
          term: {
            location1: location1,
          },
        });
      }
      if (location2 !== undefined) {
        elasticQuery.push({
          term: {
            location2: location2,
          },
        });
      }

      const boards = await this.elasticsearchService.search<any>({
        index: 'board',
        query: {
          bool: {
            must: elasticQuery,
          },
        },
        sort: 'createdat2:desc',
        size: 10,
        from: (page - 1) * 10,
      });

      console.log('🟢 On Elastic Search:', JSON.stringify(boards, null, '  '));

      for (let i = 0; i < boards.hits.hits.length; i++) {
        const board = boards.hits.hits[i]._source;

        const createBoard = {
          id: board.id,
          title: board.title,
          contents: board.contents,
          centerName: board.centername,
          centerOwnerName: board.centerownername,
          centerPhone: board.centerphone,
          recruitCount: board.recruitcount,
          serviceTime: board.servicetime,
          serviceDate: new Date(board.servicedate * 1000),
          address: board.address,
          addressDetail: board.addressdetail,
          location1: board.location1,
          location2: board.location2,
          createdAt: new Date(board.createdat * 1000),
        };

        resultBoards.push(createBoard);
      }
      // 4. 검색 결과가 있으면 Redis에 저장
      if (resultBoards.length !== 0 && searchKey !== '') {
        console.log('🔴 On Redis: Cache Saved');
        await this.cacheManager.set(searchKey, resultBoards, { ttl: 10 });
      }

      // 5. 조회 결과 반환
      return resultBoards;
    }
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
