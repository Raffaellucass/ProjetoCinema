import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    register,
    login,
    requestPasswordReset,
    validateMathChallenge,
    resetPassword,
    getCurrentUser
} from '../controllers/authController';
import {
    registerValidator,
    loginValidator,
    requestPasswordResetValidator,
    validateChallengeValidator,
    resetPasswordValidator
} from '../validators/authValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Rate limiting para proteção contra força bruta
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Aumentado para 100 para testes de estresse
    message: 'Muitas tentativas de acesso. Por favor, aguarde alguns instantes e tente novamente.',
    standardHeaders: true,
    legacyHeaders: false
});

// Rotas públicas
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/forgot-password', requestPasswordResetValidator, requestPasswordReset);
router.post('/validate-challenge', validateChallengeValidator, validateMathChallenge);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Rotas protegidas
router.get('/me', authenticate, getCurrentUser);

export default router;
