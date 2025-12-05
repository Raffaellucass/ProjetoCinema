import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<'user' | 'admin'>('user');

    // Campos do formulário
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCachePrompt, setShowCachePrompt] = useState(false);
    const [cachedData, setCachedData] = useState<{ username: string, email: string } | null>(null);

    const navigate = useNavigate();
    const { login, register } = useAuth();

    // Check for cached values on component mount
    useEffect(() => {
        const cachedUsername = localStorage.getItem('cached_username');
        const cachedEmail = localStorage.getItem('cached_email');

        if (cachedUsername || cachedEmail) {
            setCachedData({
                username: cachedUsername || '',
                email: cachedEmail || ''
            });
            setShowCachePrompt(true);
        }
    }, []);

    // Use cached data
    const useCachedData = () => {
        if (cachedData) {
            if (cachedData.username) setUsername(cachedData.username);
            if (cachedData.email) setEmail(cachedData.email);
        }
        setShowCachePrompt(false);
    };

    // Decline cached data
    const declineCachedData = () => {
        setShowCachePrompt(false);
    };

    // Handler functions that save to localStorage
    const handleUsernameChange = (value: string) => {
        setUsername(value);
        localStorage.setItem('cached_username', value);
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        localStorage.setItem('cached_email', value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password, role);
                setSuccess('Login realizado com sucesso!');
                setTimeout(() => navigate('/'), 1000);
            } else {
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem');
                }
                await register(username, email, password, confirmPassword, role);
                setSuccess('Cadastro realizado com sucesso!');
                setTimeout(() => navigate('/'), 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro');
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
                {/* Card principal com glassmorphism */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    {/* Header com ícone */}
                    <div className="backdrop-blur-md bg-white/20 border-b border-white/20 p-8 text-center">
                        <div className="text-6xl mb-3">🎬</div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            CINEMA FODÁSTICO
                        </h1>
                        <p className="text-white/90">
                            {isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
                        </p>
                    </div>

                    {/* Formulário */}
                    <div className="p-8">
                        {/* Toggle Login/Registro */}
                        <div className="flex mb-6">
                            <button
                                onClick={() => {
                                    setIsLogin(true);
                                    setError('');
                                    setSuccess('');
                                }}
                                className={`flex-1 py-2 px-4 font-medium transition-all duration-200 ${isLogin
                                    ? 'bg-white/20 text-white backdrop-blur-sm'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    } rounded-l-lg`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setIsLogin(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className={`flex-1 py-2 px-4 font-medium transition-all duration-200 ${!isLogin
                                    ? 'bg-white/20 text-white backdrop-blur-sm'
                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    } rounded-r-lg`}
                            >
                                Cadastro
                            </button>
                        </div>

                        {/* Cache Prompt */}
                        {showCachePrompt && (
                            <div className="mb-4 p-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white mb-1">
                                            📋 Dados salvos encontrados
                                        </p>
                                        <p className="text-xs text-white/80">
                                            Deseja preencher com seus dados anteriores?
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={useCachedData}
                                            className="px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
                                        >
                                            Sim
                                        </button>
                                        <button
                                            onClick={declineCachedData}
                                            className="px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 rounded transition-colors"
                                        >
                                            Não
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nome de usuário (apenas no cadastro) */}
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nome de Usuário
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        className="input"
                                        placeholder="Digite seu nome de usuário"
                                        required={!isLogin}
                                        minLength={3}
                                        maxLength={20}
                                    />
                                </div>
                            )}

                            {/* E-mail */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    E-mail
                                </label>
                                {isLogin ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        className="input w-full"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                ) : (
                                    <div className="flex relative">
                                        <input
                                            type="text"
                                            value={email.replace('@gmail.com', '')}
                                            onChange={(e) => {
                                                // Remove @ to prevent user from trying to type domain
                                                const val = e.target.value.replace(/@/g, '');
                                                handleEmailChange(val + '@gmail.com');
                                            }}
                                            className="input w-full rounded-r-none pr-32"
                                            placeholder="usuario"
                                            required
                                            minLength={3}
                                        />
                                        <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gray-800 border border-l-0 border-gray-300 rounded-r-md text-white text-sm select-none pointer-events-none">
                                            @gmail.com
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                            {/* Confirmar senha (apenas no cadastro) */}
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input pr-10"
                                            placeholder="••••••••"
                                            required={!isLogin}
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
                            )}

                            {/* Toggle de Role */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-white mb-3">
                                    Tipo de Perfil
                                </label>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${role === 'user' ? 'text-white' : 'text-white/50'}`}>
                                        Usuário Comum
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setRole(role === 'user' ? 'admin' : 'user')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${role === 'admin' ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                    <span className={`text-sm font-medium ${role === 'admin' ? 'text-white' : 'text-white/50'}`}>
                                        Administrador
                                    </span>
                                </div>
                            </div>

                            {/* Botão de submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="loading-spinner w-5 h-5 mr-2"></div>
                                        Processando...
                                    </div>
                                ) : (
                                    isLogin ? 'Entrar' : 'Cadastrar'
                                )}
                            </button>
                        </form>

                        {/* Link para redefinir senha (apenas no login) */}
                        {isLogin && (
                            <div className="mt-4 text-center">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-white hover:text-white/80 font-medium"
                                >
                                    Esqueci minha senha
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white text-sm mt-6 opacity-90">
                    © {new Date().getFullYear()} CINEMA FODÁSTICO
                </p>
            </div>
        </div>
    );
}
