import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { sendTemplateToEmail } from 'src/commons/libraries/email';
import { Donation } from '../donation/entities/donation.entity';

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

  async findOneByEmailPhone({ email, provider, phone }) {
    return await this.userRepository.findOne({
      email: email,
      provider: provider,
      phone: phone,
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

  async sendRegularEmail() {
    // 지난달 후원한 사람 및 후원액 조회하는 쿼리
    const users = await getRepository(Donation)
      .createQueryBuilder('donation')
      .innerJoin('donation.user', 'user')
      .select('user.id AS userId, user.name AS name, user.email AS email')
      .addSelect('MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) as lastMonth')
      .addSelect(
        'YEAR(CURRENT_DATE()) as year, MONTH(CURRENT_DATE()) as month, DAY(CURRENT_DATE()) as day',
      )
      .addSelect('SUM(donation.amount) AS amount')
      .where('donation.status = :status', { status: 'PAYMENT' })
      .andWhere(
        'MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) = MONTH(donation.createdAt)',
      )
      .andWhere('donation.cancelledAt is null')
      .groupBy('user.id')
      .getRawMany();

    await sendTemplateToEmail({ users });

    return 'SUCCESS!';
  }

  async resetPassword({ userId, password }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo = {
      ...userInfo,
      password: hashedPassword,
    };

    return await this.userRepository.save(newUserInfo);
  }
}
