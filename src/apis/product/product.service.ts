import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create({ createProductInput }) {
    // product에 입력받은 값들 할당
    const { ...product } = createProductInput;

    // product를 저장
    return await this.productRepository.save({
      ...product,
    });
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
    const product = await this.productRepository.findOne({
      id: productId,
    });

    const newProduct = {
      ...product,
      ...updateProductInput,
    };
    return await this.productRepository.save(newProduct);
  }

  async findAll() {
    return await this.productRepository.find({});
  }

  async findOne({ productId }) {
    return await this.productRepository.findOne({
      id: productId,
    });
  }
}
