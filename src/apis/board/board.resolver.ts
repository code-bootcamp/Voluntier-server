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
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
  ) {
    // 0. 검색어 없으면 MySQL 조회
    if (search === undefined) {
      return await this.boardService.findAll({
        search,
        location1,
        location2,
        page,
      });
    }

    // ==========================================

    // 1. Redis 조회
    const resultBoards = [];

    let searchKey = '';

    search = search.toLowerCase();
    searchKey += search;

    if (location1 !== undefined) {
      searchKey += `:${location1}`;
    }
    if (location2 !== undefined) {
      searchKey += `:${location2}`;
    }

    searchKey += `:${page}`;

    const searchCache = await this.cacheManager.get(searchKey);

    // ==========================================

    // 2. Redis 캐시 반환
    if (searchCache) {
      for (let i = 0; i < searchCache.length; i++) {
        searchCache[i]['serviceDate'] = new Date(searchCache[i]['serviceDate']);
        searchCache[i]['createdAt'] = new Date(searchCache[i]['createdAt']);
        searchCache[i]['updatedAt'] = new Date(searchCache[i]['updatedAt']);
        searchCache[i]['deletedAt'] =
          searchCache[i]['deletedAt'] === null
            ? null
            : new Date(searchCache[i]['deletedAt']);
      }
      console.log('🔴 On Redis: Data Exist');
      return searchCache;
    }

    // ==========================================

    // 3. ElasticSearch 조회
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
          must_not: {
            exists: {
              field: 'deletedat',
            },
          },
        },
      },
      sort: 'createdat2:desc',
      size: 10,
      from: (page - 1) * 10,
    });

    for (let i = 0; i < boards.hits.hits.length; i++) {
      const board = boards.hits.hits[i]._source;

      const createBoard = {
        id: board.id,
        user: {
          id: board.userid,
          name: board.username,
        },
        title: board.title,
        contents: board.contents,
        centerName: board.centername,
        centerOwnerName: board.centerownername,
        centerPhone: board.centerphone,
        recruitCount: board.recruitcount,
        serviceTime: board.servicetime,
        serviceDate: new Date(board.servicedate * 1000 + 9 * 60 * 60 * 1000),
        address: board.address,
        addressDetail: board.addressdetail,
        location1: board.location1,
        location2: board.location2,
        createdAt: new Date(board.createdat * 1000 + 9 * 60 * 60 * 1000),
        updatedAt: new Date(board.updatedat * 1000 + 9 * 60 * 60 * 1000),
        deletedAt:
          board.delatedat === undefined
            ? null
            : new Date(board.deletedat * 1000 + 9 * 60 * 60 * 1000),
      };

      resultBoards.push(createBoard);
    }

    // ==========================================

    // 4. Redis에 캐시 저장
    if (resultBoards.length !== 0 && searchKey !== '') {
      console.log('🔴 On Redis: Cache Saved');
      await this.cacheManager.set(searchKey, resultBoards, { ttl: 10 });
    }

    // ==========================================

    // 5. 결과 반환
    return resultBoards;
  }

  @Query(() => [Board])
  async fetchBoardsAll() {
    return await this.boardService.findAllBeforeEnd();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  async fetchBoardsOfUser(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.boardService.findAllOfUser({ userId: currentUser.id });
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

  @Query(() => Int)
  async fetchBoardsCount(
    @Args('search', { nullable: true }) search: string, //
    @Args('location1', { nullable: true }) location1: string,
    @Args('location2', { nullable: true }) location2: string,
  ) {
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

    const boards = await this.elasticsearchService.count({
      index: 'board',
      query: {
        bool: {
          must: elasticQuery,
          must_not: {
            exists: {
              field: 'deletedat',
            },
          },
        },
      },
    });

    return boards.count;
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
