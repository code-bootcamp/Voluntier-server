import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Donation } from '../donation/entities/donation.entity';

@Injectable()
export class IamportService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}
  async checkValidation({ impUid, amount }) {
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

    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${impUid}`,
      method: 'get',
      headers: { Authorization: access_token },
    });
    const paymentData = getPaymentData.data.response;
    if (!paymentData || paymentData.amount !== amount) {
      return false;
    }

    return true;

    // if (!paymentData || paymentData.amount !== amount) {
    //     throw new UnprocessableEntityException(
    //         '유효하지 않은 결제 정보입니다.',
    //     );
    // }
  }

  async checkDouble({ impUid }) {
    const isDouble = await this.donationRepository.findOne({
      impUid,
    });

    if (isDouble) {
      return true;
    }

    return false;
    // if (isDouble) {
    //     throw new ConflictException('중복 결제건입니다.');
    // }
  }
}