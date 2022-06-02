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

/**
 * Board GraphQL API Resolver
 * @APIs `fetchBoard`, `fetchBoards`, `fetchBoardsAll`, `fetchBoardsOfUser`,
 * `fetchBoardsNearDeadline`, `fetchBoardsCount`, `createBoard`, `updateBoard`, `deleteBoard`
 */
@Resolver()
export class BoardResolver {
  constructor(
    private readonly boardService: BoardService, //
    private readonly elasticsearchService: ElasticsearchService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Fetch certain Board API
   * @type [`Query`]
   * @param boardId ID of Board
   * @returns `Board`
   */
  @Query(() => Board)
  async fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    await this.boardService.checkExist({ boardId });

    return await this.boardService.findOne({ boardId });
  }

  /**
   * Fetch All Boards with search options API
   * @type [`Query`]
   * @param search Search keyword of title(ex. `강아지`)
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @param page Search page number(ex. `1`)
   * @returns `[Board]`
   */
  @Query(() => [Board])
  async fetchBoards(
    @Args('search', { nullable: true }) search: string, //
    @Args('location1', { nullable: true }) location1: string,
    @Args('location2', { nullable: true }) location2: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
  ): Promise<Board[]> {
    // Search MySQL
    if (search === undefined || search === '' || search === null) {
      return await this.boardService.findAll({
        search,
        location1,
        location2,
        page,
      });
    }

    // ==========================================

    // Redis Search
    const resultBoards = [];

    let searchKey = '';

    search = search.toLowerCase();
    searchKey += search;

    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      searchKey += `:${location1}`;
    }
    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      searchKey += `:${location2}`;
    }

    searchKey += `:${page}`;

    const searchCache = await this.cacheManager.get<Board[]>(searchKey);

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
      console.log('🔴 On Redis: Cache hit');
      return searchCache;
    }

    // ==========================================

    // Search ElasticSearch
    console.log('🔴 On Redis: Cache miss');

    const elasticQuery = [];

    if (search !== undefined && search !== '' && search !== null) {
      elasticQuery.push({
        term: {
          title: search,
        },
      });
    }
    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      elasticQuery.push({
        term: {
          location1: location1,
        },
      });
    }
    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      elasticQuery.push({
        term: {
          location2: location2,
        },
      });
    }

    interface IBoard {
      id: string;
      userid: string;
      username: string;
      title: string;
      contents: string;
      centername: string;
      centerownername: string;
      centerphone: string;
      recruitcount: number;
      servicetime: number;
      servicedate: number;
      address: string;
      addressdetail: string;
      location1: string;
      location2: string;
      createdat: number;
      updatedat: number;
      deletedat: number;
    }

    try {
      const boards = await this.elasticsearchService.search<IBoard>({
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
            board.deletedat === undefined
              ? null
              : new Date(board.deletedat * 1000 + 9 * 60 * 60 * 1000),
        };

        resultBoards.push(createBoard);
      }

      // ==========================================

      // Save Redis
      if (resultBoards.length !== 0 && searchKey !== '') {
        console.log('🔴 On Redis: Cache Saved');
        await this.cacheManager.set(searchKey, resultBoards, { ttl: 10 });
      }

      return resultBoards;
    } catch (error) {
      console.log('🟢 On Elastic: Could not Search');
      return await this.boardService.findAll({
        search,
        location1,
        location2,
        page,
      });
    }
  }

  /**
   * Fetch All Boards before end API
   * @type [`Query`]
   * @returns `[Board]`
   */
  @Query(() => [Board])
  async fetchBoardsAll() {
    return await this.boardService.findAllBeforeEnd();
  }

  /**
   * Fetch All Boards of login user API
   * @type [`Query`]
   * @returns `[Board]`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  async fetchBoardsOfUser(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.boardService.findAllOfUser({ userId: currentUser.id });
  }

  /**
   * Fetch All Boards near deadline API
   * @type [`Query`]
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @returns `[Board]`
   */
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

  /**
   * Fetch All Boards count API
   * @type [`Query`]
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @returns `Board` count
   */
  @Query(() => Int)
  async fetchBoardsCount(
    @Args('search', { nullable: true }) search: string, //
    @Args('location1', { nullable: true }) location1: string,
    @Args('location2', { nullable: true }) location2: string,
  ) {
    if (search === undefined || search === '' || search === null) {
      return await this.boardService.findAllCount({
        search,
        location1,
        location2,
      });
    }

    const elasticQuery = [];

    if (search !== undefined && search !== '' && search !== null) {
      elasticQuery.push({
        term: {
          title: search,
        },
      });
    }
    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      elasticQuery.push({
        term: {
          location1: location1,
        },
      });
    }
    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      elasticQuery.push({
        term: {
          location2: location2,
        },
      });
    }

    try {
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
    } catch (error) {
      console.log('🟢 On Elastic: Could not Search');
      return await this.boardService.findAllCount({
        search,
        location1,
        location2,
      });
    }
  }

  /**
   * Create Board API
   * @type [`Mutation`]
   * @param createBoardInput input type of createBoard
   * @returns `Board`
   */
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

  /**
   * Update Board API
   * @type [`Mutation`]
   * @param createBoardInput input type of updateBoard
   * @returns `Board`
   */
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

  /**
   * Delete Board API
   * @type [`Mutation`]
   * @param createBoardInput input type of updateBoard
   * @returns delete result(`true`, `false`)
   */
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
