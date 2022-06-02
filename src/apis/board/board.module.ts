import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImage } from '../boardImage/entities/boardImage.entity';
import { User } from '../user/entities/user.entity';
import { BoardResolver } from './board.resolver';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardImage, User]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL,
    }),
  ],
  providers: [
    BoardResolver,
    BoardService, //
  ],
})
export class BoardModule {}
