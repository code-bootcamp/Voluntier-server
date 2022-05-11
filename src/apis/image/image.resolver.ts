import { Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class ImageResolver {
  //uploadImage
  @Mutation(() => String)
  uploadImage() {
    return 'uploadImage';
  }
}
