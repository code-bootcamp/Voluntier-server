import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseResolver } from './purchase.resolver';
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase, //
    ]),
  ],
  providers: [PurchaseResolver, PurchaseService],
})
export class PurchaseModule {}
