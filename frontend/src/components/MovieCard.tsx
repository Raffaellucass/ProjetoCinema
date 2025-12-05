
import React from 'react';

interface Filme {
    _id: string;
    nome: string;
    descricao: string;
    ano: number;
    foto: string;
    sessoes?: { data: string; horarios: string[] }[];
}

interface MovieCardProps {
    filme: Filme;
    userRole?: 'user' | 'admin';
    onSelect: (filme: Filme) => void;
    onEdit: (filme: Filme) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const MovieCard = React.memo(({ filme, userRole, onSelect, onEdit, onDelete, isDeleting }: MovieCardProps) => {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
                <img
                    src={filme.foto || 'https://via.placeholder.com/300x200?text=Sem+imagem'}
                    alt={filme.nome}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                    onClick={() => onSelect(filme)}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('via.placeholder.com')) return;
                        target.src = 'https://via.placeholder.com/300x200?text=Imagem+n%C3%A3o+encontrada';
                    }}
                />
            </div>
            <div className="p-4">
                <h2
                    className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onSelect(filme)}
                >
                    {filme.nome}
                </h2>
                <p className="text-gray-600 mb-3 line-clamp-3">{filme.descricao}</p>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ano: {filme.ano}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSelect(filme)}
                            className="px-4 py-2 rounded-md text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700"
                        >
                            Ver Detalhes
                        </button>
                        {userRole === 'admin' && (
                            <>
                                <button
                                    onClick={() => onEdit(filme)}
                                    className="px-4 py-2 rounded-md text-white font-medium transition-colors bg-yellow-500 hover:bg-yellow-600"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(filme._id)}
                                    disabled={isDeleting}
                                    className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${isDeleting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MovieCard;
