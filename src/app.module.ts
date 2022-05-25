import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './apis/auth/auth.module';
import { BoardModule } from './apis/board/board.module';
import { DonationModule } from './apis/donation/donation.module';
import { EnrollModule } from './apis/enroll/enroll.module';
import { ImageModule } from './apis/image/image.module';
import { ProductModule } from './apis/product/product.module';
import { ProductImageModule } from './apis/productImage/productImage.module';
import { PurchaseModule } from './apis/purchase/purchase.module';
import { UserModule } from './apis/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { CaptchaModule } from './apis/captcha/captcha.module';
import { ChatHistoryModule } from './apis/chatHistory/chatHistory.module';
import { ChatModule } from './gateways/chat/chat.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DibsModule } from './apis/dibs/dibs.module';
import { WallpaperModule } from './apis/wallpaper/wallpaper.module';

@Module({
  imports: [
    AuthModule, //
    BoardModule,
    CaptchaModule,
    ChatHistoryModule,
    ChatModule,
    DibsModule,
    DonationModule,
    EnrollModule,
    ImageModule,
    ProductModule,
    ProductImageModule,
    PurchaseModule,
    UserModule,
    WallpaperModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: process.env.FRONTEND_URLS.split(','),
        Credential: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: 'root',
      password: 'root',
      database: process.env.DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      timezone: '-09:00', // 한국 기준
      synchronize: true,
      logging: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
