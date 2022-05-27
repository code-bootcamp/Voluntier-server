import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { DibsResolver } from './dibs.resolver';
import { DibsService } from './dibs.service';
import { Dibs } from './entity/dibs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dibs, User, Product])],
  providers: [
    DibsResolver, //
    DibsService,
  ],
})
export class DibsModule {}
