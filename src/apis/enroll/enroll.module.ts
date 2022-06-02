import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../board/entities/board.entity';
import { User } from '../user/entities/user.entity';
import { EnrollResolver } from './enroll.resolver';
import { EnrollService } from './enroll.service';
import { Enroll } from './entities/enroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Enroll, User])],
  providers: [
    EnrollResolver,
    EnrollService, //
  ],
})
export class EnrollModule {}
