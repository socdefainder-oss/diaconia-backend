import { Response } from 'express';
import Team from '../models/Team';
import { AuthRequest, ApiResponse } from '../types';

export const getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('members', 'name email avatar')
      .sort({ dayOfWeek: 1, teamNumber: 1 });

    return res.status(200).json({
      success: true,
      data: teams,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar times',
      error: error.message,
    } as ApiResponse);
  }
};

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id).populate('members', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Time não encontrado',
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      data: team,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar time',
      error: error.message,
    } as ApiResponse);
  }
};

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Time criado com sucesso',
      data: team,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar time',
      error: error.message,
    } as ApiResponse);
  }
};

export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Time não encontrado',
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Time atualizado com sucesso',
      data: team,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar time',
      error: error.message,
    } as ApiResponse);
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Time não encontrado',
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Time desativado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao desativar time',
      error: error.message,
    } as ApiResponse);
  }
};

export const addMemberToTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Time não encontrado',
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Membro adicionado com sucesso',
      data: team,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar membro',
      error: error.message,
    } as ApiResponse);
  }
};

export const removeMemberFromTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userId } },
      { new: true }
    ).populate('members', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Time não encontrado',
      } as ApiResponse);
    }

    return res.status(200).json({
      success: true,
      message: 'Membro removido com sucesso',
      data: team,
    } as ApiResponse);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover membro',
      error: error.message,
    } as ApiResponse);
  }
};
