import { Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ProductImageResolver {
  // createProductImage
  // updateProductImage
  // deleteProductImage
  // fetchProductImage
  // fetchProductImages
  @Mutation(() => String)
  createProductImage() {
    return 'createProductImage';
  }

  @Mutation(() => String)
  updateProductImage() {
    return 'updateProductImage';
  }

  @Mutation(() => String)
  deleteProductImage() {
    return 'deleteProductImage';
  }

  @Query(() => String)
  fetchProductImage() {
    return 'fetchProductImage';
  }

  @Query(() => String)
  fetchProductImages() {
    return 'fetchProductImages';
  }
}
