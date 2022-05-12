import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    AuthModule, //
    BoardModule,
    DonationModule,
    EnrollModule,
    ImageModule,
    ProductModule,
    ProductImageModule,
    PurchaseModule,
    UserModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: 'process.env.FRONTEND_URL',
        credentials: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'my-database', // (1) Local: 'my-database' , (2) Cloud: 'database.voluntier.site'
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'mydocker02', // (1) Local: 'mydocker02' , (2) Cloud: 'voluntier'
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
