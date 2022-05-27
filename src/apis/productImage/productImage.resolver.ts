import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductImageInput } from './dto/createProductImage.input';
import { UpdateProductImageInput } from './dto/updateProductImage.input';
import { ProductImage } from './entities/productImage.entity';
import { ProductImageService } from './productImage.service';

/**
 * Product Image GraphQL API Resolver
 * @APIs `createProductImage`, `updateProductImage`, `deleteProductImage`, `fetchProductImage`, `fetchProductImages`
 */
@Resolver()
export class ProductImageResolver {
  constructor(private readonly productImageService: ProductImageService) {}

  /**
   * Create Product Image API
   * @type [`Mutation`]
   * @param createProductImageInput 이미지를 등록할 상품의 ID와 url
   * @returns 상품에 등록한 이미지의 정보
   */
  @Mutation(() => ProductImage)
  async createProductImage(
    @Args('createProductImageInput')
    createProductImageInput: CreateProductImageInput,
  ) {
    return this.productImageService.create({ createProductImageInput });
  }

  /**
   * Update Product Images API
   * @type [`Mutation`]
   * @param updateProductImageInput 이미지를 수정할 상품의 ID와 url
   * @returns 수정한 상품 이미지들의 정보
   */
  @Mutation(() => [ProductImage])
  async updateProductImage(
    @Args('updateProductImageInput')
    updateProductImageInput: UpdateProductImageInput,
  ) {
    return await this.productImageService.update({
      updateProductImageInput,
    });
  }

  /**
   * Delete Product Image API
   * @type [`Mutation`]
   * @param productImageId 삭제할 이미지의 ID
   * @returns 삭제한 경우 `true`, 아닌경우 `false`
   */
  @Mutation(() => Boolean)
  async deleteProductImage(
    @Args('productImageId') productImageId: string, //
  ) {
    return await this.productImageService.delete({ productImageId });
  }

  /**
   * Fetch Product Image
   * @type [`Query`]
   * @param productId 등록된 이미지 한개를 불러올 상품의 ID
   * @returns 등록된 이미지 한개
   */
  @Query(() => ProductImage)
  async fetchProductImage(
    @Args('productId') productId: string, //
  ) {
    return await this.productImageService.findOne({ productId });
  }

  /**
   * Fetch Product Images
   * @type [`Query`]
   * @param productId 등록된 이미지 목록을 불러올 상품의 ID
   * @returns 등록된 이미지 목록
   */
  @Query(() => [ProductImage])
  async fetchProductImages(@Args('productId') productId: string) {
    return await this.productImageService.findAll({ productId });
  }
}
