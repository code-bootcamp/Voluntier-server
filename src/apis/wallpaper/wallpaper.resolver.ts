import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Wallpaper } from './entities/wallpaper.entity';
import { WallpaperService } from './wallpaper.service';

/**
 * Wallpaper GraphQL API Resolver
 * @APIs `fetchWallpaper`, `fetchWallpapers`, `createWallpaper`, `updateWallpaper`, `deleteWallpaper`
 */
@Resolver()
export class WallpaperResolver {
  constructor(
    private readonly wallpaperService: WallpaperService, //
  ) {}

  /**
   * Fetch certain Wallpaper API
   * @type [`Query`]
   * @param wallpaperId ID of Wallpaper
   * @returns `Wallpaper`
   */
  @Query(() => Wallpaper)
  async fetchWallpaper(
    @Args('wallpaperId') wallpaperId: string, //
  ) {
    await this.wallpaperService.checkExist({ wallpaperId });

    return await this.wallpaperService.findOne({ wallpaperId });
  }

  /**
   * Fetch All Wallpapers API
   * @type [`Query`]
   * @returns `[Wallpaper]`
   */
  @Query(() => [Wallpaper])
  async fetchWallpapers() {
    return await this.wallpaperService.findAll();
  }

  /**
   * Fetch Last Wallpaper API
   * @type [`Query`]
   * @returns `Wallpaper`
   */
  @Query(() => Wallpaper)
  async fetchLastWallpaper() {
    return await this.wallpaperService.findLastOne();
  }

  /**
   * Create Wallpaper API
   * @type [`Mutation`]
   * @param title title of Wallpaper
   * @param imageUrl image url of Wallpaper
   * @returns `Wallpaper`
   */
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

  /**
   * Update Wallpaper API
   * @type [`Mutation`]
   * @param wallpaperId ID of Wallpaper
   * @param title title of Wallpaper
   * @param imageUrl image url of Wallpaper
   * @returns `Wallpaper`
   */
  @Mutation(() => Wallpaper)
  async updateWallpaper(
    @Args('wallpaperId') wallpaperId: string, //
    @Args('title') title: string,
    @Args('imageUrl') imageUrl: string,
  ) {
    await this.wallpaperService.checkExist({ wallpaperId });

    return await this.wallpaperService.update({
      wallpaperId,
      title,
      imageUrl,
    });
  }

  /**
   * Delete Wallpaper API
   * @type [`Mutation`]
   * @param wallpaperId ID of Wallpaper
   * @returns delete result(`true`, `false`)
   */
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
