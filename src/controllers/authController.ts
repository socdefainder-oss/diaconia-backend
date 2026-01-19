import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest, ApiResponse, UserRole } from '../types';
import emailService from '../config/email';

// Gerar JWT Token
const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

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
    });

    // Enviar email de boas-vindas
    try {
      await emailService.sendWelcomeEmail(user.name, user.email);
    } catch (error) {
      console.log('Erro ao enviar email de boas-vindas:', error);
    }

    // Gerar token
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Verificar se usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      } as ApiResponse);
      return;
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.',
      } as ApiResponse);
      return;
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      } as ApiResponse);
      return;
    }

    // Gerar token
    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Obter usuário logado
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

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

// @desc    Atualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, cpf, birthDate, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        name,
        phone,
        cpf,
        birthDate,
        address,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    // Verificar senha atual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Senha atual incorreta',
      } as ApiResponse);
      return;
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: error.message,
    } as ApiResponse);
  }
};

// @desc    Solicitar recuperação de senha
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      } as ApiResponse);
      return;
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Aqui você pode salvar o token no banco com expiração
    // Por simplicidade, vamos apenas enviar o email

    // Enviar email
    try {
      await emailService.sendPasswordResetEmail(user.name, user.email, resetToken);
    } catch (error) {
      console.log('Erro ao enviar email de recuperação:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Email de recuperação enviado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao solicitar recuperação de senha',
      error: error.message,
    } as ApiResponse);
  }
};

