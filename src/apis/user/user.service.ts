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
import { Wallpaper } from '../wallpaper/entities/wallpaper.entity';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';

/**
 * User Service
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find one User
   * @param userId ID of User
   * @returns `User`
   */
  async findOne({ userId }: { userId: string }) {
    return await this.userRepository.findOne({
      id: userId,
    });
  }

  /**
   * Find one User by Email
   * @param email email of User(ex. `aaaaa@gmail.com`)
   * @param provider User Provider(`SITE, GOOGLE, NAVER, KAKAO`)
   * @returns `User`
   */
  async findOneByEmail({
    email,
    provider,
  }: {
    email: string;
    provider: string;
  }) {
    return await this.userRepository.findOne({
      email: email,
      provider: provider,
    });
  }

  /**
   * Find one User by Email and Phone
   * @param email email of User(ex. `aaaaa@gmail.com`)
   * @param provider User Provider(`SITE, GOOGLE, NAVER, KAKAO`)
   * @param phone phone of User(ex. `01011112222`)
   * @returns `User`
   */
  async findOneByEmailPhone({
    email,
    provider,
    phone,
  }: {
    email: string;
    provider: string;
    phone: string;
  }) {
    return await this.userRepository.findOne({
      email: email,
      provider: provider,
      phone: phone,
    });
  }

  /**
   * Create User
   * @param createUserInput input type of createUser
   * @returns `User`
   */
  async create({ createUserInput }: { createUserInput: CreateUserInput }) {
    const userInfo = await this.userRepository.findOne({
      email: createUserInput.email,
      provider:
        createUserInput.provider === undefined
          ? 'SITE'
          : createUserInput.provider,
    });

    if (userInfo) throw new ConflictException('이미 등록된 이메일입니다!');

    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

    const user: User = await this.userRepository.save({
      ...createUserInput,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Update User
   * @param userId ID of User
   * @param updateUserInput input type of updateUser
   * @returns `User`
   */
  async update({
    userId,
    updateUserInput,
  }: {
    userId: string;
    updateUserInput: UpdateUserInput;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const newUserInfo: User = {
      ...userInfo,
      ...updateUserInput,
    };

    if (updateUserInput.password) {
      const hashedPassword = await bcrypt.hash(updateUserInput.password, 10);
      newUserInfo.password = hashedPassword;
    }

    return await this.userRepository.save(newUserInfo);
  }

  /**
   * Update User Image
   * @param userId ID of User
   * @param profileImageUrl image url of profile
   * @returns `User`
   */
  async updateImage({
    userId,
    profileImageUrl,
  }: {
    userId: string;
    profileImageUrl: string;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const newUserInfo: User = {
      ...userInfo,
      profileImageUrl: profileImageUrl,
    };

    return await this.userRepository.save(newUserInfo);
  }

  /**
   * Delete User
   * @param userId ID of User
   * @returns delete result(`true`, `false`)
   */
  async delete({ userId }: { userId: string }) {
    const result = await this.userRepository.softDelete({ id: userId });
    return result.affected ? true : false;
  }

  /**
   * Check if User is admin
   * @param userId ID of User
   */
  async checkAdmin({ userId }: { userId: string }) {
    const admin = await this.userRepository.findOne({
      id: userId,
    });

    if (admin.isAdmin !== true)
      throw new UnprocessableEntityException('관리자가 아닙니다!');
  }

  /**
   * Check if User is not admin
   * @param userId ID of User
   */
  async noAdmin({ userId }: { userId: string }) {
    const admin = await this.userRepository.findOne({
      id: userId,
    });

    if (admin.isAdmin === true)
      throw new UnprocessableEntityException('관리자는 삭제할 수 없습니다!');
  }

  /**
   * Send Regular Mail
   * @returns send result(`SUCCESS`)
   */
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

    const wallpapers: Wallpaper[] = await getRepository(Wallpaper)
      .createQueryBuilder('wallpaper')
      .select('wallpaper.imageUrl AS imageUrl')
      .where(
        'MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) = MONTH(wallpaper.createdAt)',
      )
      .andWhere('wallpaper.imageUrl like :condition', { condition: `%mobile%` })
      .orderBy('wallpaper.createdAt', 'DESC')
      .limit(1)
      .getRawMany();

    await sendTemplateToEmail({ users, wallpapers });

    return 'SUCCESS!';
  }

  /**
   * Reset Password
   * @param userId ID of User
   * @param password password of User
   * @returns result string
   */
  async resetPassword({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: userId,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserInfo: User = {
      ...userInfo,
      password: hashedPassword,
    };

    await this.userRepository.save(newUserInfo);

    return '암호 변경 완료';
  }
}
