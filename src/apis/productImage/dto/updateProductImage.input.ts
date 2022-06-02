import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductImageInput {
  @Field(() => String)
  productId: string;

  @Field(() => [String])
  imageUrl: string[];
}
