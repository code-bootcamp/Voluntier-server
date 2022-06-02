import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

/**
 * User GraphQL API Resolver
 * @APIs `fetchLoginUser`, `createUser`, `updateUser`, `updateUserImage`,
 * `deleteUser`, `sendThanksMailTest`, `resetPassword`
 */
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  /**
   * Fetch login User API
   * @type [`Query`]
   * @returns `User`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  async fetchLoginUser(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return await this.userService.findOne({ userId: currentUser.id });
  }

  /**
   * Create User API
   * @type [`Mutation`]
   * @param createUserInput input type of createUser
   * @returns `User`
   */
  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const { phone } = createUserInput;

    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData === undefined || !existData.isAuth) {
      throw new UnprocessableEntityException('인증되지 않은 번호입니다.');
    }

    await this.authService.updatePhoneToken({
      token: existData.token,
      phone: phone,
      isAuth: false,
    });
    return await this.userService.create({ createUserInput });
  }

  /**
   * Update User API
   * @type [`Mutation`]
   * @param updateUserInput input type of updateUser
   * @returns `User`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUser(
    @CurrentUser() currentUser: ICurrentUser, //
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    const userId = currentUser.id;

    return await this.userService.update({
      userId,
      updateUserInput,
    });
  }

  /**
   * Update User Image API
   * @type [`Mutation`]
   * @param profileImageUrl image url of profile
   * @returns `User`
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUserImage(
    @CurrentUser() currentUser: ICurrentUser, //
    @Args('profileImageUrl') profileImageUrl: string,
  ) {
    const userId = currentUser.id;

    return await this.userService.updateImage({
      userId,
      profileImageUrl,
    });
  }

  /**
   * Delete User API
   * @type [`Mutation`]
   * @param userId ID of User
   * @returns delete result(`true`, `false`)
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('userId') userId: string, //
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    const adminId = currentUser.id;
    await this.userService.checkAdmin({ userId: adminId });

    await this.userService.noAdmin({ userId: userId });

    return await this.userService.delete({ userId });
  }

  /**
   * Send Regular Mail API(using Crontab)
   * @type [`Mutation`]
   * @returns result string
   */
  @Mutation(() => String)
  @Cron('00 06 1 * *') // Execute every month 1st day 06:00
  async sendThanksMailTest() {
    return await this.userService.sendRegularEmail();
  }

  /**
   * Reset Password API
   * @type [`Mutation`]
   * @param phone phone of User(ex. `01011112222`)
   * @param email email of User(ex. `aaaaa@gmail.com`)
   * @param password password of User
   * @returns result string
   */
  @Mutation(() => String)
  async resetPassword(
    @Args('phone') phone: string, //
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData === undefined || !existData.isAuth) {
      throw new UnprocessableEntityException('인증되지 않은 번호입니다.');
    }

    const user = await this.userService.findOneByEmailPhone({
      email,
      provider: 'SITE',
      phone,
    });

    if (!user) {
      throw new UnprocessableEntityException('해당 유저 정보가 없습니다.');
    }

    await this.authService.updatePhoneToken({
      token: existData.token,
      phone: phone,
      isAuth: false,
    });
    return await this.userService.resetPassword({ userId: user.id, password });
  }
}
