import mongoose, { Schema } from 'mongoose';
import { ICommunication, MessagePriority } from '../types';

const communicationSchema = new Schema<ICommunication>(
  {
    subject: {
      type: String,
      required: [true, 'Assunto é obrigatório'],
      trim: true,
      maxlength: [200, 'Assunto deve ter no máximo 200 caracteres'],
    },
    message: {
      type: String,
      required: [true, 'Mensagem é obrigatória'],
      trim: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    recipientGroups: [
      {
        type: String,
      },
    ],
    priority: {
      type: String,
      enum: Object.values(MessagePriority),
      default: MessagePriority.NORMAL,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
communicationSchema.index({ sender: 1 });
communicationSchema.index({ recipients: 1 });
communicationSchema.index({ createdAt: -1 });
communicationSchema.index({ priority: 1 });

const Communication = mongoose.model<ICommunication>('Communication', communicationSchema);

export default Communication;
