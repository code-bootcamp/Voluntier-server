import {
  Injectable,
  // CACHE_MANAGER,
  // Inject,
  // UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
// import { Cache } from 'cache-manager';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    // @Inject(CACHE_MANAGER)
    // private readonly cacheManager: Cache, //
    super({
      jwtFromRequest: (req) => req.headers.cookie.replace('refreshToken=', ''),
      secretOrKey: process.env.JWT_REFRESH_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    // const refreshToken = req.headers.cookie.replace('refreshToken=', '');

    console.log('payload:', payload);

    // const refreshExist = await this.cacheManager.get(
    //   `refreshToken:${refreshToken}`,
    // );

    // if (refreshExist) {
    //   throw new UnauthorizedException('로그아웃 된 유저입니다!');
    // }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
