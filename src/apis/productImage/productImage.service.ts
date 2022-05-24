import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/productImage.entity';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}
  async findAll({ productId }) {
    return await this.productImageRepository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  async findOne({ productId }) {
    return await this.productImageRepository.findOne({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  async update({ updateProductImageInput }) {
    // 1. 상품 ID에 해당하는 모든 이미지 데이터를 찾아옵니다.
    // 2. 이미 테이블에 있는 이미지면 유지합니다.
    // 3. 기존에 없는 이미지면서 클라이언트가 보내준 이미지면 데이터를 새로 생성합니다.
    // 4. 해당 안되는 기존 이미지는 제거합니다.
    const { productId, ...imageList } = updateProductImageInput;
    const dbImageList = await this.productImageRepository.find({
      where: { product: { id: productId } },
    });

    const dbImageList2 = dbImageList.map((el) => el.imageUrl);

    // 새로 추가된 이미지가 아닐경우 삭제.
    await Promise.all(
      dbImageList2.map((el) => {
        if (!imageList.imageUrl.includes(el)) {
          return this.productImageRepository.softDelete({
            product: { id: productId },
            imageUrl: el,
          });
        }
        return;
      }),
    );

    // db에 저장되지 않은 이미지일 경우 db에 저장
    await Promise.all(
      imageList.imageUrl.map(async (el) => {
        const checker = await this.productImageRepository.find({
          where: { product: { id: productId }, imageUrl: el },
        });
        console.log(checker.length, 'this is checker');
        if (!checker.length) {
          return this.productImageRepository.save({
            product: { id: productId },
            imageUrl: el,
          });
        }
        return;
      }),
    );

    // 현재 저장되어있는 이미url리스트 리턴
    return await this.productImageRepository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  async delete({ productImageId }) {
    const result = await this.productImageRepository.softDelete({
      id: productImageId,
    });
    return result.affected ? true : false;
  }

  async create({ createProductImageInput }) {
    const { productId, ...productImage } = createProductImageInput;
    return await this.productImageRepository.save({
      ...productImage,
      product: { id: productId },
      relations: ['product'],
    });
  }
}
