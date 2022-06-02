import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/entities/board.entity';
import { User } from '../user/entities/user.entity';
import { Enroll, ENROLL_STATUS_ENUM } from './entities/enroll.entity';

/**
 * Enroll Service
 */
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

  /**
   * Find All Enrolls of Board
   * @param boardId ID of Board
   * @returns `[Enroll]`
   */
  async findAllByBoardId({ boardId }: { boardId: string }) {
    return await this.enrollRepository.find({
      where: {
        board: {
          id: boardId,
        },
      },
      relations: ['user'],
    });
  }

  /**
   * Find All Enrolls of User
   * @param userId ID of User
   * @returns `[Enroll]`
   */
  async findAllByUserId({ userId }: { userId: string }) {
    return await this.enrollRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['board'],
      withDeleted: true,
    });
  }

  /**
   * Create Enroll
   * @param boardId ID of Board
   * @param userId ID of User
   * @returns `Enroll`
   */
  async create({ boardId, userId }: { boardId: string; userId: string }) {
    const prevEnroll = await this.enrollRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        board: {
          id: boardId,
        },
        status: ENROLL_STATUS_ENUM.ENROLL,
      },
    });

    if (prevEnroll) {
      throw new UnprocessableEntityException('이미 등록한 신청 건이 있습니다.');
    }

    const enroll: Enroll = await this.enrollRepository.save({
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

  /**
   * Update Enroll
   * @param boardId ID of Board
   * @param enrollId ID of Enroll
   * @param userId ID of User
   * @returns `Enroll`
   */
  async update({
    boardId,
    enrollId,
    userId,
  }: {
    boardId: string;
    enrollId: string;
    userId: string;
  }) {
    const currentUser: User = await this.userRepository.findOne({
      id: userId,
    });

    const board: Board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['user'],
    });

    if (board.user.id !== userId && currentUser.isAdmin !== true) {
      throw new UnprocessableEntityException(
        '게시물의 작성자가 아니면 수정할 수 없습니다.',
      );
    }

    const prevEnroll: Enroll = await this.enrollRepository.findOne({
      where: { id: enrollId },
      relations: ['user'],
    });

    const newEnroll: Enroll = {
      ...prevEnroll,
      status: ENROLL_STATUS_ENUM.COMPLETE,
    };

    const enroll = await this.enrollRepository.save(newEnroll);

    const serviceTime = board.serviceTime;

    const enrollUser = await this.userRepository.findOne({
      id: prevEnroll.user.id,
    });

    const newUser: User = {
      ...enrollUser,
      serviceTime: enrollUser.serviceTime + serviceTime,
    };

    await this.userRepository.save(newUser);

    return enroll;
  }

  /**
   * Delete Enroll
   * @param boardId ID of Board
   * @param enrollId ID of Enroll
   * @param userId ID of User
   * @returns delete result(`true`, `false`)
   */
  async delete({
    boardId,
    enrollId,
    userId,
  }: {
    boardId: string;
    enrollId: string;
    userId: string;
  }) {
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

    const result = await this.enrollRepository.softDelete({ id: enrollId });
    return result.affected ? true : false;
  }

  /**
   * Check if Enroll exists
   * @param enrollId ID of Enroll
   */
  async checkExist({ enrollId }: { enrollId: string }) {
    const enroll = await this.enrollRepository.findOne({
      id: enrollId,
    });
    if (!enroll) throw new UnprocessableEntityException('없는 신청 건입니다.');
  }

  /**
   * Check if Board exists
   * @param boardId ID of Board
   */
  async checkExistBoard({ boardId }: { boardId: string }) {
    const board = await this.boardRepository.findOne({
      id: boardId,
    });
    if (!board) throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
