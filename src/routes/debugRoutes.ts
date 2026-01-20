import { Router, Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// @desc    Debug - Verificar status do banco e usuários
// @route   GET /api/debug/status
// @access  Public (REMOVER EM PRODUÇÃO!)
router.get('/status', async (req: Request, res: Response) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    const users = await User.find({}).select('email role isActive');
    
    res.json({
      database: {
        status: dbStates[dbStatus],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      users: users.map(u => ({
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      })),
      totalUsers: users.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// @desc    Debug - Criar usuário de teste
// @route   POST /api/debug/create-user
// @access  Public (REMOVER EM PRODUÇÃO!)
router.post('/create-user', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Verificar se já existe
    const existing = await User.findOne({ email });
    if (existing) {
      // Atualizar senha
      existing.password = password;
      existing.isActive = true;
      await existing.save();
      
      return res.json({
        message: 'Usuário atualizado',
        email: existing.email,
      });
    }

    // Criar novo
    const user = await User.create({
      name: name || 'Usuário Teste',
      email,
      password,
      role: role || 'aluno',
      isActive: true,
      emailVerified: true,
    });

    return res.json({
      message: 'Usuário criado',
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
