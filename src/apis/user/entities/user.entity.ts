import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  // @Field(() => String)
  password: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phone: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  profileImageUrl: string;

  @Column({ default: 0 })
  @Field(() => Int)
  donationAmount: number;

  @Column({ default: 0 })
  @Field(() => Int)
  point: number;

  @Column({ default: 0 })
  @Field(() => Int)
  serviceTime: number;

  @Column({ default: false })
  @Field(() => Boolean)
  isAdmin: boolean;

  @Column({ default: 'SITE' })
  @Field(() => String)
  provider: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
