import { InputType, PickType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class UpdateUserInput extends PickType(CreateUserInput, [
  'name',
  'password',
]) {}
