import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneToken } from '../phoneToken/entities/phoneToken.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    @InjectRepository(PhoneToken)
    private readonly phoneTokenRepository: Repository<PhoneToken>,
  ) {}

  setRefreshToken({ user, req, res }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id }, //
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '3m' },
    );

    // 개발환경
    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/;`);

    // 배포환경
    const allowedOrigins = process.env.FRONTEND_URLS.split(',');
    const origin = req.headers.origin;

    if (allowedOrigins.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=${process.env.BACKEND_DOMAIN}; SameSite=None; Secure; httpOnly;`,
    );
  }

  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.id }, //
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '1m' },
    );
  }

  async fetchPhoneToken({ phone }) {
    const phoneToken = await this.phoneTokenRepository.findOne({
      phone: phone,
    });

    return phoneToken;
  }

  async createPhoneToken({ token, phone }) {
    await this.phoneTokenRepository.save({
      token: token,
      phone: phone,
      isAuth: false,
    });
  }

  async updatePhoneToken({ token, phone, isAuth }) {
    const phoneToken = await this.phoneTokenRepository.findOne({
      phone: phone,
    });

    const newPhoneToken = {
      ...phoneToken,
      token: token,
      isAuth: isAuth,
    };

    await this.phoneTokenRepository.save(newPhoneToken);
  }
}
