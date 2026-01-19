import { Response } from 'express';
import Announcement from '../models/Announcement';
import { AuthRequest, ApiResponse } from '../types';

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user!._id,
    });

    res.status(201).json({
      success: true,
      message: 'Aviso criado com sucesso',
      data: announcement,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aviso',
      error: error.message,
    } as ApiResponse);
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const query: any = {
      isActive: true,
      $or: [
        { targetAudience: { $in: [req.user!.role] } },
        { targetAudience: { $size: 0 } },
      ],
    };

    const announcements = await Announcement.find(query)
      .populate('author', 'name email avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Announcement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: announcements,
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
      message: 'Erro ao buscar avisos',
      error: error.message,
    } as ApiResponse);
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Aviso atualizado com sucesso',
      data: announcement,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar aviso',
      error: error.message,
    } as ApiResponse);
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Aviso deletado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar aviso',
      error: error.message,
    } as ApiResponse);
  }
};

export const markAnnouncementAsViewed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      } as ApiResponse);
      return;
    }

    if (!announcement.viewedBy.includes(req.user!._id)) {
      announcement.viewedBy.push(req.user!._id);
      await announcement.save();
    }

    res.status(200).json({
      success: true,
      message: 'Aviso marcado como visualizado',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar aviso como visualizado',
      error: error.message,
    } as ApiResponse);
  }
};
