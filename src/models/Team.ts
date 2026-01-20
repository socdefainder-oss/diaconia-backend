import mongoose, { Schema } from 'mongoose';

export interface ITeam extends mongoose.Document {
  name: string; // Ex: "QUARTA - Time 1"
  dayOfWeek: 'domingo' | 'segunda' | 'terça' | 'quarta' | 'quinta' | 'sexta' | 'sábado';
  shift?: 'manhã' | 'tarde' | 'noite'; // Para times de domingo
  teamNumber: number; // 1, 2, 3, etc
  description?: string;
  color?: string; // Cor para identificação visual
  members: mongoose.Types.ObjectId[]; // IDs dos membros
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Nome do time é obrigatório'],
      trim: true,
    },
    dayOfWeek: {
      type: String,
      required: [true, 'Dia da semana é obrigatório'],
      enum: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
    },
    shift: {
      type: String,
      enum: ['manhã', 'tarde', 'noite'],
    },
    teamNumber: {
      type: Number,
      required: [true, 'Número do time é obrigatório'],
      min: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6', // primary-600
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
teamSchema.index({ dayOfWeek: 1, teamNumber: 1 });
teamSchema.index({ isActive: 1 });

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team;
