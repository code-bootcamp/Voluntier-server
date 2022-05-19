import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/entities/board.entity';
import { User } from '../user/entities/user.entity';
import { Enroll, ENROLL_STATUS_ENUM } from './entities/enroll.entity';

@Injectable()
export class EnrollService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enroll)
    private readonly enrollRepository: Repository<Enroll>,
  ) {}

  async findAllByBoardId({ boardId }) {
    return await this.enrollRepository.find({
      where: {
        board: {
          id: boardId,
        },
      },
      relations: ['user'],
    });
  }

  async findAllByUserId({ userId }) {
    return await this.enrollRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async create({ boardId, userId }) {
    const prevEnroll = await this.enrollRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        status: ENROLL_STATUS_ENUM.ENROLL,
      },
    });

    if (!prevEnroll) {
      const enroll = await this.enrollRepository.save({
        user: {
          id: userId,
        },
        board: {
          id: boardId,
        },
        status: ENROLL_STATUS_ENUM.ENROLL,
      });

      return enroll;
    }
    {
      throw new UnprocessableEntityException('이미 등록한 신청 건이 있습니다.');
    }
  }

  async update({ boardId, enrollId, userId }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const board: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (board.user.id === userId || currentUser.isAdmin === true) {
      const prevEnroll: Enroll = await this.enrollRepository.findOne({
        id: enrollId,
      });

      const newEnroll: Enroll = {
        ...prevEnroll,
        status: ENROLL_STATUS_ENUM.COMPLETE,
      };

      const enroll = await this.enrollRepository.save(newEnroll);

      return enroll;
    } else {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 수정할 수 없습니다.',
      );
    }
  }

  async delete({ boardId, enrollId, userId }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const board: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (board.user.id === userId || currentUser.isAdmin === true) {
      const result = await this.enrollRepository.softDelete({ id: enrollId });
      return result.affected ? true : false;
    } else {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 삭제할 수 없습니다.',
      );
    }
  }

  async checkExist({ enrollId }) {
    const enroll = await this.enrollRepository.findOne({
      id: enrollId,
    });
    if (!enroll) throw new UnprocessableEntityException('없는 신청 건입니다.');
  }

  async checkExistBoard({ boardId }) {
    const board = await this.boardRepository.findOne({
      id: boardId,
    });
    if (!board) throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
