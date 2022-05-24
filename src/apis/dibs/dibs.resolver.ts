import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { DibsService } from './dibs.service';
import { Dibs } from './entity/dibs.entity';

@Resolver()
export class DibsResolver {
  constructor(private readonly dibsService: DibsService) {}

  //createDibs
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

  //deleteDibs
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

  // fetchLogInUserDibs
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Dibs])
  fetchLogInUserDibs(@CurrentUser() currentUser: ICurrentUser) {
    return this.dibsService.getLogInUserDibs({ currentUser });
  }
}
