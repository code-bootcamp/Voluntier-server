import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchaseResolver } from './purchase.resolver';
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase, //
      User,
      Product,
    ]),
  ],
  providers: [PurchaseResolver, PurchaseService],
})
export class PurchaseModule {}
