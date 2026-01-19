import { body, param, query, ValidationChain } from 'express-validator';

// User Validators
export const registerValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'aluno'])
    .withMessage('Função inválida'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

export const updateUserValidator: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('phone')
    .optional()
    .trim(),
  body('cpf')
    .optional()
    .trim(),
];

// Course Validators
export const createCourseValidator: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 10 })
    .withMessage('Descrição deve ter no mínimo 10 caracteres'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Categoria é obrigatória'),
  body('level')
    .optional()
    .isIn(['iniciante', 'intermediário', 'avançado'])
    .withMessage('Nível inválido'),
];

// Schedule Validators
export const createScheduleValidator: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Título é obrigatório'),
  body('date')
    .notEmpty()
    .withMessage('Data é obrigatória')
    .isISO8601()
    .withMessage('Data inválida'),
  body('startTime')
    .notEmpty()
    .withMessage('Horário de início é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de horário inválido (use HH:MM)'),
  body('endTime')
    .notEmpty()
    .withMessage('Horário de término é obrigatório')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de horário inválido (use HH:MM)'),
  body('function')
    .notEmpty()
    .withMessage('Função é obrigatória')
    .isIn(['pregador', 'louvor', 'portaria', 'sonorizacao', 'multimedia', 'infantil', 'intercessao', 'recepcao', 'limpeza', 'outros'])
    .withMessage('Função inválida'),
  body('assignedTo')
    .notEmpty()
    .withMessage('Designação é obrigatória')
    .isMongoId()
    .withMessage('ID de usuário inválido'),
];

// Communication Validators
export const createCommunicationValidator: ValidationChain[] = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Assunto é obrigatório')
    .isLength({ max: 200 })
    .withMessage('Assunto deve ter no máximo 200 caracteres'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Mensagem é obrigatória'),
  body('recipients')
    .optional()
    .isArray()
    .withMessage('Destinatários devem ser um array'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
];

// Announcement Validators
export const createAnnouncementValidator: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ max: 200 })
    .withMessage('Título deve ter no máximo 200 caracteres'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Conteúdo é obrigatório'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  body('targetAudience')
    .optional()
    .isArray()
    .withMessage('Público-alvo deve ser um array'),
];

// Generic ID Validator
export const idValidator: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),
];

// Pagination Validators
export const paginationValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
];
