import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import CourseProgress from '../models/CourseProgress';
import Course from '../models/Course';
import User from '../models/User';

// Gerar certificado
export const generateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progresso não encontrado',
      });
    }

    if (!progress.completed) {
      return res.status(400).json({
        success: false,
        message: 'Curso não concluído. Complete todas as aulas primeiro.',
      });
    }

    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId),
    ]);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: 'Curso ou usuário não encontrado',
      });
    }

    // Gerar URL do certificado (pode usar serviço externo como PDF generator)
    const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${progress._id}`;

    // Atualizar progresso com certificado
    progress.certificateIssued = true;
    progress.certificateUrl = certificateUrl;
    await progress.save();

    return res.status(200).json({
      success: true,
      data: {
        certificateUrl,
        studentName: user.name,
        courseName: course.title,
        completedAt: progress.completedAt,
        certificateId: progress._id,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar certificado',
      error: error.message,
    });
  }
};

// Verificar certificado
export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;

    const progress = await CourseProgress.findById(certificateId)
      .populate('userId', 'name email')
      .populate('courseId', 'title category');

    if (!progress || !progress.certificateIssued) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        studentName: (progress.userId as any).name,
        studentEmail: (progress.userId as any).email,
        courseName: (progress.courseId as any).title,
        courseCategory: (progress.courseId as any).category,
        completedAt: progress.completedAt,
        certificateId: progress._id,
        valid: true,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar certificado',
      error: error.message,
    });
  }
};
