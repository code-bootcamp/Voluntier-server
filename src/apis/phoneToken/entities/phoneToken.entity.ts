import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PhoneToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  phone: string;

  @Column({ default: false })
  isAuth: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
