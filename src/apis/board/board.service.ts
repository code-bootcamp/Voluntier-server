import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, getRepository, Like, Repository } from 'typeorm';
import { BoardImage } from '../boardImage/entities/boardImage.entity';
import { User } from '../user/entities/user.entity';
import { Board } from './entities/board.entity';
// import * as moment from 'moment-timezone';

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

  async findOne({ boardId }) {
    const result = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user', 'boardImage'],
    });

    return result;
  }

  async findAll({ search, location1, location2, page }) {
    const options: FindManyOptions<Board> = {
      order: { createdAt: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
      relations: ['user', 'boardImage'],
    };

    const whereOptions = {};

    if (search !== undefined) {
      whereOptions['title'] = Like(`%${search}%`);
    }

    if (location1 !== undefined) {
      whereOptions['location1'] = location1;
    }

    if (location2 !== undefined) {
      whereOptions['location2'] = location2;
    }

    options['where'] = whereOptions;

    return await this.boardRepository.find(options);
  }

  async findAllBeforeEnd() {
    //const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss Z'); // 한국 기준 시간
    const now = new Date();
    now.setHours(now.getHours() + 9);

    const result = await getRepository(Board)
      .createQueryBuilder('b')
      .where('b.serviceDate > :now', { now: now })
      .orderBy('b.createdAt', 'DESC')
      .getMany();

    return result;
  }

  async findAllOfUser({ userId }) {
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

  async findAllNearDeadline({ location1, location2 }) {
    const options: FindManyOptions<Board> = {
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user', 'boardImage'],
    };

    const whereOptions = {};

    if (location1 !== undefined) {
      whereOptions['location1'] = location1;
    }

    if (location2 !== undefined) {
      whereOptions['location2'] = location2;
    }

    options['where'] = whereOptions;

    return await this.boardRepository.find(options);
  }

  async create({ createBoardInput, userId }) {
    createBoardInput['user'] = {
      id: userId,
    };

    const board = await this.boardRepository.save({
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

  async update({ boardId, updateBoardInput, userId }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const prevBoard: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (prevBoard.user.id === userId || currentUser.isAdmin === true) {
      const newBoard: Board = {
        ...prevBoard,
        ...updateBoardInput,
        user: {
          id: userId,
        },
      };

      const board = await this.boardRepository.save<Board>(newBoard);

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
    } else {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 수정할 수 없습니다.',
      );
    }
  }

  async delete({ boardId, userId }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const board: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (board.user.id === userId || currentUser.isAdmin === true) {
      const result = await this.boardRepository.softDelete({ id: boardId });

      await this.boardImageRepository.delete({
        board: {
          id: board.id,
        },
      });

      return result.affected ? true : false;
    } else {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 삭제할 수 없습니다.',
      );
    }
  }

  async checkExist({ boardId }) {
    const board = await this.boardRepository.findOne({
      id: boardId,
    });
    if (!board) throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
