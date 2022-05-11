import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductImageInput } from './dto/createProductImage.input';
import { UpdateProductImageInput } from './dto/updateProductImage.input';
import { ProductImage } from './entities/productImage.entity';
import { ProductImageService } from './productImage.service';

@Resolver()
export class ProductImageResolver {
  constructor(private readonly productImageService: ProductImageService) {}

  @Mutation(() => ProductImage)
  createProductImage(
    @Args('createProductImageInput')
    createProductImageInput: CreateProductImageInput,
  ) {
    return this.productImageService.create({ createProductImageInput });
  }

  @Mutation(() => [ProductImage])
  async updateProductImage(
    @Args('updateProductImageInput')
    updateProductImageInput: UpdateProductImageInput,
  ) {
    return await this.productImageService.update({
      updateProductImageInput,
    });
  }

  @Mutation(() => ProductImage)
  deleteProductImage(@Args('productImageId') productImageId: string) {
    return this.productImageService.delete({ productImageId });
  }

  @Query(() => ProductImage)
  fetchProductImage(@Args('productId') productId: string) {
    return this.productImageService.findOne({ productId });
  }

  @Query(() => [ProductImage])
  fetchProductImages(@Args('productId') productId: string) {
    return this.productImageService.findAll({ productId });
  }
}
