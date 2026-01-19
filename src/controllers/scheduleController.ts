import { Response } from 'express';
import Schedule from '../models/Schedule';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest, ApiResponse, ScheduleStatus, NotificationType } from '../types';
import emailService from '../config/email';

// @desc    Criar escala
// @route   POST /api/schedules
// @access  Private/Admin
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, startTime, endTime, function: func, assignedTo, notes, isRecurring, recurringPattern } = req.body;

    // Verificar se o usuário designado existe
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      res.status(404).json({
        success: false,
        message: 'Usuário designado não encontrado',
      } as ApiResponse);
      return;
    }

    const schedule = await Schedule.create({
      title,
      description,
      date,
      startTime,
      endTime,
      function: func,
      assignedTo,
      notes,
      isRecurring,
      recurringPattern,
      status: ScheduleStatus.PENDING,
      createdBy: req.user!._id,
    });

    // Criar notificação
    await Notification.create({
      user: assignedTo,
      type: NotificationType.SCHEDULE,
      title: '📅 Nova Escala Designada',
      message: `Você foi designado(a) para: ${title}`,
      link: `/schedules/${schedule._id}`,
    });

    // Enviar email
    try {
      await emailService.sendScheduleNotification(assignedUser.name, assignedUser.email, schedule);
    } catch (error) {
      console.log('Erro ao enviar email de escala:', error);
    }

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Escala criada com sucesso',
      data: populatedSchedule,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar escala',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Listar escalas
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, function: func, status, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    // Alunos veem apenas suas escalas
    if (req.user?.role === 'aluno') {
      query.assignedTo = req.user._id;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    
    if (func) {
      query.function = func;
    }
    
    if (status) {
      query.status = status;
    }

    const schedules = await Schedule.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('substitute', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Schedule.countDocuments(query);

    res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar escalas',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Atualizar escala
// @route   PUT /api/schedules/:id
// @access  Private/Admin
export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Escala não encontrada',
      } as ApiResponse);
      return;
    }

    Object.assign(schedule, req.body);
    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('assignedTo', 'name email avatar')
      .populate('substitute', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Escala atualizada com sucesso',
      data: populatedSchedule,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar escala',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Deletar escala
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Escala não encontrada',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Escala deletada com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar escala',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Confirmar presença na escala
// @route   PUT /api/schedules/:id/confirm
// @access  Private
export const confirmSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Escala não encontrada',
      } as ApiResponse);
      return;
    }

    // Verificar se é o usuário designado
    if (schedule.assignedTo.toString() !== req.user!._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para confirmar esta escala',
      } as ApiResponse);
      return;
    }

    schedule.status = ScheduleStatus.CONFIRMED;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Presença confirmada com sucesso',
      data: schedule,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar presença',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Gerar escalas automáticas
// @route   POST /api/schedules/auto-generate
// @access  Private/Admin
export const autoGenerateSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, functions, daysOfWeek, startTime, endTime } = req.body;

    // Buscar todos os usuários ativos
    const users = await User.find({ isActive: true, role: 'aluno' });

    if (users.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Nenhum usuário disponível para gerar escalas',
      } as ApiResponse);
      return;
    }

    const schedules = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let currentDate = new Date(start);
    let userIndex = 0;

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        for (const func of functions) {
          const schedule = await Schedule.create({
            title: `${func} - ${currentDate.toLocaleDateString('pt-BR')}`,
            date: new Date(currentDate),
            startTime,
            endTime,
            function: func,
            assignedTo: users[userIndex % users.length]._id,
            status: ScheduleStatus.PENDING,
            createdBy: req.user!._id,
          });

          schedules.push(schedule);
          userIndex++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(201).json({
      success: true,
      message: `${schedules.length} escalas geradas automaticamente`,
      data: schedules,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar escalas automaticamente',
      error: error.message,
    } as ApiResponse);
  }
};
