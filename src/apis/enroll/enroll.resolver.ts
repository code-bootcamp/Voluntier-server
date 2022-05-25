import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { EnrollService } from './enroll.service';
import { Enroll } from './entities/enroll.entity';

/**
 * Enroll GraphQL API Resolver
 * @APIs `fetchEnrollsByBoardId`, `fetchEnrollsByUserId`, `createEnroll`, `updateEnroll`, `deleteEnroll`
 */
@Resolver()
export class EnrollResolver {
  constructor(
    private readonly enrollService: EnrollService, //
  ) {}

  /**
   * Fetch All Enrolls of Board API
   * @type [`Query`]
   * @param boardId ID of Board
   * @returns `[Enroll]`
   */
  @Query(() => [Enroll])
  async fetchEnrollsByBoardId(
    @Args('boardId') boardId: string, //
  ) {
    return await this.enrollService.findAllByBoardId({ boardId });
  }

  /**
   * Fetch All Enrolls of login user API
   * @type [`Query`]
   * @returns `[Enroll]`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Enroll])
  async fetchEnrollsByUserId(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.enrollService.findAllByUserId({ userId: currentUser.id });
  }

  /**
   * Create Enroll API
   * @type [`Mutation`]
   * @param boardId ID of Board
   * @returns `Enroll`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Enroll)
  async createEnroll(
    @Args('boardId') boardId: string, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.enrollService.create({ boardId, userId: currentUser.id });
  }

  /**
   * Update Enroll API
   * @type [`Mutation`]
   * @param boardId ID of Board
   * @param enrollId ID of Enroll
   * @returns `Enroll`
   */
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

  /**
   * Delete Enroll API
   * @type [`Mutation`]
   * @param boardId ID of Board
   * @param enrollId ID of Enroll
   * @returns delete result(`true`, `false`)
   */
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
