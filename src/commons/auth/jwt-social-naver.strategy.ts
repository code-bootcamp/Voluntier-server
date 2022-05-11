import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as NaverStrategy,
  Profile as NaverProfile,
} from 'passport-naver-v2';
import 'dotenv/config';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(NaverStrategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: NaverProfile,
    done: any,
  ) {
    console.log('NAVER:', profile);

    return {
      // 네이버에서 넘겨주지 않는 값은 default로 저장
      name: !profile.name ? 'default' : profile.name,
      email: !profile.email ? 'defaultEmail' : profile.email,
      phone: !profile.mobile ? '010-0000-0000' : profile.mobile,
      password: '1111',
      provider: 'NAVER',
    };
  }
}
