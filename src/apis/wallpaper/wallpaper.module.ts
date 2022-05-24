import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallpaper } from './entities/wallpaper.entity';
import { WallpaperResolver } from './wallpaper.resolver';
import { WallpaperService } from './wallpaper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallpaper])],
  providers: [
    WallpaperResolver, //
    WallpaperService,
  ],
})
export class WallpaperModule {}
