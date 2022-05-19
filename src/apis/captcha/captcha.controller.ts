import { Controller, Get, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as request from 'request';
import * as fs from 'fs';

@Controller()
export class CaptchaController {
  constructor(private readonly configService: ConfigService) {}

  client_id = process.env.NAVER_CLIENT_ID;
  client_secret = process.env.NAVER_CLIENT_SECRET;

  @Get('/captcha/nKey')
  async getCaptchaKey(
    @Req() req: Request, //
    @Res() res: Response,
  ) {
    const code = '0';
    const api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code;

    const options = {
      url: api_url,
      headers: {
        'X-Naver-Client-Id': this.client_id,
        'X-Naver-Client-Secret': this.client_secret,
      },
    };

    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const key = JSON.parse(body).key;
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(key);
      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
      }
    });
  }

  @Get('/captcha/image')
  async getCaptchaImage(
    @Req() req: Request, //
    @Res() res: Response,
  ) {
    const api_url =
      'https://openapi.naver.com/v1/captcha/ncaptcha.bin?key=' + req.query.key;

    const options = {
      url: api_url,
      headers: {
        'X-Naver-Client-Id': this.client_id,
        'X-Naver-Client-Secret': this.client_secret,
      },
    };

    const writeStream = fs.createWriteStream('./captcha.jpg');
    const _req = request.get(options).on('response', function (response) {
      console.log(response.statusCode); // 200
      console.log(response.headers['content-type']);
    });

    _req.pipe(writeStream); // file로 출력
    _req.pipe(res); // 브라우저로 출력
  }

  @Get('/captcha/result')
  async getCaptchaResult(
    @Req() req: Request, //
    @Res() res: Response,
  ) {
    const code = '1';
    const api_url =
      'https://openapi.naver.com/v1/captcha/nkey?code=' +
      code +
      '&key=' +
      req.query.key +
      '&value=' +
      req.query.value;

    const options = {
      url: api_url,
      headers: {
        'X-Naver-Client-Id': this.client_id,
        'X-Naver-Client-Secret': this.client_secret,
      },
    };

    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const result = JSON.parse(body).result;
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });

        if (result) {
          res.end('SUCCESS');
        } else {
          res.end('FAIL');
        }
      } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
        // 403: Invalid Key
        // 400: Unissued Image
        // 500: System Error
      }
    });
  }
}
