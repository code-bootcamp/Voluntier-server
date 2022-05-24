import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dibs } from './entity/dibs.entity';

@Injectable()
export class DibsService {
  constructor(
    @InjectRepository(Dibs)
    private readonly dibsRepository: Repository<Dibs>,
  ) {}

  async create({ currentUser, productId }) {
    console.log(currentUser);
    const exist = await this.dibsRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: currentUser.id },
      },
      relations: ['product', 'user'],
    });

    console.log(exist);

    if (exist) {
      return exist;
    }

    return await this.dibsRepository.save({
      product: { id: productId },
      user: { id: currentUser.id },
      relations: ['product', 'user'],
    });
  }

  async delete({ currentUser, productId }) {
    const result = await this.dibsRepository.delete({
      product: { id: productId },
      user: { id: currentUser.id },
    });
    return result.affected ? true : false;
  }

  async getLogInUserDibs({ currentUser }) {
    return await this.dibsRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product', 'user'],
    });
  }
}
