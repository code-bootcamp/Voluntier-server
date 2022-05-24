import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallpaper } from './entities/wallpaper.entity';

@Injectable()
export class WallpaperService {
  constructor(
    @InjectRepository(Wallpaper)
    private readonly wallpaperRepository: Repository<Wallpaper>, //
  ) {}

  async findOne({ wallpaperId }) {
    const result = await this.wallpaperRepository.findOne({
      where: { id: wallpaperId },
    });

    return result;
  }

  async findAll() {
    const result = await this.wallpaperRepository.find();

    return result;
  }

  async create({ title, imageUrl }) {
    const wallpaper = await this.wallpaperRepository.save({
      title: title,
      imageUrl: imageUrl,
    });

    return wallpaper;
  }

  async update({ wallpaperId, title, imageUrl }) {
    const prevWallpaper = await this.wallpaperRepository.findOne({
      where: { id: wallpaperId },
    });

    const newWallpaper = {
      ...prevWallpaper,
      title: title,
      imageUrl: imageUrl,
    };

    const wallpaper = await this.wallpaperRepository.save(newWallpaper);

    return wallpaper;
  }

  async delete({ wallpaperId }) {
    const result = await this.wallpaperRepository.softDelete({
      id: wallpaperId,
    });

    return result.affected ? true : false;
  }

  async checkExist({ wallpaperId }) {
    const wallpaper = await this.wallpaperRepository.findOne({
      id: wallpaperId,
    });
    if (!wallpaper)
      throw new UnprocessableEntityException('없는 게시글입니다.');
  }
}
