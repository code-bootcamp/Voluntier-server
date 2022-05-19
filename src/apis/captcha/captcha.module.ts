import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaptchaController } from './captcha.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([]), //
  ],
  providers: [],
  controllers: [
    CaptchaController, //
  ],
})
export class CaptchaModule {}
