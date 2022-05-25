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

  /**
   *
   * @param createPurchaseInput 구매내역에 들어갈 정보들
   * @returns 구매내역에 저장된 정보
   */
  @Mutation(() => Purchase)
  createPurchase(
    @Args('createPurchaseInput') createPurchaseInput: CreatePurchaseInput,
  ) {
    return this.purchaseService.create({ createPurchaseInput });
  }

  /**
   *
   * @param purchaseId 구매취소할 구매내역의 ID
   * @returns 취소된 구매내역의 정보
   */
  @Mutation(() => Purchase)
  cancelPurchase(@Args('purchaseId') purchaseId: string) {
    return this.purchaseService.cancel({ purchaseId });
  }

  /**
   *
   * @param currentUser 현재 접속한 유저의 정보
   * @returns 현재 접속한 유저의 모든 구매내역
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Purchase])
  fetchPurchases(@CurrentUser() currentUser: ICurrentUser) {
    return this.purchaseService.findAll({ currentUser });
  }
}
