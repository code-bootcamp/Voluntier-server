import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  contents: string;

  @Field(() => String)
  centerName: string;

  @Field(() => String)
  centerOwnerName: string;

  @Field(() => String)
  centerPhone: string;

  @Field(() => String)
  recruitCount: number;

  @Field(() => String)
  serviceTime: number;

  @Field(() => Date)
  serviceDate: Date;

  @Field(() => String)
  address: string;

  @Field(() => String)
  addressDetail: string;

  @Field(() => String)
  location1: string;

  @Field(() => String)
  location2: string;
}
