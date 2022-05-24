import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../productImage/entities/productImage.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create({ createProductInput }) {
    console.log(createProductInput);
    // product에 입력받은 값들 할당
    const { ...product } = createProductInput;
    // product를 저장
    const savedproduct = await this.productRepository.save({
      ...product,
    });

    // 저장한 product id로 받아온 url으로 이미지 등록
    await Promise.all(
      product.imageUrls.map(async (el) => {
        return this.productImageRepository.save({
          product: { id: savedproduct.id },
          imageUrl: el,
        });
      }),
    );

    // 이미지도 등록
    const updatedProduct = await this.productRepository.findOne({
      where: { id: savedproduct.id },
      relations: ['productImage'],
    });

    return updatedProduct;
  }

  async delete({ productId }) {
    // 상품id를받아서 논리삭제 진행.
    const result = await this.productRepository.softDelete({
      id: productId,
    });
    // 삭제 성공시 true, 실패시 false
    return result.affected ? true : false;
  }

  async update({ productId, updateProductInput }) {
    const imageList = updateProductInput.imageUrls;
    const product = await this.productRepository.findOne({
      id: productId,
    });

    const dbImageList = await this.productImageRepository.find({
      where: { product: { id: productId } },
    });
    const dbImageList2 = dbImageList.map((el) => el.imageUrl);
    await Promise.all(
      dbImageList2.map((el) => {
        if (!imageList.includes(el)) {
          return this.productImageRepository.delete({
            product: { id: productId },
            imageUrl: el,
          });
        }
        return;
      }),
    );

    await Promise.all(
      imageList.map(async (el) => {
        const checker = await this.productImageRepository.find({
          where: { product: { id: productId }, imageUrl: el },
        });
        if (!checker.length) {
          return this.productImageRepository.save({
            product: { id: productId },
            imageUrl: el,
          });
        }
        return;
      }),
    );

    //변경사항 저장
    await this.productRepository.save({
      ...product,
      ...updateProductInput,
    });

    // 조인해서 리턴
    return this.productRepository.findOne({
      where: { id: productId },
      relations: ['productImage'],
    });
  }

  async findAll() {
    const result = await this.productRepository.find({
      relations: ['productImage'],
    });

    return result;
  }

  async findOne({ productId }) {
    return await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productImage'],
    });
  }
}
