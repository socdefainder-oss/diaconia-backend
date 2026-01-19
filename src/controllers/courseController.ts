import { Response } from 'express';
import Course from '../models/Course';
import Progress from '../models/Progress';
import { AuthRequest, ApiResponse, CourseStatus } from '../types';
import cloudinaryService from '../config/cloudinary';

// @desc    Criar curso
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, level, lessons } = req.body;
    
    let thumbnailUrl;
    if (req.file) {
      thumbnailUrl = await cloudinaryService.uploadImage(req.file, { folder: 'courses' });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnailUrl,
      instructor: req.user?._id,
      category,
      level,
      lessons: lessons || [],
      status: CourseStatus.DRAFT,
    });

    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: course,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar curso',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Listar todos os cursos
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    // Alunos veem apenas cursos publicados
    if (req.user?.role === 'aluno') {
      query.status = CourseStatus.PUBLISHED;
    } else if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cursos',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Obter detalhes de um curso
// @route   GET /api/courses/:id
// @access  Private
export const getCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('enrolledStudents', 'name email avatar');

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      } as ApiResponse);
      return;
    }

    // Verificar progresso do usuário no curso
    let userProgress = null;
    if (req.user) {
      userProgress = await Progress.findOne({
        user: req.user._id,
        course: course._id,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        userProgress,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar curso',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Atualizar curso
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      } as ApiResponse);
      return;
    }

    Object.assign(course, req.body);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Curso atualizado com sucesso',
      data: course,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar curso',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Deletar curso
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Curso deletado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar curso',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Inscrever-se em um curso
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      } as ApiResponse);
      return;
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      res.status(400).json({
        success: false,
        message: 'Este curso não está disponível para inscrição',
      } as ApiResponse);
      return;
    }

    // Verificar se já está inscrito
    const isEnrolled = course.enrolledStudents.includes(req.user!._id);
    if (isEnrolled) {
      res.status(400).json({
        success: false,
        message: 'Você já está inscrito neste curso',
      } as ApiResponse);
      return;
    }

    // Inscrever aluno
    course.enrolledStudents.push(req.user!._id);
    await course.save();

    // Criar progresso
    await Progress.create({
      user: req.user!._id,
      course: course._id,
      completedLessons: [],
      progress: 0,
    });

    res.status(200).json({
      success: true,
      message: 'Inscrição realizada com sucesso',
      data: course,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao inscrever-se no curso',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Marcar aula como completa
// @route   POST /api/courses/:id/lessons/:lessonIndex/complete
// @access  Private
export const completeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, lessonIndex } = req.params;

    const progress = await Progress.findOne({
      user: req.user!._id,
      course: id,
    });

    if (!progress) {
      res.status(404).json({
        success: false,
        message: 'Você não está inscrito neste curso',
      } as ApiResponse);
      return;
    }

    const lessonIdx = parseInt(lessonIndex);
    
    if (!progress.completedLessons.includes(lessonIdx)) {
      progress.completedLessons.push(lessonIdx);
      
      // Calcular progresso
      const course = await Course.findById(id);
      if (course) {
        progress.progress = Math.round((progress.completedLessons.length / course.lessons.length) * 100);
        
        if (progress.progress === 100) {
          progress.completedAt = new Date();
        }
      }
      
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Aula marcada como completa',
      data: progress,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao completar aula',
      error: error.message,
    } as ApiResponse);
  }
};
