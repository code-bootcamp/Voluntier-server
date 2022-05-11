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

  validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    console.log('KAKAO:', profile);

    return {
      // 카카오에서 넘겨주지 않는 값은 default로 저장
      name: !profile.displayName ? 'default' : profile.displayName,
      email: !profile._json.kakao_account.email
        ? 'defaultEmail'
        : profile._json.kakao_account.email,
      phone: !profile.mobile ? '010-0000-0000' : profile.mobile,
      password: '1111',
      provider: 'KAKAO',
    };
  }
}
