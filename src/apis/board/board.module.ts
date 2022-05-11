import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardResolver } from './board.resolver';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  providers: [
    BoardResolver,
    BoardService, //
  ],
})
export class BoardModule {}
