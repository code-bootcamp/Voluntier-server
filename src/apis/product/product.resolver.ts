import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@Resolver()
export class ProductResolver {
  constructor(
    private readonly productService: ProductService, //
  ) {}

  /**
   *
   * @param createProductInput 생성할 상품의 정보
   * @returns 생성된 상품의 정보
   */
  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productService.create({ createProductInput });
  }

  /**
   *
   * @param productId 상품의 ID
   * @returns 삭제에 성공한경우 true, 삭제되지 않은 경우 false
   */
  @Mutation(() => Boolean)
  deleteProduct(@Args('productId') productId: string) {
    return this.productService.delete({ productId });
  }

  /**
   *
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
   *
   * @param productId 정보를 가져오고 싶은 상품의 ID
   * @returns 상품의 정보
   */
  @Query(() => Product)
  fetchProduct(@Args('productId') productId: string) {
    return this.productService.findOne({ productId });
  }

  /**
   *
   * @returns 모든 상품의 정보
   */
  @Query(() => [Product])
  fetchProducts() {
    return this.productService.findAll();
  }

  @Query(() => [Product])
  fetchProductsWithKeywrod(@Args('keyword') keyword: string) {
    return this.productService.findAllWithKeyword({ keyword });
  }
}
