import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser, ICurrentUser } from 'src/commons/auth/gql-user.param';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import {
  CACHE_MANAGER,
  Inject,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/commons/auth/gql-auth.guard';
import {
  checkValidationPhone,
  getToken,
  sendTokenToSMS,
} from 'src/commons/libraries/phone';
import { Cache } from 'cache-manager';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

/**
 * Authorization GraphQL API Resolver
 * @APIs `login`, `logout`, `restoreAccessToken`, `sendPhoneAuthToken`, `checkPhoneAuthToken`
 */
@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Login API
   * @type [`Mutation`]
   * @param email User Email(ex. `aaaaa@gmail.com`)
   * @param password User Password
   * @returns Access Token
   */
  @Mutation(() => String)
  async login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context,
  ) {
    const user = await this.userService.findOneByEmail({
      email,
      provider: 'SITE',
    });

    if (!user) {
      throw new UnprocessableEntityException('존재하지 않는 이메일입니다!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnprocessableEntityException('암호가 틀렸습니다!');
    }

    this.authService.setRefreshToken({
      user,
      req: context.req,
      res: context.res,
    });

    return this.authService.getAccessToken({ user });
  }

  /**
   * Logout API
   * @type [`Mutation`]
   * @returns result string
   */
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async logout(
    @Context() context, //
  ) {
    try {
      const accessToken = context.req.headers.authorization.split(' ')[1];
      const refreshToken = context.req.headers.cookie.replace(
        'refreshToken=',
        '',
      );

      const verifyAccess = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
      const verifyRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY,
      );

      await this.cacheManager.set(`accessToken:${accessToken}`, 'accessToken', {
        ttl: verifyAccess['exp'] - verifyAccess['iat'],
      });

      await this.cacheManager.set(
        `refreshToken:${refreshToken}`,
        'refreshToken',
        {
          ttl: verifyRefresh['exp'] - verifyRefresh['iat'],
        },
      );
    } catch (error) {
      throw new UnauthorizedException('검증되지 않은 토큰입니다!');
    }

    return '로그아웃에 성공했습니다.';
  }

  /**
   * Restore Access Token API
   * @type [`Mutation`]
   * @returns Access Token
   */
  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return this.authService.getAccessToken({ user: currentUser });
  }

  /**
   * Send Phone Token API
   * @type [`Mutation`]
   * @param phone User Phone(ex. `01011112222`)
   * @returns send result
   */
  @Mutation(() => String)
  async sendPhoneAuthToken(
    @Args('phone') phone: string, //
  ) {
    const isValid = checkValidationPhone(phone);

    if (!isValid) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 올바르지 않습니다.',
      );
    }

    const token = getToken();

    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData === undefined) {
      await this.authService.createPhoneToken({ token, phone });
    } else {
      const isAuth = false;
      await this.authService.updatePhoneToken({ token, phone, isAuth });
    }

    await sendTokenToSMS(phone, token);
    return '인증번호 SMS 전송했습니다.';
  }

  /**
   * Check Phone Token API
   * @type [`Mutation`]
   * @param phone User Phone(ex. `01011112222`)
   * @param token Token(ex. `123456`)
   * @returns result string
   */
  @Mutation(() => String)
  async checkPhoneAuthToken(
    @Args('phone') phone: string, //
    @Args('token') token: string,
  ) {
    const isValid = checkValidationPhone(phone);

    if (!isValid) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 올바르지 않습니다.',
      );
    }

    const existData = await this.authService.fetchPhoneToken({ phone });

    if (existData === undefined) {
      throw new UnprocessableEntityException(
        '인증번호가 발급되지 않은 번호입니다.',
      );
    }

    if (existData.token !== token) {
      throw new UnprocessableEntityException('인증번호가 일치하지 않습니다.');
    }

    const isAuth = true;
    await this.authService.updatePhoneToken({ token, phone, isAuth });
    return '인증번호 인증 완료되었습니다.';
  }
}
