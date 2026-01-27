import mongoose, { Schema } from 'mongoose';
import { ICourse, CourseStatus } from '../types';

// Schema para recursos (arquivos, links)
const resourceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'image', 'document'],
    required: true,
  },
  size: Number,
});

// Schema para opções de pergunta
const quizOptionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Schema para perguntas do quiz
const quizQuestionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [quizOptionSchema],
    required: true,
    validate: {
      validator: function(options: any[]) {
        return options.length === 4 && options.filter(o => o.isCorrect).length === 1;
      },
      message: 'Cada pergunta deve ter exatamente 4 opções e apenas 1 correta',
    },
  },
  order: {
    type: Number,
    required: true,
  },
});

// Schema para aulas
const lessonSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: String,
  videoUrl: String,
  videoDuration: Number, // duração em segundos
  order: {
    type: Number,
    required: true,
  },
  resources: [resourceSchema],
  isPreview: {
    type: Boolean,
    default: false, // aulas preview podem ser vistas sem matrícula
  },
  quiz: {
    type: [quizQuestionSchema],
    validate: {
      validator: function(quiz: any[]) {
        return !quiz || quiz.length === 0 || quiz.length === 5;
      },
      message: 'O quiz deve ter exatamente 5 perguntas ou estar vazio',
    },
  },
});

// Schema para módulos
const moduleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  order: {
    type: Number,
    required: true,
  },
  lessons: [lessonSchema],
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      minlength: [3, 'Título deve ter no mínimo 3 caracteres'],
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      minlength: [10, 'Descrição deve ter no mínimo 10 caracteres'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    modules: [moduleSchema], // NOVO: módulos hierárquicos
    lessons: [lessonSchema], // MANTIDO para compatibilidade
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    duration: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['iniciante', 'intermediário', 'avançado'],
      default: 'iniciante',
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    certificateEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calcular duração e total de aulas automaticamente
courseSchema.pre('save', function (next) {
  let totalDuration = 0;
  let totalLessons = 0;

  // Calcular a partir dos módulos (nova estrutura)
  if (this.modules && this.modules.length > 0) {
    this.modules.forEach((module: any) => {
      if (module.lessons && module.lessons.length > 0) {
        totalLessons += module.lessons.length;
        module.lessons.forEach((lesson: any) => {
          totalDuration += lesson.videoDuration || 0;
        });
      }
    });
  }
  
  // Fallback para estrutura antiga (lessons diretas)
  if (this.lessons && this.lessons.length > 0 && totalLessons === 0) {
    totalLessons = this.lessons.length;
    totalDuration = this.lessons.reduce((total, lesson: any) => total + (lesson.duration || 0), 0);
  }

  this.duration = totalDuration;
  this.totalLessons = totalLessons;
  next();
});

// Índices
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;

