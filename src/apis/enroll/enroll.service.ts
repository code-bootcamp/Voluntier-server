import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enroll } from './entities/enroll.entity';

@Injectable()
export class EnrollService {
  constructor(
    @InjectRepository(Enroll)
    private readonly enrollRepository: Repository<Enroll>,
  ) {}

  findAllByBoardId() {
    return;
  }

  findAllByUserId() {
    return;
  }

  create() {
    return;
  }

  update() {
    return;
  }

  delete() {
    return;
  }
}
