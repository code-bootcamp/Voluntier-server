import { Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => String)
  login() {
    return;
  }

  @Mutation(() => String)
  logout() {
    return;
  }

  @Mutation(() => String)
  restoreAccessToken() {
    return;
  }
}
