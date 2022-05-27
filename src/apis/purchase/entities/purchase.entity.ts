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
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column()
  @Field(() => String)
  receiverName: string;

  @Column()
  @Field(() => String)
  receiverPhone: string;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  addressDetail: string;

  @Column({ default: null })
  @Field(() => String)
  invoiceNo: string;

  @Column()
  @Field(() => Int)
  itemCount: number;

  @Column()
  @Field(() => Int)
  usedPoint: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  cancelledAt: Date;
}
