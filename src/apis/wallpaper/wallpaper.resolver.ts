import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Wallpaper } from './entities/wallpaper.entity';
import { WallpaperService } from './wallpaper.service';

@Resolver()
export class WallpaperResolver {
  constructor(
    private readonly wallpaperService: WallpaperService, //
  ) {}

  @Query(() => Wallpaper)
  async fetchWallpaper(
    @Args('wallpaperId') wallpaperId: string, //
  ) {
    await this.wallpaperService.checkExist({ wallpaperId });

    return await this.wallpaperService.findOne({ wallpaperId });
  }

  @Query(() => [Wallpaper])
  async fetchWallpapers() {
    return await this.wallpaperService.findAll();
  }

  @Mutation(() => Wallpaper)
  async createWallpaper(
    @Args('title') title: string, //
    @Args('imageUrl') imageUrl: string,
  ) {
    return await this.wallpaperService.create({
      title,
      imageUrl,
    });
  }

  @Mutation(() => Wallpaper)
  async updateWallpaper(
    @Args('wallpaperId') wallpaperId: string, //
    @Args('title') title: string, //
    @Args('imageUrl') imageUrl: string,
  ) {
    await this.wallpaperService.checkExist({ wallpaperId });

    return await this.wallpaperService.update({
      wallpaperId,
      title,
      imageUrl,
    });
  }

  @Mutation(() => Boolean)
  async deleteWallpaper(
    @Args('wallpaperId') wallpaperId: string, //
  ) {
    await this.wallpaperService.checkExist({ wallpaperId });

    return await this.wallpaperService.delete({
      wallpaperId,
    });
  }
}
