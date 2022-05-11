import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationResolver } from './donation.resolver';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation])],
  providers: [DonationService, DonationResolver],
})
export class DonationModule {}
