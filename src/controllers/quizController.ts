import { Request, Response } from 'express';
import QuizAttempt from '../models/QuizAttempt';
import Course from '../models/Course';
import CourseProgress from '../models/CourseProgress';
import { AuthRequest } from '../types';

// Obter perguntas do quiz de uma aula (sem as respostas corretas)
export const getQuizQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const userId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    // Encontrar a aula
    let lesson: any = null;
    
    // Se moduleId for 'default' ou null/undefined, buscar direto nas lessons do curso
    if (!moduleId || moduleId === 'null' || moduleId === 'default') {
      if (course.lessons) {
        lesson = course.lessons.find((l: any) => l._id.toString() === lessonId);
      }
    } else if (course.modules) {
      // Se tem moduleId válido, buscar no módulo
      const module = course.modules.find((m: any) => m._id.toString() === moduleId);
      if (module) {
        lesson = module.lessons.find((l: any) => l._id.toString() === lessonId);
      }
    }

    if (!lesson) {
      console.error('Aula não encontrada:', { courseId, moduleId, lessonId, hasModules: !!course.modules, hasLessons: !!course.lessons });
      return res.status(404).json({ message: 'Aula não encontrada' });
    }

    if (!lesson.quiz || lesson.quiz.length === 0) {
      return res.status(404).json({ message: 'Esta aula não possui questionário' });
    }

    // Remover a informação de resposta correta antes de enviar
    const questions = lesson.quiz.map((q: any, index: number) => ({
      questionIndex: index,
      question: q.question,
      options: q.options.map((opt: any, optIndex: number) => ({
        optionIndex: optIndex,
        text: opt.text,
      })),
    }));

    res.json({ questions });
    return;
  } catch (error) {
    console.error('Erro ao buscar perguntas do quiz:', error);
    res.status(500).json({ message: 'Erro ao buscar perguntas do quiz' });
    return;
  }
};

// Submeter respostas do quiz
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { answers } = req.body; // Array de { questionIndex, selectedOption }
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Validar que foram enviadas 5 respostas
    if (!answers || answers.length !== 5) {
      return res.status(400).json({ message: 'Deve responder todas as 5 perguntas' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    // Encontrar a aula
    let lesson: any = null;
    
    // Se moduleId for 'default' ou null/undefined, buscar direto nas lessons do curso
    if (!moduleId || moduleId === 'null' || moduleId === 'default') {
      if (course.lessons) {
        lesson = course.lessons.find((l: any) => l._id.toString() === lessonId);
      }
    } else if (course.modules) {
      // Se tem moduleId válido, buscar no módulo
      const module = course.modules.find((m: any) => m._id.toString() === moduleId);
      if (module) {
        lesson = module.lessons.find((l: any) => l._id.toString() === lessonId);
      }
    }

    if (!lesson || !lesson.quiz || lesson.quiz.length !== 5) {
      console.error('Quiz não encontrado:', { courseId, moduleId, lessonId, hasLesson: !!lesson, quizLength: lesson?.quiz?.length });
      return res.status(404).json({ message: 'Quiz não encontrado ou incompleto' });
    }

    // Calcular pontuação
    let correctAnswers = 0;
    const detailedResults = answers.map((answer: any) => {
      const question = lesson.quiz[answer.questionIndex];
      const correctOptionIndex = question.options.findIndex((opt: any) => opt.isCorrect);
      const isCorrect = answer.selectedOption === correctOptionIndex;
      
      if (isCorrect) {
        correctAnswers++;
      }

      return {
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        correctOption: correctOptionIndex,
        isCorrect,
      };
    });

    const score = (correctAnswers / 5) * 100;
    const passed = score >= 80; // Mínimo 4 de 5 corretas (80%)

    // Salvar tentativa
    const attempt = new QuizAttempt({
      user: userId,
      course: courseId,
      moduleId: moduleId !== 'null' ? moduleId : null,
      lessonId,
      answers,
      score,
      correctAnswers,
      totalQuestions: 5,
      passed,
    });

    await attempt.save();

    // Atualizar progresso do curso
    let progress = await CourseProgress.findOne({ userId, courseId });
    
    if (!progress) {
      // Criar progresso se não existir
      progress = new CourseProgress({
        userId,
        courseId,
        completedLessons: [],
      });
    }

    // Atualizar ou adicionar progresso da aula
    const lessonProgressIndex = progress.completedLessons.findIndex(
      (lp: any) => lp.lessonId === lessonId && lp.moduleId === (moduleId || '')
    );

    if (lessonProgressIndex >= 0) {
      progress.completedLessons[lessonProgressIndex].quizCompleted = true;
      progress.completedLessons[lessonProgressIndex].quizScore = score;
      progress.completedLessons[lessonProgressIndex].quizPassed = passed;
      progress.completedLessons[lessonProgressIndex].quizAttempts += 1;

      // Marcar aula como completada se vídeo foi assistido E quiz foi passado
      const lessonProgress = progress.completedLessons[lessonProgressIndex];
      if (lessonProgress.watchedDuration > 0 && passed) {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
      }
    } else {
      // Adicionar novo progresso
      progress.completedLessons.push({
        lessonId,
        moduleId: moduleId || '',
        completed: false, // Só será true quando vídeo E quiz forem concluídos
        watchedDuration: 0,
        quizCompleted: true,
        quizScore: score,
        quizPassed: passed,
        quizAttempts: 1,
      });
    }

    // Recalcular progresso geral
    const totalLessons = course.totalLessons || 0;
    const completedCount = progress.completedLessons.filter((lp: any) => lp.completed).length;
    progress.progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    progress.lastAccessedAt = new Date();

    await progress.save();

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions: 5,
      passed,
      message: passed 
        ? 'Parabéns! Você passou no questionário e pode avançar para a próxima aula.' 
        : 'Você precisa acertar pelo menos 4 questões para avançar. Tente novamente após revisar o conteúdo.',
      results: detailedResults,
    });
    return;
  } catch (error) {
    console.error('Erro ao submeter quiz:', error);
    res.status(500).json({ message: 'Erro ao submeter quiz' });
    return;
  }
};

// Obter histórico de tentativas do quiz
export const getQuizAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const attempts = await QuizAttempt.find({
      user: userId,
      course: courseId,
      lessonId,
    }).sort({ completedAt: -1 });

    res.json({ attempts });
    return;
  } catch (error) {
    console.error('Erro ao buscar tentativas do quiz:', error);
    res.status(500).json({ message: 'Erro ao buscar tentativas do quiz' });
    return;
  }
};

// Obter melhor tentativa do aluno para uma aula
export const getBestAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const bestAttempt = await QuizAttempt.findOne({
      user: userId,
      course: courseId,
      lessonId,
    }).sort({ score: -1, completedAt: -1 });

    res.json({ attempt: bestAttempt });
    return;
  } catch (error) {
    console.error('Erro ao buscar melhor tentativa:', error);
    res.status(500).json({ message: 'Erro ao buscar melhor tentativa' });
    return;
  }
};
