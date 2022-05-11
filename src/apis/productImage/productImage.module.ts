import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/productImage.entity';
import { ProductImageResolver } from './productImage.resolver';
import { ProductImageService } from './productImage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductImage, //
    ]),
  ],
  providers: [ProductImageResolver, ProductImageService],
})
export class ProductImageModule {}
