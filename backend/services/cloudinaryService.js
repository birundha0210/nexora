import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('Image buffer is missing.'));
    }

    const source = Readable.from([file.buffer]);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'nexora',
        resource_type: 'image',
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto'
          }
        ]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(
            new Error('Cloudinary returned an empty response.')
          );
        }

        resolve(result);
      }
    );

    source.on('error', reject);
    uploadStream.on('error', reject);

    source.pipe(uploadStream);
  });
}
