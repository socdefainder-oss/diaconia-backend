import { Response } from 'express';
import User from '../models/User';
import Team from '../models/Team';
import { AuthRequest, ApiResponse, UserRole } from '../types';

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, team } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      } as ApiResponse);
      return;
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.ALUNO,
      phone,
      team,
    });

    // Se foi fornecido um team, adicionar o usuário ao time
    if (team) {
      await Team.findByIdAndUpdate(
        team,
        { $addToSet: { members: user._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message,
    } as ApiResponse);
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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
      message: 'Erro ao buscar usuários',
      error: error.message,
    } as ApiResponse);
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message,
    } as ApiResponse);
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Buscar usuário anterior para comparar o time
    const oldUser = await User.findById(req.params.id);
    
    if (!oldUser) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    // Se o time mudou, atualizar os times
    if (req.body.team) {
      const newTeamId = req.body.team;
      const oldTeamId = oldUser.team?.toString();

      // Se tinha um time anterior e mudou, remover do time antigo
      if (oldTeamId && oldTeamId !== newTeamId) {
        await Team.findByIdAndUpdate(
          oldTeamId,
          { $pull: { members: user._id } }
        );
      }

      // Adicionar ao novo time (se não estava antes)
      if (!oldTeamId || oldTeamId !== newTeamId) {
        await Team.findByIdAndUpdate(
          newTeamId,
          { $addToSet: { members: user._id } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message,
    } as ApiResponse);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Usuário deletado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message,
    } as ApiResponse);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status do usuário',
      error: error.message,
    } as ApiResponse);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: UserRole.ADMIN });
    const totalStudents = await User.countDocuments({ role: UserRole.ALUNO });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalStudents,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message,
    } as ApiResponse);
  }
};
