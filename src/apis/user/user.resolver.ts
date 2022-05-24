import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Cron } from '@nestjs/schedule';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CurrentUser } from 'src/commons/auth/gql-user.param';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  async fetchLoginUser(
    @CurrentUser() currentUser: any, //
  ) {
    return await this.userService.findOne({ userId: currentUser.id });
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const { phone } = createUserInput;

    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData !== undefined && existData.isAuth) {
      await this.authService.updatePhoneToken({
        token: existData.token,
        phone: phone,
        isAuth: false,
      });
      return await this.userService.create({ createUserInput });
    } else {
      throw new UnprocessableEntityException('인증되지 않은 번호입니다.');
    }
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUser(
    @CurrentUser() currentUser: any, //
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    const userId = currentUser.id;

    return await this.userService.update({
      userId,
      updateUserInput,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUserImage(
    @CurrentUser() currentUser: any, //
    @Args('profileImageUrl') profileImageUrl: string,
  ) {
    const userId = currentUser.id;

    return await this.userService.updateImage({
      userId,
      profileImageUrl,
    });
  }

  // 관리자만
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args('userId') userId: string, //
    @CurrentUser() currentUser: any,
  ) {
    // 관리자인지 체크
    const adminId = currentUser.id;
    await this.userService.checkAdmin({ userId: adminId });

    // 관리자를 삭제하는지 체크
    await this.userService.noAdmin({ userId: userId });

    // 삭제
    return await this.userService.delete({ userId });
  }

  @Mutation(() => String)
  // @Cron('* * * * *') // 매분 실행
  // @Cron('00 06 1 * *') // 매월 1일 06:00에 실행
  async sendThanksMailTest() {
    return await this.userService.sendRegularEmail();
  }

  @Mutation(() => String)
  async resetPassword(
    @Args('phone') phone: string, //
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData !== undefined && existData.isAuth) {
      const user = await this.userService.findOneByEmailPhone({
        email,
        provider: 'SITE',
        phone,
      });

      if (user) {
        await this.authService.updatePhoneToken({
          token: existData.token,
          phone: phone,
          isAuth: false,
        });
        await this.userService.resetPassword({ userId: user.id, password });
      } else {
        throw new UnprocessableEntityException('해당 유저 정보가 없습니다.');
      }
    } else {
      throw new UnprocessableEntityException('인증되지 않은 번호입니다.');
    }
  }
}
