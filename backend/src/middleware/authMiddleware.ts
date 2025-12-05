import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender a interface Request para incluir user
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        role: 'user' | 'admin';
    };
}

// Middleware de autenticação - verifica JWT
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Pegar token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Acesso negado. Token não fornecido.'
            });
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        // Verificar token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                message: 'Erro de configuração do servidor'
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as {
            id: string;
            email: string;
            username: string;
            role: 'user' | 'admin';
        };

        // Adicionar dados do usuário à requisição
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expirado. Faça login novamente.'
            });
        }
        return res.status(401).json({
            message: 'Falha na autenticação'
        });
    }
};

// Middleware de autorização - verifica roles
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuário não autenticado'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Acesso negado. Você não tem permissão para realizar esta ação.'
            });
        }

        next();
    };
};
