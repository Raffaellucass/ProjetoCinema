import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

// Componente de Error Boundary para capturar erros de renderização
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    <h2 className="font-bold mb-2">Algo deu errado.</h2>
                    <p className="font-mono text-sm">{this.state.error?.toString()}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function ForgotPassword() {
    return (
        <ErrorBoundary>
            <ForgotPasswordContent />
        </ErrorBoundary>
    );
}

function ForgotPasswordContent() {
    const [step, setStep] = useState(1); // 1: email, 2: desafio, 3: nova senha
    const [email, setEmail] = useState('');
    const [challenge, setChallenge] = useState('');
    const [challengeToken, setChallengeToken] = useState('');
    const [answer, setAnswer] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleRequestChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            console.log('Forgot Password Response:', response.data);

            if (response.data.challenge) {
                setChallenge(String(response.data.challenge));
                setChallengeToken(response.data.challengeToken);
                setStep(2);
            } else {
                console.error('Challenge missing in response:', response.data);
                setError('Erro inesperado: Desafio não recebido do servidor.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao solicitar redefinição');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/validate-challenge', {
                challengeToken,
                answer: parseInt(answer)
            });
            setResetToken(response.data.resetToken);
            setStep(3);
            setSuccess('Resposta correta! Agora defina sua nova senha.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Resposta incorreta');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/auth/reset-password', {
                resetToken,
                newPassword,
                confirmPassword
            });
            setSuccess('Senha redefinida com sucesso! Redirecionando...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/login-bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            <div className="max-w-md w-full relative z-10">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="backdrop-blur-md bg-white/20 border-b border-white/20 p-8 text-center">
                        <div className="text-6xl mb-3">🔒</div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Redefinir Senha
                        </h1>
                        <p className="text-white/90">
                            {step === 1 && <span>Informe seu e-mail</span>}
                            {step === 2 && <span>Resolva o desafio</span>}
                            {step === 3 && <span>Defina nova senha</span>}
                        </p>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-8">
                        {/* Progress bar */}
                        <div className="flex items-center justify-center mb-6">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-white/30 text-white' : 'bg-white/20 text-white/50'}`}>
                                1
                            </div>
                            <div className={`w-16 h-1 ${step >= 2 ? 'bg-white/30' : 'bg-white/20'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-white/30 text-white' : 'bg-white/20 text-white/50'}`}>
                                2
                            </div>
                            <div className={`w-16 h-1 ${step >= 3 ? 'bg-white/30' : 'bg-white/20'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-white/30 text-white' : 'bg-white/20 text-white/50'}`}>
                                3
                            </div>
                        </div>

                        {/* Alertas */}
                        {error && (
                            <div className="alert alert-error mb-4">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success mb-4">
                                <p className="text-sm">{success}</p>
                            </div>
                        )}

                        {/* Etapa 1: E-mail */}
                        {step === 1 && (
                            <form key="step1" onSubmit={handleRequestChallenge} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        E-mail Cadastrado
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? 'Processando...' : 'Continuar'}
                                </button>
                            </form>
                        )}

                        {/* Etapa 2: Desafio Matemático */}
                        {step === 2 && (
                            <form key="step2" onSubmit={handleValidateChallenge} className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-6 text-center">
                                    <p className="text-sm text-white/80 mb-3">Resolva o desafio:</p>
                                    <p className="text-3xl font-bold text-white">{challenge}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Sua Resposta
                                    </label>
                                    <input
                                        type="number"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="input text-center text-2xl font-bold"
                                        placeholder="?"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? 'Verificando...' : 'Verificar Resposta'}
                                </button>
                            </form>
                        )}

                        {/* Etapa 3: Nova Senha */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input pr-10"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input pr-10"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? 'Salvando...' : 'Redefinir Senha'}
                                </button>
                            </form>
                        )}

                        {/* Link para voltar ao login */}
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-sm text-white hover:text-white/80 font-medium"
                            >
                                ← Voltar para o login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
