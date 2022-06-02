import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { Wallpaper } from './entities/wallpaper.entity';

/**
 * Wallpaper Service
 */
@Injectable()
export class WallpaperService {
  constructor(
    @InjectRepository(Wallpaper)
    private readonly wallpaperRepository: Repository<Wallpaper>, //
  ) {}

  /**
   * Find one Wallpaper
   * @param wallpaperId ID of Wallpaper
   * @returns `Wallpaper`
   */
  async findOne({ wallpaperId }: { wallpaperId: string }) {
    const result = await this.wallpaperRepository.findOne({
      where: { id: wallpaperId },
    });

    return result;
  }

  /**
   * Find All Wallpapers
   * @returns `[Wallpaper]`
   */
  async findAll() {
    const result = await this.wallpaperRepository.find();

    return result;
  }

  /**
   * Find Last Wallpaper
   * @returns `Wallpaper`
   */
  async findLastOne() {
    const result = await getRepository(Wallpaper)
      .createQueryBuilder('wallpaper')
      .where('wallpaper.imageUrl not like :condition', {
        condition: `%mobile%`,
      })
      .orderBy('wallpaper.createdAt', 'DESC')
      .limit(1)
      .getOne();

    return result;
  }

  /**
   * Create Wallpaper
   * @param title title of Wallpaper
   * @param imageUrl image url of Wallpaper
   * @returns `Wallpaper`
   */
  async create({ title, imageUrl }: { title: string; imageUrl: string }) {
    const wallpaper: Wallpaper = await this.wallpaperRepository.save({
      title: title,
      imageUrl: imageUrl,
    });

    return wallpaper;
  }

  /**
   * Update Wallpaper
   * @param wallpaperId ID of Wallpaper
   * @param title title of Wallpaper
   * @param imageUrl image url of Wallpaper
   * @returns `Wallpaper`
   */
  async update({
    wallpaperId,
    title,
    imageUrl,
  }: {
    wallpaperId: string;
    title: string;
    imageUrl: string;
  }) {
    const prevWallpaper = await this.wallpaperRepository.findOne({
      where: { id: wallpaperId },
    });

    const newWallpaper: Wallpaper = {
      ...prevWallpaper,
      title: title,
      imageUrl: imageUrl,
    };

    const wallpaper = await this.wallpaperRepository.save(newWallpaper);

    return wallpaper;
  }

  /**
   * Delete Wallpaper
   * @param wallpaperId ID of Wallpaper
   * @returns delete result(`true`, `false`)
   */
  async delete({ wallpaperId }: { wallpaperId: string }) {
    const result = await this.wallpaperRepository.softDelete({
      id: wallpaperId,
    });

    return result.affected ? true : false;
  }

  /**
   * Check if Wallpaper exists
   * @param wallpaperId ID of Wallpaper
   */
  async checkExist({ wallpaperId }: { wallpaperId: string }) {
    const wallpaper = await this.wallpaperRepository.findOne({
      id: wallpaperId,
    });
    if (!wallpaper)
      throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
