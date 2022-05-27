import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Donation } from '../donation/entities/donation.entity';

/**
 * Iamport Service
 */
@Injectable()
export class IamportService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  /**
   * Check if payment is valid
   * @param impUid iamport ID
   * @param amount Amount of payment
   * @returns return(`true`, `false`)
   */
  async checkValidation({
    impUid,
    amount,
  }: {
    impUid: string;
    amount: number;
  }) {
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
  }

  /**
   * Check if payment is duplicated
   * @param impUid iamport ID
   * @returns return(`true`, `false`)
   */
  async checkDouble({ impUid }: { impUid: string }) {
    const isDouble = await this.donationRepository.findOne({
      impUid,
    });

    if (isDouble) {
      return true;
    }

    return false;
  }
}
