import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductImage } from './entities/productImage.entity';
import { ProductImageResolver } from './productImage.resolver';
import { ProductImageService } from './productImage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductImage, //
      Product,
    ]),
  ],
  providers: [ProductImageResolver, ProductImageService],
})
export class ProductImageModule {}
