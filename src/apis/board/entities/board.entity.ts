import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BoardImage } from 'src/apis/boardImage/entities/boardImage.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  contents: string;

  @Column()
  @Field(() => String)
  centerName: string;

  @Column()
  @Field(() => String)
  centerOwnerName: string;

  @Column()
  @Field(() => String)
  centerPhone: string;

  @Column()
  @Field(() => Int)
  recruitCount: number;

  @Column()
  @Field(() => Int)
  serviceTime: number;

  @Column()
  @Field(() => Date)
  serviceDate: Date;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  addressDetail: string;

  @Column()
  @Field(() => String)
  location1: string;

  @Column()
  @Field(() => String)
  location2: string;

  @OneToMany(() => BoardImage, (boardImage) => boardImage.board)
  @Field(() => [BoardImage], { nullable: true })
  boardImage: BoardImage[];

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
