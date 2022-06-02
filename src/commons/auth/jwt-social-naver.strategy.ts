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

  validate(accessToken: string, refreshToken: string, profile: NaverProfile) {
    return {
      name: !profile.name ? process.env.DEFAULT_NAME : profile.name,
      email: !profile.email ? process.env.DEFAULT_EMAIL : profile.email,
      phone: !profile.mobile ? process.env.DEFAULT_PHONE : profile.mobile,
      password: process.env.DEFAULT_PASSWORD,
      provider: 'NAVER',
    };
  }
}
