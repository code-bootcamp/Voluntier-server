import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './commons/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(graphqlUploadExpress());
  app.enableCors({
    origin: process.env.FRONTEND_URLS.split(','),
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
