import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne({ userId }) {
    return await this.userRepository.findOne({
      id: userId,
    });
  }

  async findOneByEmail({ email, provider }) {
    return await this.userRepository.findOne({
      email: email,
      provider: provider,
    });
  }

  async create({ createUserInput }) {
    const userInfo = await this.userRepository.findOne({
      email: createUserInput.email,
      provider:
        createUserInput.provider === undefined
          ? 'SITE'
          : createUserInput.provider,
    });

    if (userInfo) throw new ConflictException('이미 등록된 이메일입니다!');

    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

    const saveInput = {
      ...createUserInput,
      password: hashedPassword,
    };

    return await this.userRepository.save(saveInput);
  }

  async update({ userId, updateUserInput }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const newUserInfo = {
      ...userInfo,
      ...updateUserInput,
    };

    if (updateUserInput.password) {
      const hashedPassword = await bcrypt.hash(updateUserInput.password, 10);
      newUserInfo.password = hashedPassword;
    }

    return await this.userRepository.save(newUserInfo);
  }

  async updateImage({ userId, profileImageUrl }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const newUserInfo = {
      ...userInfo,
      profileImageUrl: profileImageUrl,
    };

    return await this.userRepository.save(newUserInfo);
  }

  async delete({ userId }) {
    const result = await this.userRepository.softDelete({ id: userId });
    return result.affected ? true : false;
  }

  // async checkExist({ userId }) {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //   });
  //   if (!user) throw new UnprocessableEntityException('없는 회원입니다!');
  // }

  async checkAdmin({ userId }) {
    const admin = await this.userRepository.findOne({
      id: userId,
    });

    if (admin.isAdmin !== true)
      throw new UnprocessableEntityException('관리자가 아닙니다!');
  }

  async noAdmin({ userId }) {
    const admin = await this.userRepository.findOne({
      id: userId,
    });

    if (admin.isAdmin === true)
      throw new UnprocessableEntityException('관리자는 삭제할 수 없습니다!');
  }
}
