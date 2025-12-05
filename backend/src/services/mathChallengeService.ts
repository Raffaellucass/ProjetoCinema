import jwt from 'jsonwebtoken';

interface MathChallenge {
    question: string;
    answer: number;
    token: string;
}

// Gerar desafio matemático aleatório
export const generateChallenge = (): MathChallenge => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number, num2: number, answer: number, question: string;

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
            question = `Quanto é ${num1} + ${num2}?`;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 50) + 20; // Garantir número positivo
            num2 = Math.floor(Math.random() * num1); // num2 menor que num1
            answer = num1 - num2;
            question = `Quanto é ${num1} - ${num2}?`;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 * num2;
            question = `Quanto é ${num1} × ${num2}?`;
            break;
        default:
            num1 = 5;
            num2 = 5;
            answer = 10;
            question = `Quanto é ${num1} + ${num2}?`;
    }

    // Gerar token JWT com a resposta (válido por 5 minutos)
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = '5m' as string;
    const token = jwt.sign(
        { answer, timestamp: Date.now() },
        jwtSecret,
        { expiresIn } as jwt.SignOptions
    );

    return { question, answer, token };
};

// Validar resposta do desafio
export const validateChallenge = (
    token: string,
    userAnswer: number
): { valid: boolean; message: string; resetToken?: string; email?: string } => {
    try {
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, jwtSecret) as {
            answer: number;
            timestamp: number;
            email?: string;
        };

        // Verificar se a resposta está correta
        if (decoded.answer !== userAnswer) {
            return {
                valid: false,
                message: 'Resposta incorreta. Tente novamente.'
            };
        }

        // Gerar token de redefinição de senha (válido por 15 minutos)
        const expiresIn = '15m' as string;
        const resetToken = jwt.sign(
            { email: decoded.email, purpose: 'password-reset' },
            jwtSecret,
            { expiresIn } as jwt.SignOptions
        );

        return {
            valid: true,
            message: 'Resposta correta!',
            resetToken,
            email: decoded.email
        };
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return {
                valid: false,
                message: 'Desafio expirado. Solicite um novo desafio.'
            };
        }
        return {
            valid: false,
            message: 'Token inválido. Solicite um novo desafio.'
        };
    }
};
