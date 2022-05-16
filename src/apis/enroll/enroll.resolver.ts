import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { EnrollService } from './enroll.service';
import { Enroll } from './entities/enroll.entity';

@Resolver()
export class EnrollResolver {
  constructor(
    private readonly enrollService: EnrollService, //
  ) {}

  @Query(() => [Enroll])
  async fetchEnrollsByBoardId(
    @Args('boardId') boardId: string, //
  ) {
    return await this.enrollService.findAllByBoardId({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Enroll])
  async fetchEnrollsByUserId(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.enrollService.findAllByUserId({ userId: currentUser.id });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Enroll)
  async createEnroll(
    @Args('boardId') boardId: string, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.enrollService.create({ boardId, userId: currentUser.id });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Enroll)
  async updateEnroll(
    @Args('boardId') boardId: string, //
    @Args('enrollId') enrollId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    await this.enrollService.checkExistBoard({ boardId });
    await this.enrollService.checkExist({ enrollId });

    return await this.enrollService.update({
      boardId,
      enrollId,
      userId: currentUser.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteEnroll(
    @Args('boardId') boardId: string, //
    @Args('enrollId') enrollId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    await this.enrollService.checkExistBoard({ boardId });
    await this.enrollService.checkExist({ enrollId });

    return await this.enrollService.delete({
      boardId,
      enrollId,
      userId: currentUser.id,
    });
  }
}
