import mongoose, { Schema } from 'mongoose';
import { IAnnouncement, MessagePriority, UserRole } from '../types';

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'Conteúdo é obrigatório'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(MessagePriority),
      default: MessagePriority.NORMAL,
    },
    image: {
      type: String,
      default: null,
    },
    targetAudience: [
      {
        type: String,
        enum: Object.values(UserRole),
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    viewedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPinned: -1 });
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ expiresAt: 1 });

const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;
