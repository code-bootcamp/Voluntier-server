import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Resolver()
export class DonationResolver {
  constructor(private readonly donationService: DonationService) {}

  // createDonation
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

  // fetchDonationAmount
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  fetchDonationAmount(@CurrentUser() currentUser: ICurrentUser) {
    return this.donationService.totalDonations({ currentUser });
  }

  // fetchDonations
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Donation])
  fetchDonations(@CurrentUser() currentUser: ICurrentUser) {
    return this.donationService.findAll({
      currentUser,
    });
  }

  // fetchAllUsersDonationsAmount
  @Query(() => Int)
  fetchAllUsersDonationsAmount() {
    return this.donationService.AllUsersDonations();
  }
}
