import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// User Types
export enum UserRole {
  ADMIN = 'admin',
  ALUNO = 'aluno',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

// Course Types
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IResource {
  name: string;
  url: string;
  type: 'pdf' | 'video' | 'link' | 'image' | 'document';
  size?: number;
}

export interface ILesson {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number; // em segundos
  duration?: number; // em minutos (compatibilidade)
  order: number;
  resources?: IResource[];
  isPreview?: boolean;
}

export interface IModule {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  instructor: IUser['_id'];
  category: string;
  status: CourseStatus;
  modules?: IModule[]; // Nova estrutura hierárquica
  lessons: ILesson[]; // Compatibilidade com estrutura antiga
  enrolledStudents: IUser['_id'][];
  duration?: number; // total em minutos
  totalLessons?: number; // total de aulas
  level?: 'iniciante' | 'intermediário' | 'avançado';
  certificateEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schedule Types
export enum ScheduleStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ScheduleFunction {
  PREGADOR = 'pregador',
  LOUVOR = 'louvor',
  PORTARIA = 'portaria',
  SONORIZACAO = 'sonorizacao',
  MULTIMEDIA = 'multimedia',
  INFANTIL = 'infantil',
  INTERCESSAO = 'intercessao',
  RECEPCAO = 'recepcao',
  LIMPEZA = 'limpeza',
  OUTROS = 'outros',
}

export interface ISchedule extends Document {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  function: ScheduleFunction;
  team?: mongoose.Types.ObjectId;
  assignedTo: IUser['_id'];
  substitute?: IUser['_id'];
  status: ScheduleStatus;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  createdBy: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

// Communication Types
export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ICommunication extends Document {
  subject: string;
  message: string;
  sender: IUser['_id'];
  recipients: IUser['_id'][];
  recipientGroups?: string[]; // ex: 'all_students', 'all_admins', etc
  priority: MessagePriority;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  readBy: {
    user: IUser['_id'];
    readAt: Date;
  }[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement Types
export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  priority: MessagePriority;
  image?: string;
  targetAudience: UserRole[];
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: Date;
  viewedBy: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

// Progress Types
export interface IProgress extends Document {
  user: IUser['_id'];
  course: ICourse['_id'];
  completedLessons: number[];
  progress: number; // 0-100
  lastAccessedAt: Date;
  completedAt?: Date;
  certificate?: {
    issuedAt: Date;
    certificateUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  MESSAGE = 'message',
  SCHEDULE = 'schedule',
  COURSE = 'course',
  SYSTEM = 'system',
}

export interface INotification extends Document {
  user: IUser['_id'];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

