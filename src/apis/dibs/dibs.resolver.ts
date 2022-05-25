import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { DibsService } from './dibs.service';
import { Dibs } from './entity/dibs.entity';

@Resolver()
export class DibsResolver {
  constructor(private readonly dibsService: DibsService) {}

  /**
   *
   * @param currentUser 현재 접속한 유저
   * @param productId 찜목록에 추가할 상품 ID
   * @returns 찜목록에 추가된 상품
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Dibs)
  createDibs(
    @CurrentUser() currentUser: ICurrentUser,
    @Args('productId') productId: string,
  ) {
    return this.dibsService.create({
      currentUser,
      productId,
    });
  }

  /**
   *
   * @param currentUser 현재 접속한 유저
   * @param productId 삭제할 찜한 상품의 ID
   * @returns 삭제 성공시 true, 실패시 false 반환
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteDibs(
    @CurrentUser() currentUser: ICurrentUser,
    @Args('productId') productId: string,
  ) {
    return this.dibsService.delete({
      currentUser,
      productId,
    });
  }

  /**
   *
   * @param currentUser 현재 로그인한 유저
   * @returns 현재 로그인한 유저의 찜 목록
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Dibs])
  fetchLogInUserDibs(@CurrentUser() currentUser: ICurrentUser) {
    return this.dibsService.getLogInUserDibs({ currentUser });
  }
}
