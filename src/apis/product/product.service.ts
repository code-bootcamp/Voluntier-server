import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from 'src/commons/auth/gql-user.param';
import { Like, Repository } from 'typeorm';
import { ProductImage } from '../productImage/entities/productImage.entity';
import { User } from '../user/entities/user.entity';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';

/**
 * Product Service
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create Product
   * @param createProductInput 생성할 상품의 정보
   * @returns `Product` 생성된 상품의 정보
   */
  async create({
    createProductInput,
    currentUser,
  }: {
    createProductInput: CreateProductInput;
    currentUser: ICurrentUser;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: currentUser.id,
    });

    if (!userInfo.isAdmin)
      throw new UnprocessableEntityException(
        '운영자가 아니면 상품작성을 할 수 없습니다.',
      );

    const { ...product } = createProductInput;

    const savedProduct = await this.productRepository.save({
      ...product,
    });

    await Promise.all(
      product.imageUrls.map(async (el) => {
        return this.productImageRepository.save({
          product: { id: savedProduct.id },
          imageUrl: el,
        });
      }),
    );

    const updatedProduct = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['productImage'],
    });

    return updatedProduct;
  }

  /**
   * Delete Product
   * @param productId 삭제할 상품의 ID
   * @returns delete result(`true`, `false`)
   */
  async delete({
    productId,
    currentUser,
  }: {
    productId: string;
    currentUser: ICurrentUser;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: currentUser.id,
    });

    if (!userInfo.isAdmin)
      throw new UnprocessableEntityException(
        '운영자가 아니면 상품 삭제를 할 수 없습니다.',
      );
    // 상품id를받아서 논리삭제 진행.
    const result = await this.productRepository.softDelete({
      id: productId,
    });
    // 삭제 성공시 true, 실패시 false
    return result.affected ? true : false;
  }

  /**
   * Update Product
   * @param productId 수정할 상품의 ID
   * @param updateProductInput 수정할 상품의 정보
   * @returns 수정된 상품의 정보
   */
  async update({
    productId,
    updateProductInput,
    currentUser,
  }: {
    productId: string;
    updateProductInput: UpdateProductInput;
    currentUser: ICurrentUser;
  }) {
    const userInfo = await this.userRepository.findOne({
      id: currentUser.id,
    });

    if (!userInfo.isAdmin)
      throw new UnprocessableEntityException(
        '운영자가 아니면 상품 수정을 할 수 없습니다.',
      );

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

    await this.productRepository.save({
      ...product,
      ...updateProductInput,
    });

    return this.productRepository.findOne({
      where: { id: productId },
      relations: ['productImage'],
    });
  }

  /**
   * Find all Products
   * @returns 모든 상품의 정보
   */
  async findAll() {
    const result = await this.productRepository.find({
      relations: ['productImage'],
    });

    return result;
  }

  /**
   * Find all Products with Keyword
   * @param keyword 검색어
   * @returns 모든 상품의 정보
   */
  async findAllWithKeyword({ keyword }: { keyword: string }) {
    const result = await this.productRepository.find({
      relations: ['productImage'],
      where: {
        name: Like(`%${keyword}%`),
      },
    });
    return result;
  }

  /**
   * Find one Product
   * @param productId 정보를 가져오고 싶은 상품의 ID
   * @returns 상품의 정보
   */
  async findOne({ productId }: { productId: string }) {
    return await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productImage'],
    });
  }
}
