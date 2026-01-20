import mongoose, { Schema } from 'mongoose';
import { ISchedule, ScheduleStatus, ScheduleFunction } from '../types';

const scheduleSchema = new Schema<ISchedule>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    startTime: {
      type: String,
      required: [true, 'Horário de início é obrigatório'],
    },
    endTime: {
      type: String,
      required: [true, 'Horário de término é obrigatório'],
    },
    function: {
      type: String,
      enum: Object.values(ScheduleFunction),
      required: [true, 'Função é obrigatória'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Designação é obrigatória'],
    },
    substitute: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ScheduleStatus),
      default: ScheduleStatus.PENDING,
    },
    notes: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      interval: Number,
      endDate: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
scheduleSchema.index({ date: 1 });
scheduleSchema.index({ assignedTo: 1 });
scheduleSchema.index({ function: 1 });
scheduleSchema.index({ status: 1 });

const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;
