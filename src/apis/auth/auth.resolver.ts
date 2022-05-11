import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import {
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/commons/auth/gql-auth.guard';
import * as jwt from 'jsonwebtoken';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string, //
    @Context() context: any,
  ) {
    // 1. 로그인(이메일과 비밀번호가 일치하는 유저 찾기)
    const user = await this.userService.findOneByEmail({
      email,
      provider: 'SITE',
    });
    // 2. 일치하는 유저가 없으면? 에러
    if (!user)
      throw new UnprocessableEntityException('존재하지 않는 이메일입니다!');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnprocessableEntityException('암호가 틀렸습니다!');

    // 4. refreshToken(=JWT)을 만들어서 프론트엔드(쿠키)에 보내주기
    this.authService.setRefreshToken({ user, res: context.res });

    // 5. accessToken(=JWT) 만들어서 프론트엔드에 보내주기
    return this.authService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  logout(
    @Context() context: any, //
  ) {
    const accessToken = context.req.headers.authorization.split(' ')[1];
    const refreshToken = context.req.headers.cookie.replace(
      'refreshToken=',
      '',
    );

    try {
      const verifyAccess = jwt.verify(accessToken, 'myAccessKey');
      const verifyRefresh = jwt.verify(refreshToken, 'myRefreshKey');
    } catch (error) {
      throw new UnauthorizedException('검증되지 않은 토큰입니다!');
    }

    return '로그아웃에 성공했습니다!';
  }

  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return this.authService.getAccessToken({ user: currentUser });
  }
}
