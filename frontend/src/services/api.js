import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

// Interceptor para capturar e atualizar o token
api.interceptors.response.use(
  (response) => {
    // Verificar se há um novo token no header
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      // Salvar o novo token no localStorage
      localStorage.setItem('token', newToken);
      console.log('Token atualizado automaticamente');
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para adicionar o token em todas as requisições
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

export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL
  
});

export default api;
