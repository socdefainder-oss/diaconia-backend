import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Upload de imagem
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    }

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'diaconia/courses/images',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 675, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error: any) {
    console.error('Erro no upload de imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: error.message,
    });
  }
};

// Upload de vídeo
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    }

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'diaconia/courses/videos',
      resource_type: 'video',
      eager: [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto' },
      ],
      eager_async: true,
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
      },
    });
  } catch (error: any) {
    console.error('Erro no upload de vídeo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do vídeo',
      error: error.message,
    });
  }
};

// Deletar arquivo do Cloudinary
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID é obrigatório',
      });
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    res.status(200).json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar arquivo',
      error: error.message,
    });
  }
};
