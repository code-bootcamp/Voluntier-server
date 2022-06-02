import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  price: number;

  @Field(() => String)
  details: string;

  @Field(() => [String])
  imageUrls: string[];
}
