import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

/**
 * Product GraphQL API Resolver
 * @APIs `createProduct`, `deleteProduct`, `updateProduct`, `fetchProduct`, `fetchProducts`
 */
@Resolver()
export class ProductResolver {
  constructor(
    private readonly productService: ProductService, //
  ) {}

  /**
   * Create Product API
   * @type [`Mutation`]
   * @param createProductInput 생성할 상품의 정보
   * @returns 생성된 상품의 정보
   */
  @Mutation(() => Product)
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return await this.productService.create({ createProductInput });
  }

  /**
   * Delete Product API
   * @type [`Mutation`]
   * @param productId 상품의 ID
   * @returns 삭제에 성공한경우 `true`, 삭제되지 않은 경우 `false`
   */
  @Mutation(() => Boolean)
  async deleteProduct(@Args('productId') productId: string) {
    return await this.productService.delete({ productId });
  }

  /**
   * Update Product API
   * @type [`Mutation`]
   * @param productId 수정할 상품의 ID
   * @param updateProductInput 수정할 상품의 정보
   * @returns 수정된 상품의 정보
   */
  @Mutation(() => Product)
  async updateProduct(
    @Args('productId') productId: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return await this.productService.update({
      productId,
      updateProductInput,
    });
  }

  /**
   * Fetch Product API
   * @type [`Query`]
   * @param productId 정보를 가져오고 싶은 상품의 ID
   * @returns 상품의 정보
   */
  @Query(() => Product)
  async fetchProduct(
    @Args('productId') productId: string, //
  ) {
    return await this.productService.findOne({ productId });
  }

  /**
   * Fetch all Products API
   * @type [`Query`]
   * @returns 모든 상품의 정보
   */
  @Query(() => [Product])
  async fetchProducts() {
    return await this.productService.findAll();
  }

  /**
   * Fetch all Products API
   * @type [`Query`]
   * @param keyword 검색어
   * @returns 모든 상품의 정보
   */
  @Query(() => [Product])
  fetchProductsWithKeyword(
    @Args('keyword') keyword: string, //
  ) {
    return this.productService.findAllWithKeyword({ keyword });
  }
}
