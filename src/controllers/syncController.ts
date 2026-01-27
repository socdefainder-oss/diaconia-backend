import { Response } from 'express';
import User from '../models/User';
import Team from '../models/Team';
import { AuthRequest, ApiResponse } from '../types';

export const syncTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Buscar todos os usuários que têm um team definido
    const usersWithTeam = await User.find({ team: { $exists: true, $ne: null } });
    
    let syncedCount = 0;
    const errors: string[] = [];

    for (const user of usersWithTeam) {
      try {
        // Verificar se o time existe
        const team = await Team.findById(user.team);
        
        if (!team) {
          errors.push(`Time ${user.team} do usuário ${user.name} não existe`);
          continue;
        }

        // Verificar se o usuário já está no array de membros
        const isMember = team.members.some(
          (memberId) => memberId.toString() === user._id.toString()
        );

        if (!isMember) {
          // Adicionar usuário ao time
          await Team.findByIdAndUpdate(
            user.team,
            { $addToSet: { members: user._id } }
          );
          syncedCount++;
        }
      } catch (error) {
        errors.push(`Erro ao processar usuário ${user.name}: ${error}`);
      }
    }

    // Buscar estatísticas atualizadas
    const teams = await Team.find().populate('members', 'name');
    const teamStats = teams.map(t => ({
      name: t.name,
      membersCount: t.members.length,
    }));

    res.status(200).json({
      success: true,
      message: 'Sincronização concluída',
      data: {
        totalUsers: usersWithTeam.length,
        syncedCount,
        errors,
        teamStats,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização',
      error: error.message,
    } as ApiResponse);
  }
};
