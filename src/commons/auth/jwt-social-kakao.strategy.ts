import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import 'dotenv/config';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(KakaoStrategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      name: !profile.displayName
        ? process.env.DEFAULT_NAME
        : profile.displayName,
      email: !profile._json.kakao_account.email
        ? process.env.DEFAULT_EMAIL
        : profile._json.kakao_account.email,
      phone: !profile.mobile ? process.env.DEFAULT_PHONE : profile.mobile,
      password: process.env.DEFAULT_PASSWORD,
      provider: 'KAKAO',
    };
  }
}
