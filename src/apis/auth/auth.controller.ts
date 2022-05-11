import { Controller } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Controller()
export class AuthContoller {
  constructor(
    private readonly userService: UserService, //
    private readonly authService: AuthService,
  ) {}

  loginGoogle() {
    return;
  }

  loginNaver() {
    return;
  }

  loginKakao() {
    return;
  }
}
