import axios from 'axios';

// Criar instância personalizada do axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Interceptor de requisição - adiciona token JWT automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de resposta - trata erros 401 (não autenticado) e 429 (muitas requisições)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 429) {
            // Muitas requisições - Tratamento amigável
            const friendlyError = {
                ...error,
                message: 'Muitas tentativas. Por favor, aguarde um momento e tente novamente.'
            };
            return Promise.reject(friendlyError);
        }
        return Promise.reject(error);
    }
);

export default api;
