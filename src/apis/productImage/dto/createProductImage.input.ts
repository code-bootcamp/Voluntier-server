import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductImageInput {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  imageUrl: string;
}
