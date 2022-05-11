import { Module } from '@nestjs/common';
import { ImageResolver } from './image.resolver';
import { ImageService } from './image.service';

@Module({
  providers: [ImageResolver, ImageService],
})
export class ImageModule {}
