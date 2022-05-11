import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollResolver } from './enroll.resolver';
import { EnrollService } from './enroll.service';
import { Enroll } from './entities/enroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enroll])],
  providers: [
    EnrollResolver,
    EnrollService, //
  ],
})
export class EnrollModule {}
