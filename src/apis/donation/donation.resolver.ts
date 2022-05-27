import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

/**
 * Donation GraphQL API Resolver
 * @APIs `createDonation`, `cancelDonation`, `fetchDonationAmount`, `fetchDonations`, `fetchAllUsersDonationsAmount`
 */
@Resolver()
export class DonationResolver {
  constructor(private readonly donationService: DonationService) {}

  /**
   * Create Donation API
   * @type [`Mutation`]
   * @param impUid 결제 완료후 iamport로 부터 받은 impUid
   * @param amount 결제한 금액
   * @param currentUser 현재 접속한 유저
   * @returns `Donation` 등록된 결제 정보
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Donation)
  async createDonation(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.donationService.create({
      impUid,
      amount,
      currentUser,
    });
  }

  /**
   * Cancel Donation API
   * @type [`Mutation`]
   * @param impUid 취소할 결제의 impUid
   * @param currentUser 현재 접속한 유저
   * @returns `Donation` 취소한 결제의 정보
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Donation)
  async cancelDonation(
    @Args('impUid') impUid: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.donationService.cancel({
      impUid,
      currentUser,
    });
  }

  /**
   * Fetch Donation Amount of User API
   * @type [`Query`]
   * @param currentUser 현재 접속한 유저
   * @returns 현재 접속한 유저의 기부 총액
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async fetchDonationAmount(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.donationService.totalDonations({ currentUser });
  }

  /**
   * Fetch Donations of User API
   * @type [`Query`]
   * @param currentUser 현재 접속한 유저
   * @returns `[Donation]` 현재 접속한 유저의 기부 내역 가져오기
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Donation])
  async fetchDonations(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.donationService.findAll({
      currentUser,
    });
  }

  /**
   * Fetch Donation Amount of all Users API
   * @type [`Query`]
   * @returns 모든 유저의 기부 총액
   */
  @Query(() => Int)
  async fetchAllUsersDonationsAmount() {
    return await this.donationService.AllUsersDonations();
  }
}
