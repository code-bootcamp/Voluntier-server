import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Resolver()
export class DonationResolver {
  constructor(private readonly donationService: DonationService) {}

  // createDonation
  @Mutation(() => String)
  createDonation() {
    return 'createDonation';
  }

  // fetchDonationAmount
  @Query(() => String)
  fetchDonationAmount() {
    return '1234';
  }

  // fetchDonations
  @Query(() => String)
  fetchDonations() {
    return '1234';
  }
}
