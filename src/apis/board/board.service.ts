import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, getRepository, Like, Repository } from 'typeorm';
import { BoardImage } from '../boardImage/entities/boardImage.entity';
import { User } from '../user/entities/user.entity';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board } from './entities/board.entity';

/**
 * Board Service
 */
@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BoardImage)
    private readonly boardImageRepository: Repository<BoardImage>,
  ) {}

  /**
   * Find one Board
   * @param boardId ID of Board
   * @returns `Board`
   */
  async findOne({ boardId }: { boardId: string }) {
    const result = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user', 'boardImage'],
    });

    return result;
  }

  /**
   * Find All Boards
   * @param search Search keyword of title(ex. `강아지`)
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @param page Search page number(ex. `1`)
   * @returns `[Board]`
   */
  async findAll({
    search,
    location1,
    location2,
    page,
  }: {
    search: string;
    location1: string;
    location2: string;
    page: number;
  }) {
    const options: FindManyOptions<Board> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
      relations: ['user', 'boardImage'],
    };

    const whereOptions = {};

    if (search !== undefined && search !== '' && search !== null) {
      whereOptions['title'] = Like(`%${search}%`);
    }

    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      whereOptions['location1'] = location1;
    }

    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      whereOptions['location2'] = location2;
    }

    options['where'] = whereOptions;

    return await this.boardRepository.find(options);
  }

  /**
   * Find All Boards before end
   * @returns `[Board]`
   */
  async findAllBeforeEnd() {
    const now = new Date();
    now.setHours(now.getHours() + 9);

    const result = await getRepository(Board)
      .createQueryBuilder('b')
      .where('b.serviceDate > :now', { now: now })
      .orderBy('b.createdAt', 'DESC')
      .getMany();

    return result;
  }

  /**
   * Find All Boards of user
   * @param userId ID of user
   * @returns `[Board]`
   */
  async findAllOfUser({ userId }: { userId: string }) {
    const result = await this.boardRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'boardImage'],
      order: { createdAt: 'DESC' },
    });

    return result;
  }

  /**
   * Find All Boards near deadline
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @returns `[Board]`
   */
  async findAllNearDeadline({
    location1,
    location2,
  }: {
    location1: string;
    location2: string;
  }) {
    const options: FindManyOptions<Board> = {
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user', 'boardImage'],
    };

    const whereOptions = {};

    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      whereOptions['location1'] = location1;
    }

    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      whereOptions['location2'] = location2;
    }

    options['where'] = whereOptions;

    return await this.boardRepository.find(options);
  }

  /**
   * Find All Boards Count
   * @param search Search keyword of title(ex. `강아지`)
   * @param location1 Search location(ex. `서울특별시`)
   * @param location2 Search location detail(ex. `구로구`)
   * @returns result count
   */
  async findAllCount({
    search,
    location1,
    location2,
  }: {
    search: string;
    location1: string;
    location2: string;
  }) {
    const options: FindManyOptions<Board> = {};

    const whereOptions = {};

    if (search !== undefined && search !== '' && search !== null) {
      whereOptions['title'] = Like(`%${search}%`);
    }

    if (location1 !== undefined && location1 !== '' && location1 !== null) {
      whereOptions['location1'] = location1;
    }

    if (location2 !== undefined && location2 !== '' && location2 !== null) {
      whereOptions['location2'] = location2;
    }

    options['where'] = whereOptions;

    return await this.boardRepository.count(options);
  }

  /**
   * Create Board
   * @param createBoardInput input type of createBoard
   * @param userId ID of user
   * @returns `Board`
   */
  async create({
    createBoardInput,
    userId,
  }: {
    createBoardInput: CreateBoardInput;
    userId: string;
  }) {
    createBoardInput['user'] = {
      id: userId,
    };

    const board: Board = await this.boardRepository.save({
      ...createBoardInput,
    });

    const { urls } = createBoardInput;

    if (urls !== undefined) {
      await this.boardImageRepository.delete({
        board: {
          id: board.id,
        },
      });

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        await this.boardImageRepository.save({
          imageUrl: url,
          board: {
            id: board.id,
          },
        });
      }
    }

    return board;
  }

  /**
   * Update Board
   * @param boardId ID of Board
   * @param updateBoardInput input type of updateBoard
   * @param userId ID of user
   * @returns `Board`
   */
  async update({
    boardId,
    updateBoardInput,
    userId,
  }: {
    boardId: string;
    updateBoardInput: UpdateBoardInput;
    userId: string;
  }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const prevBoard: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (prevBoard.user.id !== userId && currentUser.isAdmin !== true) {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 수정할 수 없습니다.',
      );
    }

    const newBoard: Board = {
      ...prevBoard,
      ...updateBoardInput,
    };

    const board = await this.boardRepository.save(newBoard);

    const { urls } = updateBoardInput;

    if (urls !== undefined) {
      await this.boardImageRepository.delete({
        board: {
          id: board.id,
        },
      });

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        await this.boardImageRepository.save({
          imageUrl: url,
          board: {
            id: board.id,
          },
        });
      }
    }

    return board;
  }

  /**
   * Delete Board
   * @param boardId ID of Board
   * @param userId ID of user
   * @returns delete result(`true`, `false`)
   */
  async delete({ boardId, userId }: { boardId: string; userId: string }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const board: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (board.user.id !== userId && currentUser.isAdmin !== true) {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 삭제할 수 없습니다.',
      );
    }

    const result = await this.boardRepository.softDelete({ id: boardId });

    await this.boardImageRepository.delete({
      board: {
        id: board.id,
      },
    });

    return result.affected ? true : false;
  }

  /**
   * Check if Board exists
   * @param boardId ID of Board
   */
  async checkExist({ boardId }: { boardId: string }) {
    const board = await this.boardRepository.findOne({
      id: boardId,
    });
    if (!board) throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
