import { Field, InputType, Int } from '@nestjs/graphql';

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

  @Field(() => Int, { nullable: true })
  recruitCount: number;

  @Field(() => Int)
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

  @Field(() => [String], { nullable: true })
  urls: string[];
}
