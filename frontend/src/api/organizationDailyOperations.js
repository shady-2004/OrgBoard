import api from './axios';

export const organizationDailyOperationsAPI = {
  getAll: async (params) => {
    const { data } = await api.get('/organization-daily-operations', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/organization-daily-operations/${id}`);
    return data;
  },

  create: async (operationData) => {
    const { data } = await api.post('/organization-daily-operations', operationData);
    return data;
  },

  update: async (id, operationData) => {
    const { data } = await api.patch(`/organization-daily-operations/${id}`, operationData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/organization-daily-operations/${id}`);
    return data;
  },
};

export default organizationDailyOperationsAPI;
