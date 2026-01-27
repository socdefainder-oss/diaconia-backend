import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAnswer {
  questionIndex: number;
  selectedOption: number; // índice da opção selecionada (0-3)
}

export interface IQuizAttempt extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  moduleId?: string; // ID do módulo (se a aula estiver em um módulo)
  lessonId: string; // ID da aula dentro do módulo ou do array de lessons
  answers: IQuizAnswer[];
  score: number; // pontuação (0-100)
  correctAnswers: number; // número de respostas corretas
  totalQuestions: number; // total de perguntas (sempre 5)
  passed: boolean; // true se score >= 80
  completedAt: Date;
}

const quizAnswerSchema = new Schema({
  questionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 4, // índice 0-4 para 5 perguntas
  },
  selectedOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3, // índice 0-3 para 4 opções
  },
});

const quizAttemptSchema = new Schema<IQuizAttempt>(
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
    moduleId: {
      type: String,
      default: null,
    },
    lessonId: {
      type: String,
      required: true,
    },
    answers: {
      type: [quizAnswerSchema],
      required: true,
      validate: {
        validator: function(answers: IQuizAnswer[]) {
          return answers.length === 5;
        },
        message: 'Deve responder todas as 5 perguntas',
      },
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para queries eficientes
quizAttemptSchema.index({ user: 1, course: 1 });
quizAttemptSchema.index({ user: 1, course: 1, lessonId: 1 });
quizAttemptSchema.index({ completedAt: -1 });

const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
