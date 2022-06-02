import {
  Injectable,
  CACHE_MANAGER,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache, //
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const accessToken = req.headers.authorization.split(' ')[1];

    const accessExist = await this.cacheManager.get(
      `accessToken:${accessToken}`,
    );

    if (accessExist) {
      throw new UnauthorizedException('로그아웃 된 유저입니다!');
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
