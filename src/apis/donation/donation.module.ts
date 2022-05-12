import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamportService } from '../iamport/iamport.service';
import { User } from '../user/entities/user.entity';
import { DonationResolver } from './donation.resolver';
import { DonationService } from './donation.service';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, User])],
  providers: [DonationService, DonationResolver, IamportService],
})
export class DonationModule {}
