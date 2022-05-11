import { Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class PurchaseResolver {
  // createPurchase
  @Mutation(() => String)
  createPurchase() {
    return 'createPurchase';
  }
  // cancelPurchase
  @Mutation(() => String)
  cancelPurchase() {
    return 'cancelPurchase';
  }
  // fetchPurchases
  @Query(() => String)
  fetchPurchase() {
    return 'fetchPurchase';
  }
}
