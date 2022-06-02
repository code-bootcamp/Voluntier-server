import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAccessStrategy } from 'src/commons/auth/jwt-access.strategy';
import { AuthService } from '../auth/auth.service';
import { Donation } from '../donation/entities/donation.entity';
import { PhoneToken } from '../phoneToken/entities/phoneToken.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([User, PhoneToken, Donation]),
  ],
  providers: [
    JwtAccessStrategy,
    UserResolver,
    UserService, //
    AuthService,
  ],
})
export class UserModule {}
