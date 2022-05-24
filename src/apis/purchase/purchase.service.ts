import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Purchase } from './entities/purchase.entity';

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

  async create({ createPurchaseInput }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    //transaction 시작!
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const { productId, userId, ...purchase } = createPurchaseInput;
      // 받아온 상품 정보 받아오기
      const itemInfo = await this.productRepository.findOne({
        id: productId,
      });
      // 결제되야할 금액 계산
      const usedPoint = itemInfo.price * purchase.itemCount;

      // 유저 포인트 확인
      const userInfo = await this.userRepository.findOne({
        id: userId,
      });
      const userPoint = userInfo.point;

      // 유저 포인트가 적을경우 에러
      if (usedPoint > userPoint) {
        throw new UnprocessableEntityException('잔여 포인트가 부족합니다.');
      }

      // 유저 포인트가 충분할 경우 유저 포인트 수정.
      const updatedUser = await this.userRepository.create({
        ...userInfo,
        point: userPoint - usedPoint,
      });
      await queryRunner.manager.save(updatedUser);

      // 결과 저장 후 리턴
      const result = await this.purchaseRepository.create({
        ...purchase,
        usedPoint,
        product: { id: productId },
        user: { id: userId },
        relations: ['product', 'user'],
      });
      await queryRunner.manager.save(result);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      //연결 해제
      await queryRunner.release();
    }
  }

  async findAll({ currentUser }) {
    return await this.purchaseRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product', 'user'],
      withDeleted: true,
    });
  }

  async cancel({ purchaseId }) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();

    // transaction 시작!!
    await queryRunner.startTransaction();
    try {
      // 결제 정보 가져오기
      const purchase = await this.purchaseRepository.findOne({
        where: { id: purchaseId },
        relations: ['product', 'user'],
        withDeleted: true,
      });

      // 이미 취소된 결제일경우 에러
      if (purchase.cancelledAt) {
        throw new UnprocessableEntityException('이미 취소된 결제입니다.');
      }

      // 포인트 사용 기록 삭제
      await queryRunner.manager.getRepository(Purchase).softDelete(purchaseId);

      // 포인트 돌려주기
      const user = await this.userRepository.findOne({
        id: purchase.user.id,
      });

      const updatedUser = await this.userRepository.create({
        ...user,
        point: user.point + purchase.usedPoint,
      });
      await queryRunner.manager.save(updatedUser);

      //취소된 거래 내역 프론트에 전달

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
