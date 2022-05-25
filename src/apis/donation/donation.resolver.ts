import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Resolver()
export class DonationResolver {
  constructor(private readonly donationService: DonationService) {}

  /**
   *
   * @param impUid 결제 완료후 iamport로 부터 받은 impUid
   * @param amount 결제한 금액
   * @param currentUser 현재 접속한 유저
   * @returns 등록된 결제 정보
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Donation)
  createDonation(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.donationService.create({
      impUid,
      amount,
      currentUser,
    });
  }

  /**
   *
   * @param impUid 취소할 결제의 impUid
   * @param currentUser 현재 접속한 유저
   * @returns 취소한 결제의 정보
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Donation)
  async cancelDonation(
    @Args('impUid') impUid: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.donationService.cancel({
      impUid,
      currentUser,
    });
  }

  /**
   *
   * @param currentUser 현재 접속한 유저
   * @returns 현재 접속한 유저의 기부 총액
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  fetchDonationAmount(@CurrentUser() currentUser: ICurrentUser) {
    return this.donationService.totalDonations({ currentUser });
  }

  /**
   *
   * @param currentUser 현재 접속한 유저
   * @returns 현재 접속한 유저의 기부 내역 가져오기
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Donation])
  fetchDonations(@CurrentUser() currentUser: ICurrentUser) {
    return this.donationService.findAll({
      currentUser,
    });
  }

  /**
   *
   * @returns 모든 유저의 기부 총액
   */
  @Query(() => Int)
  fetchAllUsersDonationsAmount() {
    return this.donationService.AllUsersDonations();
  }
}
