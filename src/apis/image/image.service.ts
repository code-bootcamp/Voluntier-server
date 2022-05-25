import { Storage } from '@google-cloud/storage';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';

interface IUpload {
  file: FileUpload;
}

@Injectable()
export class ImageService {
  async upload({ file }: IUpload) {
    const storage = new Storage({
      keyFilename: process.env.STORAGE_KEY_FILENAME,
      projectId: process.env.STORAGE_PROJECT_ID,
    }).bucket(process.env.STORAGE_BUCKET);

    // 이미지 파일이 아닐경우
    const fileType = file.mimetype.split('/')[0];
    if (fileType !== 'image') {
      throw new UnprocessableEntityException('it is not an image file');
    }

    const url = await new Promise((resolve, reject) => {
      file
        .createReadStream()
        .pipe(storage.file(file.filename).createWriteStream())
        .on('finish', () =>
          resolve(`${process.env.STORAGE_BUCKET}/${file.filename}`),
        )
        .on('error', (error) => reject(error));
    });

    console.log('이미지 업로드 성공');

    return url;
  }
}
