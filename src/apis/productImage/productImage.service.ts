import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductImageInput } from './dto/createProductImage.input';
import { UpdateProductImageInput } from './dto/updateProductImage.input';
import { ProductImage } from './entities/productImage.entity';

/**
 * Product Image Service
 */
@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  /**
   * Find all Product Images
   * @param productId ID of Product
   * @returns `[ProductImage]`
   */
  async findAll({ productId }: { productId: string }) {
    return await this.productImageRepository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  /**
   * Find one Product Image
   * @param productId ID of Product
   * @returns `ProductImage`
   */
  async findOne({ productId }: { productId: string }) {
    return await this.productImageRepository.findOne({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  /**
   * Update Product Images
   * @param updateProductImageInput 이미지를 수정할 상품의 ID와 url
   * @returns `[ProductImage]`
   */
  async update({
    updateProductImageInput,
  }: {
    updateProductImageInput: UpdateProductImageInput;
  }) {
    const { productId, ...imageList } = updateProductImageInput;
    const dbImageList = await this.productImageRepository.find({
      where: { product: { id: productId } },
    });

    const dbImageList2 = dbImageList.map((el) => el.imageUrl);

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

    await Promise.all(
      imageList.imageUrl.map(async (el) => {
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

    return await this.productImageRepository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  /**
   * Delete Product Image
   * @param productImageId 삭제할 이미지의 ID
   * @returns delete result(`true`, `false`)
   */
  async delete({ productImageId }: { productImageId: string }) {
    const result = await this.productImageRepository.softDelete({
      id: productImageId,
    });
    return result.affected ? true : false;
  }

  /**
   * Create Product Image
   * @param createProductImageInput 이미지를 등록할 상품의 ID와 url
   * @returns `ProductImage`
   */
  async create({
    createProductImageInput,
  }: {
    createProductImageInput: CreateProductImageInput;
  }) {
    const { productId, ...productImage } = createProductImageInput;
    const result: ProductImage = await this.productImageRepository.save({
      ...productImage,
      product: { id: productId },
      relations: ['product'],
    });
    return result;
  }
}
