import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ImageService } from './image.service';

/**
 * Image Upload API Resolver
 * @APIs `uploadImage`
 */
@Resolver()
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Upload Image API
   * @type [`Mutation`]
   * @param file 업로드할 파일
   * @returns 업로드한 파일의 URL
   */
  @Mutation(() => String)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return await this.imageService.upload({ file });
  }
}
