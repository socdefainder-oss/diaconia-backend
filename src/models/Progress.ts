import mongoose, { Schema } from 'mongoose';
import { IProgress } from '../types';

const progressSchema = new Schema<IProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        type: Number,
      },
    ],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificate: {
      issuedAt: Date,
      certificateUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para user + course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;
