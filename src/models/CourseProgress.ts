import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress {
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  watchedDuration: number; // segundos assistidos
}

export interface ICourseProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedLessons: ILessonProgress[];
  progress: number; // percentual 0-100
  completed: boolean;
  completedAt?: Date;
  certificateIssued: boolean;
  certificateUrl?: string;
}

const lessonProgressSchema = new Schema({
  lessonId: {
    type: String,
    required: true,
  },
  moduleId: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  watchedDuration: {
    type: Number,
    default: 0,
  },
});

const courseProgressSchema = new Schema<ICourseProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedLessons: [lessonProgressSchema],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: String,
  },
  {
    timestamps: true,
  }
);

// Índice composto único (um progresso por usuário por curso)
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model<ICourseProgress>('CourseProgress', courseProgressSchema);

export default CourseProgress;
