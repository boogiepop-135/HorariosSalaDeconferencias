import axios from 'axios';

// En producción (Railway), usar rutas relativas ya que frontend y backend están en el mismo dominio
// En desarrollo, usar localhost
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const horariosService = {
  // Obtener todos los horarios
  getAll: async (params = {}) => {
    const response = await api.get('/horarios', { params });
    return response.data;
  },

  // Obtener un horario por ID
  getById: async (id) => {
    const response = await api.get(`/horarios/${id}`);
    return response.data;
  },

  // Crear un nuevo horario
  create: async (horario) => {
    const response = await api.post('/horarios', horario);
    return response.data;
  },

  // Actualizar un horario
  update: async (id, horario) => {
    const response = await api.put(`/horarios/${id}`, horario);
    return response.data;
  },

  // Eliminar un horario
  delete: async (id) => {
    const response = await api.delete(`/horarios/${id}`);
    return response.data;
  },
};

export default api;

