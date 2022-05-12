import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Purchase {
  // 구매내역 ID
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  //유저 id
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  //상품 id
  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  //수령인
  @Column()
  @Field(() => String)
  recieverName: string;

  //수령인 전화번호
  @Column()
  @Field(() => String)
  recieverPhone: string;

  //배송주소
  @Column()
  @Field(() => String)
  address: string;

  //배송 상세주소
  @Column()
  @Field(() => String)
  addressDetail: string;

  //송장번호
  @Column({ default: null })
  @Field(() => String)
  invoiceNo: string;

  //상품 갯수
  @Column()
  @Field(() => Int)
  itemCount: number;

  //사용 포인트
  @Column()
  @Field(() => Int)
  usedPoint: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  cancelledAt: Date;
}
