import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormFilme from './FormFilme';
import ListaFilmes from './ListaFilmes';
import api from '../utils/api';

export interface Filme {
    _id: string;
    nome: string;
    descricao: string;
    ano: number;
    foto: string;
    __v?: number;
}

export default function Dashboard() {
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [atualizar, setAtualizar] = useState(false);
    const [filmeEmEdicao, setFilmeEmEdicao] = useState<Filme | null>(null);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchFilmes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterYear) params.append('ano', filterYear);

            const response = await api.get<{ data: Filme[] }>(`/api/filmes?${params.toString()}`);
            setFilmes(response.data.data);
        } catch (err) {
            console.error('Erro ao buscar filmes:', err);
            setError('Não foi possível carregar a lista de filmes. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Debounce para a busca
        const timeoutId = setTimeout(() => {
            fetchFilmes();
        }, 500);

        return () => clearTimeout(timeoutId);
        return () => clearTimeout(timeoutId);
    }, [atualizar, searchTerm, filterYear]);

    const handleAction = () => {
        setAtualizar(prev => !prev);
        setFilmeEmEdicao(null);
    };

    const handleEdit = (filme: Filme) => {
        setFilmeEmEdicao(filme);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFilmeEmEdicao(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/login-bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header com info do usuário */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🎬</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Catálogo de Filmes
                                </h1>
                                <p className="text-gray-600">
                                    Bem-vindo, <span className="font-semibold">{user?.username}</span>!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {user?.role === 'admin' ? '👑 Administrador' : '👤 Usuário'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Formulário (apenas para admin) */}
                {user?.role === 'admin' && (
                    <div className="mb-8">
                        <FormFilme
                            onAction={handleAction}
                            filmeParaEditar={filmeEmEdicao}
                            onCancelEdit={handleCancelEdit}
                        />
                    </div>
                )}

                {/* Lista de filmes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        🍿 Filmes Disponíveis
                    </h2>

                    {/* Barra de Pesquisa e Filtros */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Buscar por Nome
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Digite o nome do filme..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700 mb-1">
                                    Filtrar por Ano
                                </label>
                                <input
                                    id="filterYear"
                                    type="number"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    placeholder="Ex: 2025"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="loading-spinner w-12 h-12"></div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-error">
                            <div className="flex items-start">
                                <svg className="h-5 w-5 text-red-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                    <button
                                        onClick={fetchFilmes}
                                        className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 transition-colors"
                                    >
                                        Tentar novamente →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ListaFilmes
                            filmes={filmes}
                            onChange={handleAction}
                            onEdit={handleEdit}
                            userRole={user?.role}
                        />
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Catálogo de Filmes. Todos os direitos reservados.</p>
                </footer>
            </div>
        </div>
    );
}
