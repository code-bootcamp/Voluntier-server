import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/apis/board/entities/board.entity';
import { User } from 'src/apis/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column('text')
  @Field(() => String)
  message: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => Board)
  @Field(() => Board)
  board: Board;
}
