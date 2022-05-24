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
import axios from 'axios';

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
    console.log(impUid, amount, currentUser);
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

  async cancel({ impUid, currentUser }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    //transaction 시작!
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const donation = await queryRunner.manager.findOne(
        Donation,
        { impUid: impUid },
        { lock: { mode: 'pessimistic_write' } },
      );

      //만약 cancelledAt 데이터가 null이 아니라면 이미 취소된 결제, 에러 반환
      if (donation.cancelledAt)
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');

      const userInfo = await queryRunner.manager.findOne(
        User,
        { id: currentUser.id },
        { lock: { mode: 'pessimistic_write' } },
      );
      console.log(userInfo);

      // 현재 보유한 포인트 확인. 모자랄경우 에러 반환
      if (userInfo.point < donation.amount * POINT_PERCENTAGE)
        throw new UnprocessableEntityException('환불할 포인트가 부족합니다.');

      // 인증토큰 받아오기
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IMPORT_API_KEY, // REST API키
          imp_secret: process.env.IMPORT_API_SECRET, // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증토큰
      console.log(access_token);

      const getCancelData = await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          reasos: '테스트', // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid: impUid, // imp_uid를 환불 `unique key`로 입력
          amount: donation.amount, // 가맹점 클라이언트로부터 받은 환불금액
        },
      });
      const { response } = getCancelData.data;
      if (!response) {
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');
      }

      // 기존에 있는 데이터 취소 날짜 적어주기
      const updatedDonation = this.donationRepository.create({
        ...donation,
        cancelledAt: new Date(),
      });
      await queryRunner.manager.save(updatedDonation);

      // 새로운 포인트 결제 데이터 추가해주기
      const newDonation = this.donationRepository.create({
        impUid: impUid,
        amount: response.cancel_amount * -1,
        user: currentUser,
        status: POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(newDonation);

      //유저의 기부 총액 줄이기
      const newUser = this.userRepository.create({
        ...userInfo,
        donationAmount: userInfo.donationAmount - donation.amount,
        point: userInfo.point - donation.amount * POINT_PERCENTAGE,
      });
      await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      return newDonation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
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

  async AllUsersDonations() {
    const result = await this.userRepository.find();
    let sum = 0;
    for (let i = 0; i < result.length; i++) {
      sum += result[i].donationAmount;
    }
    return sum;
  }
}
