import { Storage } from '@google-cloud/storage';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { v4 } from 'uuid';

interface IUpload {
  file: FileUpload;
}

/**
 * Image Upload Service
 */
@Injectable()
export class ImageService {
  /**
   * Upload File
   * @param file File Info
   * @returns URL of file
   */
  async upload({ file }: IUpload) {
    const storage = new Storage({
      keyFilename: process.env.STORAGE_KEY_FILENAME,
      projectId: process.env.STORAGE_PROJECT_ID,
    }).bucket(process.env.STORAGE_BUCKET);

    const fileType = file.mimetype.split('/')[0];
    if (fileType !== 'image') {
      throw new UnprocessableEntityException('it is not an image file');
    }

    const url: string = await new Promise((resolve, reject) => {
      const uuid = v4();
      const fileType = file.filename.split('.').pop();

      file
        .createReadStream()
        .pipe(storage.file(`${uuid}.${fileType}`).createWriteStream())
        .on('finish', () =>
          resolve(`${process.env.STORAGE_BUCKET}/${uuid}.${fileType}`),
        )
        .on('error', (error) => reject(error));
    });

    return url;
  }
}
