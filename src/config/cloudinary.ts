import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  transformation?: any[];
}

class CloudinaryService {
  async uploadImage(file: Express.Multer.File, options: UploadOptions = {}): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const uploadOptions: any = {
          folder: options.folder || 'diaconia',
          resource_type: 'auto',
        };

        if (options.transformation) {
          uploadOptions.transformation = options.transformation;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload para Cloudinary:', error.message);
      throw error;
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], options: UploadOptions = {}): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload múltiplo:', error.message);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Imagem deletada do Cloudinary');
    } catch (error: any) {
      console.error('❌ Erro ao deletar imagem:', error.message);
      throw error;
    }
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

export default new CloudinaryService();
