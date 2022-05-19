import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

interface IOAuthUser {
  user: Pick<User, 'name' | 'email' | 'phone' | 'password'>;
}

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.checkUserAndRefreshToken({ req, res });
  }

  async checkUserAndRefreshToken({ req, res }) {
    // 1. 가입확인
    let user = await this.userService.findOneByEmail({
      email: req.user.email,
      provider: req.user.provider,
    });

    // 2. 회원가입
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

    // 3. 로그인
    this.authService.setRefreshToken({ user, req, res });

    res.redirect(process.env.SOCIAL_REDIRECT_URL);
  }
}
