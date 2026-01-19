import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, UserRole } from '../types';

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Verificar token no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Não autorizado. Token não fornecido.',
      });
      return;
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Buscar usuário
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não encontrado.',
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o administrador.',
        });
        return;
      }

      // Adicionar usuário à requisição
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado.',
      });
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: error.message,
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Não autorizado.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Acesso negado. Esta ação requer permissão de: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
