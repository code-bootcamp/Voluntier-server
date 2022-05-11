import { Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ProductResolver {
  // createProduct
  // deleteProduct
  // fetchProduct
  // fetchProducts
  // updateProduct
  @Mutation(() => String)
  createProduct() {
    return 'createProduct';
  }

  @Mutation(() => String)
  deleteProduct() {
    return 'deleteProduct';
  }

  @Mutation(() => String)
  updateProduct() {
    return 'updateProduct';
  }

  @Query(() => String)
  fetchProduct() {
    return 'fetchProduct';
  }

  @Query(() => [String])
  fetchProducts() {
    return ['fetchProduct'];
  }
}
