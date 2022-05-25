import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from 'src/commons/auth/gql-user.param';
import { Repository } from 'typeorm';
import { Dibs } from './entity/dibs.entity';

@Injectable()
export class DibsService {
  constructor(
    @InjectRepository(Dibs)
    private readonly dibsRepository: Repository<Dibs>,
  ) {}

  async create({
    currentUser,
    productId,
  }: {
    currentUser: ICurrentUser;
    productId: string;
  }) {
    const exist = await this.dibsRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: currentUser.id },
      },
      relations: ['product', 'user'],
    });

    if (exist) {
      return exist;
    }

    return await this.dibsRepository.save({
      product: { id: productId },
      user: { id: currentUser.id },
      relations: ['product', 'user'],
    });
  }

  async delete({
    currentUser,
    productId,
  }: {
    currentUser: ICurrentUser;
    productId: string;
  }) {
    const result = await this.dibsRepository.delete({
      product: { id: productId },
      user: { id: currentUser.id },
    });
    return result.affected ? true : false;
  }

  async getLogInUserDibs({ currentUser }: { currentUser: ICurrentUser }) {
    return await this.dibsRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product', 'user'],
    });
  }
}
