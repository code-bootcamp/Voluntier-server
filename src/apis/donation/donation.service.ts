import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { IamportService } from '../iamport/iamport.service';
import { User } from '../user/entities/user.entity';
import {
  Donation,
  POINT_TRANSACTION_STATUS_ENUM,
} from './entities/donation.entity';

// 후원 : 포인트 비율
const POINT_PERCENTAGE = 0.1;

@Injectable()
export class DonationService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly iamportService: IamportService,

    private readonly connection: Connection,
  ) {}
  async create({ impUid, amount, currentUser }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();

    //transaction 시작!
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const isValid = await this.iamportService.checkValidation({
        impUid,
        amount,
      });
      if (!isValid)
        throw new UnprocessableEntityException(
          '유효하지 않은 결제 정보입니다.',
        );

      const isDouble = await this.iamportService.checkDouble({ impUid });
      if (isDouble) throw new ConflictException('중복 결제건 입니다.');

      // 1. pointTransaction 테이블에 거래기록 1줄 생성
      const donation = await this.donationRepository.create({
        impUid: impUid,
        amount: amount,
        user: currentUser,
        status: POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(donation);

      // 2. 유저의 포인트 찾아오기
      const user = await queryRunner.manager.findOne(
        User,
        { id: currentUser.id },
        { lock: { mode: 'pessimistic_write' } },
      );

      // 3. 유저의 포인트, 총 후원금액 업데이트
      const updatedUser = this.userRepository.create({
        ...user,
        point: user.point + amount * POINT_PERCENTAGE,
        donationAmount: user.donationAmount + amount,
      });
      await queryRunner.manager.save(updatedUser);

      await queryRunner.commitTransaction();

      // 4. 최종결과 프론트엔드에 돌려주기
      return donation;
    } catch (error) {
      //롤백!
      await queryRunner.rollbackTransaction();
    } finally {
      //연결 해제
      await queryRunner.release();
    }
  }

  async findAll({ currentUser }) {
    // 여태까지 기부한 내역 불러오기
    const result = await this.donationRepository.find({
      user: { id: currentUser.id },
    });

    return result;
  }

  async totalDonations({ currentUser }) {
    const result = await this.userRepository.findOne({ id: currentUser.id });
    return result.donationAmount;
  }
}
