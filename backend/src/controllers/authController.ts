import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendLoginNotification } from '../services/emailService';
import { generateChallenge, validateChallenge } from '../services/mathChallengeService';
import { AuthRequest } from '../middleware/authMiddleware';

// Registrar novo usuário
export const register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password, role } = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    message: 'Este e-mail já está cadastrado'
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    message: 'Este nome de usuário já está em uso'
                });
            }
        }

        // Criar novo usuário
        const newUser = new User({
            username,
            email,
            password, // Será hasheado automaticamente pelo pre-save hook
            role: role || 'user'
        });

        await newUser.save();

        // Gerar token JWT
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;
        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
            },
            jwtSecret,
            { expiresIn } as jwt.SignOptions
        );

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error: any) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({
            message: 'Erro ao registrar usuário',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password, role } = req.body;

        // Buscar usuário (incluindo senha)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'E-mail ou senha incorretos'
            });
        }

        // Verificar senha
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'E-mail ou senha incorretos'
            });
        }

        // SECURITY FIX: Validar se o perfil selecionado corresponde ao perfil do usuário no banco
        if (user.role !== role) {
            return res.status(403).json({
                message: 'Perfil inválido para este login. Verifique o tipo de perfil selecionado.'
            });
        }

        // Gerar token JWT
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            jwtSecret,
            { expiresIn } as jwt.SignOptions
        );

        // Enviar notificação de login por e-mail (assíncrono, não bloqueia resposta)
        sendLoginNotification(user.email, user.username, user.role).catch(err => {
            console.error('Erro ao enviar e-mail de notificação:', err);
        });

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({
            message: 'Erro ao fazer login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Solicitar redefinição de senha (gera desafio matemático)
export const requestPasswordReset = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;

        // Verificar se usuário existe
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'E-mail não encontrado, tente novamente.'
            });
        }

        // Gerar desafio matemático
        const challenge = generateChallenge();

        // Adicionar email ao token do desafio
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const expiresIn = '5m' as string;
        const challengeToken = jwt.sign(
            {
                answer: challenge.answer,
                email: user.email,
                timestamp: Date.now()
            },
            jwtSecret,
            { expiresIn } as jwt.SignOptions
        );

        res.json({
            message: 'Desafio gerado com sucesso',
            challenge: challenge.question,
            challengeToken
        });
    } catch (error: any) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({
            message: 'Erro ao processar solicitação',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Validar resposta do desafio
export const validateMathChallenge = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { challengeToken, answer } = req.body;

        const result = validateChallenge(challengeToken, parseInt(answer));

        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        res.json({
            message: result.message,
            resetToken: result.resetToken
        });
    } catch (error: any) {
        console.error('Erro ao validar desafio:', error);
        res.status(500).json({
            message: 'Erro ao validar desafio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Redefinir senha
export const resetPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { resetToken, newPassword } = req.body;

        // Verificar token de redefinição
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(resetToken, jwtSecret) as {
            email: string;
            purpose: string
        };

        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({
                message: 'Token inválido para redefinição de senha'
            });
        }

        // Buscar usuário
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({
                message: 'Usuário não encontrado'
            });
        }

        // Atualizar senha
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Senha redefinida com sucesso. Faça login com sua nova senha.'
        });
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                message: 'Token expirado. Solicite uma nova redefinição de senha.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                message: 'Token inválido'
            });
        }

        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({
            message: 'Erro ao redefinir senha',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obter dados do usuário autenticado
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuário não autenticado'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error: any) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            message: 'Erro ao buscar dados do usuário',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
