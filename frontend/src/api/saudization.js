import api from './axios';

export const saudizationAPI = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/saudization', { params });
    return data;
  },

  create: async (saudizationData) => {
    const { data } = await api.post('/saudization', saudizationData);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/saudization/${id}`);
    return data;
  },

  update: async (id, saudizationData) => {
    const { data } = await api.patch(`/saudization/${id}`, saudizationData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/saudization/${id}`);
    return data;
  },
};
