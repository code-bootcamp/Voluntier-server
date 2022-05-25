import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

/**
 * Interface of Authorized User
 * @type `name`, `email`, `phone`, `password`, `provider` of `User`
 */
interface IOAuthUser {
  user: Pick<User, 'name' | 'email' | 'phone' | 'password' | 'provider'>;
}

/**
 * Social Login REST API Controller
 * @APIs `loginGoogle`, `loginNaver`, `loginKakao`
 */
@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  /**
   * Google Social Login REST API
   * @type [`GET`]
   * @endPoint `/login/google`
   */
  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  /**
   * Naver Social Login REST API
   * @type [`GET`]
   * @endPoint `/login/naver`
   */
  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  /**
   * Kakao Social Login REST API
   * @type [`GET`]
   * @endPoint `/login/kakao`
   */
  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  /**
   * Set Refresh Token
   * @param req
   * @param res
   */
  async checkUserAndRefreshToken({
    req,
    res,
  }: {
    req: Request & IOAuthUser;
    res: Response;
  }) {
    // Check User Info
    let user = await this.userService.findOneByEmail({
      email: req.user.email,
      provider: req.user.provider,
    });

    // Create User Info
    if (!user) {
      const createUserInput = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone.replace(/[^0-9]/g, ''),
        password: req.user.password,
        provider: req.user.provider,
      };

      user = await this.userService.create({ createUserInput });
    }

    // Login
    this.authService.setRefreshToken({ user, req, res });

    res.redirect(process.env.SOCIAL_REDIRECT_URL);
  }
}
