import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { EnrollService } from './enroll.service';
import { Enroll } from './entities/enroll.entity';

@Resolver()
export class EnrollResolver {
  constructor(
    private readonly enrollService: EnrollService, //
  ) {}

  @Query(() => [Enroll])
  fetchEnrollsByBoardId() {
    return;
  }

  @Query(() => [Enroll])
  fetchEnrollsByUserId() {
    return;
  }

  @Mutation(() => Enroll)
  createEnroll() {
    return;
  }

  @Mutation(() => Enroll)
  updateEnroll() {
    return;
  }

  @Mutation(() => Boolean)
  deleteEnroll() {
    return;
  }
}
