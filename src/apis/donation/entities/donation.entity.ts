// 후원 내역 id
// 유저 id
// 후원금액
// 생성일자

import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 삭제일자
@Entity()
@ObjectType()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  userId: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;
}
