import { body } from 'express-validator';

// Validador de registro
export const registerValidator = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('O nome de usuário deve ter entre 3 e 20 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('O nome de usuário pode conter apenas letras, números e underscore'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Por favor, insira um e-mail válido')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('A senha deve ter no mínimo 6 caracteres'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('As senhas não coincidem'),

    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Tipo de perfil inválido')
];

// Validador de login
export const loginValidator = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Por favor, insira um e-mail válido')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('A senha é obrigatória')
];

// Validador de solicitação de redefinição de senha
export const requestPasswordResetValidator = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Por favor, insira um e-mail válido')
        .normalizeEmail()
];

// Validador de validação de desafio
export const validateChallengeValidator = [
    body('challengeToken')
        .notEmpty()
        .withMessage('Token do desafio é obrigatório'),

    body('answer')
        .isInt()
        .withMessage('A resposta deve ser um número inteiro')
];

// Validador de redefinição de senha
export const resetPasswordValidator = [
    body('resetToken')
        .notEmpty()
        .withMessage('Token de redefinição é obrigatório'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('A nova senha deve ter no mínimo 6 caracteres'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage('As senhas não coincidem')
];
