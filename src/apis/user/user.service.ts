import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findOne() {
    // 유저 조회!
    return;
  }

  create({ createUserInput }) {
    // 유저 생성!
    return;
  }

  update({ userId, updateUserInput }) {
    // 유저 수정!
    return;
  }

  delete() {
    // 유저 삭제!
    return;
  }

  async checkExist({ userId }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new UnprocessableEntityException('없는 회원입니다.');
  }
}
