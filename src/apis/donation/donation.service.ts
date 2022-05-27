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
import { ICurrentUser } from 'src/commons/auth/gql-user.param';

const POINT_PERCENTAGE = 0.1;

/**
 * Donation Service
 */
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

  /**
   * Create Donation
   * @param impUid 결제 완료후 iamport로 부터 받은 impUid
   * @param amount 결제한 금액
   * @param currentUser 현재 접속한 유저
   * @returns `Donation`
   */
  async create({
    impUid,
    amount,
    currentUser,
  }: {
    impUid: string;
    amount: number;
    currentUser: ICurrentUser;
  }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('READ COMMITTED');

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

      const donation = this.donationRepository.create({
        impUid: impUid,
        amount: amount,
        user: currentUser,
        status: POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(donation);

      const user = await queryRunner.manager.findOne(
        User,
        { id: currentUser.id },
        { lock: { mode: 'pessimistic_write' } },
      );

      const updatedUser = this.userRepository.create({
        ...user,
        point: user.point + amount * POINT_PERCENTAGE,
        donationAmount: user.donationAmount + amount,
      });
      await queryRunner.manager.save(updatedUser);

      await queryRunner.commitTransaction();

      return donation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cancel Donation
   * @param impUid 결제 완료후 iamport로 부터 받은 impUid
   * @param currentUser 현재 접속한 유저
   * @returns `Donation`
   */
  async cancel({
    impUid,
    currentUser,
  }: {
    impUid: string;
    currentUser: ICurrentUser;
  }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const donation = await queryRunner.manager.findOne(
        Donation,
        { impUid: impUid },
        { lock: { mode: 'pessimistic_write' } },
      );

      if (donation.cancelledAt)
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');

      const userInfo = await queryRunner.manager.findOne(
        User,
        { id: currentUser.id },
        { lock: { mode: 'pessimistic_write' } },
      );

      if (userInfo.point < donation.amount * POINT_PERCENTAGE)
        throw new UnprocessableEntityException('환불할 포인트가 부족합니다.');

      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: process.env.IMPORT_API_KEY,
          imp_secret: process.env.IMPORT_API_SECRET,
        },
      });
      const { access_token } = getToken.data.response;

      const getCancelData = await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token,
        },
        data: {
          reason: 'Cancel',
          imp_uid: impUid,
          amount: donation.amount,
        },
      });
      const { response } = getCancelData.data;
      if (!response) {
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');
      }

      const updatedDonation = this.donationRepository.create({
        ...donation,
        cancelledAt: new Date(),
      });
      await queryRunner.manager.save(updatedDonation);

      const newDonation = this.donationRepository.create({
        impUid: impUid,
        amount: response.cancel_amount * -1,
        user: currentUser,
        status: POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(newDonation);

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

  /**
   * Find Donations of User
   * @param currentUser 현재 접속한 유저
   * @returns `[Donation]`
   */
  async findAll({ currentUser }: { currentUser: ICurrentUser }) {
    const result = await this.donationRepository.find({
      user: { id: currentUser.id },
    });

    return result;
  }

  /**
   * Find Donation Amount of User
   * @param currentUser 현재 접속한 유저
   * @returns Amount of Donations
   */
  async totalDonations({ currentUser }: { currentUser: ICurrentUser }) {
    const result = await this.userRepository.findOne({ id: currentUser.id });
    return result.donationAmount;
  }

  /**
   * Find Donation Amount of all Users
   * @returns Amount of Donations of all Users
   */
  async AllUsersDonations() {
    const result = await this.userRepository.find();
    let sum = 0;
    for (let i = 0; i < result.length; i++) {
      sum += result[i].donationAmount;
    }
    return sum;
  }
}
