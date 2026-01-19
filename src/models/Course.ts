import mongoose, { Schema } from 'mongoose';
import { ICourse, CourseStatus } from '../types';

const lessonSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: String,
  videoUrl: String,
  duration: Number,
  order: {
    type: Number,
    required: true,
  },
  resources: [
    {
      name: String,
      url: String,
      type: String,
    },
  ],
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
    lessons: [lessonSchema],
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
  },
  {
    timestamps: true,
  }
);

// Calcular duração total automaticamente
courseSchema.pre('save', function (next) {
  if (this.lessons && this.lessons.length > 0) {
    this.duration = this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  next();
});

// Índices
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
