import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { CreatePurchaseInput } from './dto/createPurchase.input';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

/**
 * Purchase GraphQL API Resolver
 * @APIs `createPurchase`, `cancelPurchase`, `fetchPurchases`
 */
@Resolver()
export class PurchaseResolver {
  constructor(
    private readonly purchaseService: PurchaseService, //
  ) {}

  /**
   * Create Purchase API
   * @type [`Mutation`]
   * @param createPurchaseInput 구매내역에 들어갈 정보들
   * @returns `Purchase` 구매내역에 저장된 정보
   */
  @Mutation(() => Purchase)
  async createPurchase(
    @Args('createPurchaseInput') createPurchaseInput: CreatePurchaseInput,
  ) {
    return await this.purchaseService.create({ createPurchaseInput });
  }

  /**
   * Cancel Purchase API
   * @type [`Mutation`]
   * @param purchaseId 구매취소할 구매내역의 ID
   * @returns `Purchase` 취소된 구매내역의 정보
   */
  @Mutation(() => Purchase)
  async cancelPurchase(
    @Args('purchaseId') purchaseId: string, //
  ) {
    return await this.purchaseService.cancel({ purchaseId });
  }

  /**
   * Fetch all Purchases of User
   * @type [`Query`]
   * @param currentUser 현재 접속한 유저의 정보
   * @returns `[Purchase]` 현재 접속한 유저의 모든 구매내역
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Purchase])
  async fetchPurchases(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.purchaseService.findAll({ currentUser });
  }
}
