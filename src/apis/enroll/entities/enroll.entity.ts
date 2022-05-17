import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Board } from 'src/apis/board/entities/board.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ENROLL_STATUS_ENUM {
  ENROLL = 'ENROLL',
  COMPLETE = 'COMPLETE',
}
registerEnumType(ENROLL_STATUS_ENUM, {
  name: 'ENROLL_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Enroll {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @ManyToOne(() => Board)
  @Field(() => Board)
  board: Board;

  @Column({ type: 'enum', enum: ENROLL_STATUS_ENUM })
  @Field(() => ENROLL_STATUS_ENUM)
  status: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;
}
