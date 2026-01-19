import { Request, Response } from 'express';
import CourseProgress from '../models/CourseProgress';
import Course from '../models/Course';

// Obter progresso de um curso
export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      // Criar progresso inicial se não existir
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLessons: [],
        progress: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Erro ao obter progresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter progresso do curso',
      error: error.message,
    });
  }
};

// Marcar aula como completa
export const completeLesson = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const userId = req.user?._id;

    // Buscar ou criar progresso
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLessons: [],
        progress: 0,
      });
    }

    // Verificar se a aula já está completa
    const lessonIndex = progress.completedLessons.findIndex(
      (l) => l.lessonId === lessonId && l.moduleId === moduleId
    );

    if (lessonIndex === -1) {
      // Adicionar aula como completa
      progress.completedLessons.push({
        lessonId,
        moduleId,
        completed: true,
        completedAt: new Date(),
        watchedDuration: 0,
      });
    } else {
      // Atualizar aula existente
      progress.completedLessons[lessonIndex].completed = true;
      progress.completedLessons[lessonIndex].completedAt = new Date();
    }

    // Calcular progresso
    const course = await Course.findById(courseId);
    if (course) {
      const totalLessons = course.totalLessons || 0;
      const completedCount = progress.completedLessons.filter((l) => l.completed).length;
      progress.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Verificar conclusão do curso
      if (progress.progress === 100 && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Erro ao completar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao completar aula',
      error: error.message,
    });
  }
};

// Atualizar tempo assistido
export const updateWatchTime = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { watchedDuration } = req.body;
    const userId = req.user?._id;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLessons: [],
        progress: 0,
      });
    }

    const lessonIndex = progress.completedLessons.findIndex(
      (l) => l.lessonId === lessonId && l.moduleId === moduleId
    );

    if (lessonIndex === -1) {
      progress.completedLessons.push({
        lessonId,
        moduleId,
        completed: false,
        watchedDuration,
      });
    } else {
      progress.completedLessons[lessonIndex].watchedDuration = watchedDuration;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar tempo assistido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tempo assistido',
      error: error.message,
    });
  }
};

// Verificar se uma aula está bloqueada
export const checkLessonAccess = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const userId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    const progress = await CourseProgress.findOne({ userId, courseId });

    // Se for a primeira aula, sempre liberada
    if (!course.modules || course.modules.length === 0) {
      return res.status(200).json({
        success: true,
        data: { unlocked: true },
      });
    }

    const moduleIndex = course.modules.findIndex((m: any) => m._id.toString() === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    const module = course.modules[moduleIndex];
    const lessonIndex = module.lessons.findIndex((l: any) => l._id.toString() === lessonId);
    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada',
      });
    }

    // Primeira aula do primeiro módulo sempre liberada
    if (moduleIndex === 0 && lessonIndex === 0) {
      return res.status(200).json({
        success: true,
        data: { unlocked: true },
      });
    }

    // Verificar se a aula anterior foi completada
    let previousCompleted = false;

    if (lessonIndex > 0) {
      // Aula anterior no mesmo módulo
      const previousLessonId = module.lessons[lessonIndex - 1]._id.toString();
      previousCompleted = progress?.completedLessons.some(
        (l) => l.lessonId === previousLessonId && l.moduleId === moduleId && l.completed
      ) || false;
    } else if (moduleIndex > 0) {
      // Última aula do módulo anterior
      const previousModule = course.modules[moduleIndex - 1];
      const lastLesson = previousModule.lessons[previousModule.lessons.length - 1];
      const previousModuleId = previousModule._id.toString();
      const lastLessonId = lastLesson._id.toString();
      
      previousCompleted = progress?.completedLessons.some(
        (l) => l.lessonId === lastLessonId && l.moduleId === previousModuleId && l.completed
      ) || false;
    }

    res.status(200).json({
      success: true,
      data: { unlocked: previousCompleted },
    });
  } catch (error: any) {
    console.error('Erro ao verificar acesso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar acesso à aula',
      error: error.message,
    });
  }
};
