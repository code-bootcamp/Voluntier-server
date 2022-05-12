import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { CreatePurchaseInput } from './dto/createPurchase.input';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

@Resolver()
export class PurchaseResolver {
  constructor(
    private readonly purchaseService: PurchaseService, //
  ) {}
  // createPurchase
  @Mutation(() => Purchase)
  createPurchase(
    @Args('createPurchaseInput') createPurchaseInput: CreatePurchaseInput,
  ) {
    return this.purchaseService.create({ createPurchaseInput });
  }
  // cancelPurchase
  @Mutation(() => Purchase)
  cancelPurchase(@Args('purchaseId') purchaseId: string) {
    return this.purchaseService.cancel({ purchaseId });
  }
  // fetchPurchases
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Purchase])
  fetchPurchases(@CurrentUser() currentUser: ICurrentUser) {
    return this.purchaseService.findAll({ currentUser });
  }
}
