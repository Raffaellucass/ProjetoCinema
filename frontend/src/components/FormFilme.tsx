import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import api from '../utils/api';

interface FormData {
  nome: string;
  descricao: string;
  ano: string;
  foto: string;
  sessoes: { data: string; horarios: string[] }[];
}

interface Filme {
  _id: string;
  nome: string;
  descricao: string;
  ano: number;
  foto: string;
  sessoes?: { data: string; horarios: string[] }[];
}

interface FormFilmeProps {
  onAction: () => void;
  filmeParaEditar?: Filme | null;
  onCancelEdit?: () => void;
}

function FormFilme({ onAction, filmeParaEditar, onCancelEdit }: FormFilmeProps) {
  const [form, setForm] = useState<FormData>({
    nome: '',
    descricao: '',
    ano: '',
    foto: '',
    sessoes: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (filmeParaEditar) {
      setForm({
        nome: filmeParaEditar.nome,
        descricao: filmeParaEditar.descricao,
        ano: filmeParaEditar.ano.toString(),
        foto: filmeParaEditar.foto || '',
        sessoes: filmeParaEditar.sessoes || []
      });
    } else {
      setForm({ nome: '', descricao: '', ano: '', foto: '', sessoes: [] });
    }
  }, [filmeParaEditar]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleAddSession = () => {
    setForm(prev => ({
      ...prev,
      sessoes: [...prev.sessoes, { data: '', horarios: [''] }]
    }));
  };

  const handleRemoveSession = (index: number) => {
    setForm(prev => ({
      ...prev,
      sessoes: prev.sessoes.filter((_, i) => i !== index)
    }));
  };

  const handleSessionDateChange = (index: number, value: string) => {
    setForm(prev => {
      const newSessoes = [...prev.sessoes];
      newSessoes[index].data = value;
      return { ...prev, sessoes: newSessoes };
    });
  };

  const handleAddTime = (sessionIndex: number) => {
    setForm(prev => {
      const newSessoes = [...prev.sessoes];
      newSessoes[sessionIndex].horarios.push('');
      return { ...prev, sessoes: newSessoes };
    });
  };

  const handleRemoveTime = (sessionIndex: number, timeIndex: number) => {
    setForm(prev => {
      const newSessoes = [...prev.sessoes];
      newSessoes[sessionIndex].horarios = newSessoes[sessionIndex].horarios.filter((_, i) => i !== timeIndex);
      return { ...prev, sessoes: newSessoes };
    });
  };

  const handleTimeChange = (sessionIndex: number, timeIndex: number, value: string) => {
    setForm(prev => {
      const newSessoes = [...prev.sessoes];
      newSessoes[sessionIndex].horarios[timeIndex] = value;
      return { ...prev, sessoes: newSessoes };
    });
  };

  const validateDate = (date: string): boolean => {
    // Formato dd/MM/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(date)) return false;

    const [, day, month, year] = date.match(regex) || [];
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;

    const dateObj = new Date(y, m - 1, d);
    return dateObj.getDate() === d && dateObj.getMonth() === m - 1 && dateObj.getFullYear() === y;
  };

  const validateTime = (time: string): boolean => {
    // Formato HH:mm
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  const validateForm = (): boolean => {
    if (!form.nome.trim()) {
      setError('O nome do filme é obrigatório');
      return false;
    }
    if (!form.descricao.trim()) {
      setError('A descrição é obrigatória');
      return false;
    }
    if (!form.ano) {
      setError('O ano é obrigatório');
      return false;
    }
    const year = parseInt(form.ano);
    if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
      setError('Ano inválido');
      return false;
    }
    if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
      setError('Ano inválido');
      return false;
    }

    // Validação de Sessões
    for (const sessao of form.sessoes) {
      if (!sessao.data) {
        setError('A data da sessão é obrigatória');
        return false;
      }
      if (!validateDate(sessao.data)) {
        setError(`Data inválida: ${sessao.data}. Use o formato dd/MM/yyyy`);
        return false;
      }
      if (sessao.horarios.length === 0) {
        setError(`Adicione pelo menos um horário para a data ${sessao.data}`);
        return false;
      }
      for (const horario of sessao.horarios) {
        if (!horario) {
          setError(`Horário obrigatório para a data ${sessao.data}`);
          return false;
        }
        if (!validateTime(horario)) {
          setError(`Horário inválido: ${horario}. Use o formato HH:mm`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...form,
        ano: parseInt(form.ano)
      };

      if (filmeParaEditar) {
        await api.put(`/api/filmes/${filmeParaEditar._id}`, payload);
      } else {
        await api.post('/api/filmes', payload);
      }

      setSuccess(true);

      if (!filmeParaEditar) {
        setForm({ nome: '', descricao: '', ano: '', foto: '', sessoes: [] });
      }

      onAction();

      setTimeout(() => {
        setSuccess(false);
        if (filmeParaEditar && onCancelEdit) {
          onCancelEdit();
        }
      }, 2000);

    } catch (err: any) {
      console.error('Erro ao salvar filme:', err);

      let errorMessage = 'Erro ao salvar o filme. Tente novamente.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors[0]?.msg || err.response.data.errors[0];
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {filmeParaEditar ? 'Editar Filme' : 'Adicionar Novo Filme'}
        </h2>
        {filmeParaEditar && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Filme {filmeParaEditar ? 'atualizado' : 'cadastrado'} com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Filme *
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={form.nome}
            onChange={handleChange}
            placeholder="Ex: O Poderoso Chefão"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={3}
            placeholder="Sinopse do filme..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
              Ano de Lançamento *
            </label>
            <input
              id="ano"
              name="ano"
              type="number"
              min="1888"
              max={new Date().getFullYear() + 5}
              value={form.ano}
              onChange={handleChange}
              placeholder="Ex: 2023"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem
            </label>
            <input
              id="foto"
              name="foto"
              type="url"
              value={form.foto}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Seção de Sessões */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sessões</h3>
            <button
              type="button"
              onClick={handleAddSession}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Adicionar Data
            </button>
          </div>

          {form.sessoes.length === 0 && (
            <p className="text-sm text-gray-500 italic mb-4">Nenhuma sessão cadastrada.</p>
          )}

          <div className="space-y-6">
            {form.sessoes.map((sessao, sIndex) => (
              <div key={sIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveSession(sIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remover Data"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Exibição (dd/MM/yyyy)
                  </label>
                  <input
                    type="text"
                    value={sessao.data}
                    onChange={(e) => handleSessionDateChange(sIndex, e.target.value)}
                    placeholder="Ex: 01/01/2025"
                    className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horários
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {sessao.horarios.map((horario, hIndex) => (
                      <div key={hIndex} className="relative">
                        <input
                          type="text"
                          value={horario}
                          onChange={(e) => handleTimeChange(sIndex, hIndex, e.target.value)}
                          placeholder="HH:mm"
                          className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                        />
                        {sessao.horarios.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(sIndex, hIndex)}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddTime(sIndex)}
                      className="p-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 border border-purple-200"
                      title="Adicionar Horário"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting
              ? 'bg-purple-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
          >
            {isSubmitting ? 'Salvando...' : (filmeParaEditar ? 'Salvar Alterações' : 'Cadastrar Filme')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormFilme;
