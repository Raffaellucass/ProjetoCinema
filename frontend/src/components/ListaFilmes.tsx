import { useState } from 'react';
import api from '../utils/api';

interface Filme {
  _id: string;
  nome: string;
  descricao: string;
  ano: number;
  foto: string;
  sessoes?: { data: string; horarios: string[] }[];
}

interface ListaFilmesProps {
  filmes: Filme[];
  onChange: () => void;
  onEdit: (filme: Filme) => void;
  userRole?: 'user' | 'admin';
}

function ListaFilmes({ filmes, onChange, onEdit, userRole }: ListaFilmesProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Filme | null>(null);

  const deletar = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este filme?')) {
      return;
    }

    try {
      setLoadingId(id);
      setError(null);
      await api.delete(`/api/filmes/${id}`);
      onChange();
    } catch (err) {
      setError('Erro ao excluir o filme. Tente novamente.');
      console.error('Erro ao deletar filme:', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (filmes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum filme cadastrado. {userRole === 'admin' ? 'Adicione um novo filme acima!' : ''}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filmes.map((filme) => (
          <div key={filme._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img
                src={filme.foto || 'https://via.placeholder.com/300x200?text=Sem+imagem'}
                alt={filme.nome}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedMovie(filme)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Previne loop infinito se a imagem de erro também falhar
                  if (target.src.includes('via.placeholder.com')) return;
                  target.src = 'https://via.placeholder.com/300x200?text=Imagem+n%C3%A3o+encontrada';
                }}
              />
            </div>
            <div className="p-4">
              <h2
                className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setSelectedMovie(filme)}
              >
                {filme.nome}
              </h2>
              <p className="text-gray-600 mb-3 line-clamp-3">{filme.descricao}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Ano: {filme.ano}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMovie(filme)}
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
                        onClick={() => deletar(filme._id)}
                        disabled={loadingId === filme._id}
                        className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${loadingId === filme._id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                          }`}
                      >
                        {loadingId === filme._id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Sessões */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMovie.nome}</h3>
            <p className="text-gray-500 text-sm mb-4">Ano de Lançamento: {selectedMovie.ano}</p>

            <div className="mb-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Sinopse
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedMovie.descricao}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Sessões Disponíveis
                </h4>

                {!selectedMovie.sessoes || selectedMovie.sessoes.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhuma sessão disponível para este filme.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedMovie.sessoes.map((sessao, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-900">{sessao.data}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sessao.horarios.map((horario, hIdx) => (
                            <span
                              key={hIdx}
                              className="px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-sm font-medium shadow-sm"
                            >
                              {horario}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMovie(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaFilmes;
