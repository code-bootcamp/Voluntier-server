import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from 'src/commons/auth/gql-user.param';
import { Connection, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { CreatePurchaseInput } from './dto/createPurchase.input';
import { Purchase } from './entities/purchase.entity';

/**
 * Purchase Service
 */
@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly connection: Connection,
  ) {}

  /**
   * Create Purchase
   * @param createPurchaseInput 구매내역에 들어갈 정보들
   * @returns `Purchase`
   */
  async create({
    createPurchaseInput,
  }: {
    createPurchaseInput: CreatePurchaseInput;
  }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const { productId, userId, ...purchase } = createPurchaseInput;

      const itemInfo = await this.productRepository.findOne({
        id: productId,
      });

      const usedPoint = itemInfo.price * purchase.itemCount;

      const userInfo = await this.userRepository.findOne({
        id: userId,
      });
      const userPoint = userInfo.point;

      if (usedPoint > userPoint) {
        throw new UnprocessableEntityException('잔여 포인트가 부족합니다.');
      }

      const updatedUser = this.userRepository.create({
        ...userInfo,
        point: userPoint - usedPoint,
      });
      await queryRunner.manager.save(updatedUser);

      const result = this.purchaseRepository.create({
        ...purchase,
        usedPoint,
        product: { id: productId },
        user: { id: userId },
      });
      await queryRunner.manager.save(result);
      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all Purchases of User
   * @param currentUser 현재 접속한 유저의 정보
   * @returns `[Purchase]`
   */
  async findAll({ currentUser }: { currentUser: ICurrentUser }) {
    return await this.purchaseRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product', 'user'],
      withDeleted: true,
    });
  }

  /**
   * Cancel Purchase
   * @param purchaseId 구매취소할 구매내역의 ID
   * @returns `Purchase`
   */
  async cancel({ purchaseId }: { purchaseId: string }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const purchase = await this.purchaseRepository.findOne({
        where: { id: purchaseId },
        relations: ['product', 'user'],
        withDeleted: true,
      });

      if (purchase.cancelledAt) {
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');
      }

      await queryRunner.manager.getRepository(Purchase).softDelete(purchaseId);

      const user = await this.userRepository.findOne({
        id: purchase.user.id,
      });

      const updatedUser = this.userRepository.create({
        ...user,
        point: user.point + purchase.usedPoint,
      });
      await queryRunner.manager.save(updatedUser);

      const cancelledPurchase = await this.purchaseRepository.findOne({
        where: { id: purchaseId },
        relations: ['product', 'user'],
      });

      await queryRunner.commitTransaction();

      return cancelledPurchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
