import api from './axios';

export const usersAPI = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id, userData) => {
    const { data } = await api.patch(`/users/${id}`, userData);
    return data;
  },

  delete: async (id) => {
    const { data} = await api.delete(`/users/${id}`);
    return data;
  },

  resetPassword: async (id) => {
    const { data } = await api.patch(`/users/${id}/reset-password`);
    return data;
  },
};
