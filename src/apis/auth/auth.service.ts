import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { ICurrentUser } from 'src/commons/auth/gql-user.param';
import { Repository } from 'typeorm';
import { PhoneToken } from '../phoneToken/entities/phoneToken.entity';
import { User } from '../user/entities/user.entity';

/**
 * Authorization Service
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    @InjectRepository(PhoneToken)
    private readonly phoneTokenRepository: Repository<PhoneToken>,
  ) {}

  /**
   * Set Refresh Token
   * @param user User Info
   * @param req Request
   * @param res Response
   */
  setRefreshToken({
    user,
    req,
    res,
  }: {
    user: User;
    req: Request;
    res: Response;
  }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id }, //
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '1w' },
    );

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

  /**
   * Return Access Token
   * @param user User Info
   * @returns Access Token
   */
  getAccessToken({ user }: { user: ICurrentUser }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.id }, //
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '2h' },
    );
  }

  /**
   * Search Phone Token Info
   * @param phone User Phone(ex. `01011112222`)
   * @returns Phone Token Info
   */
  async fetchPhoneToken({ phone }: { phone: string }) {
    const phoneToken = await this.phoneTokenRepository.findOne({
      phone: phone,
    });

    return phoneToken;
  }

  /**
   * Create Phone Token
   * @param token Token(ex. `123456`)
   * @param phone User Phone(ex. `01011112222`)
   */
  async createPhoneToken({ token, phone }) {
    await this.phoneTokenRepository.save({
      token: token,
      phone: phone,
      isAuth: false,
    });
  }

  /**
   * Update Phone Token Authorization Status
   * @param token Token(ex. `123456`)
   * @param phone User Phone(ex. `01011112222`)
   * @param isAuth Authorization Status(`true, false`)
   */
  async updatePhoneToken({
    token,
    phone,
    isAuth,
  }: {
    token: string;
    phone: string;
    isAuth: boolean;
  }) {
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
