import api from './axios';

export const dailyOperationsAPI = {
  getAll: async () => {
    const { data } = await api.get('/daily-operations');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/daily-operations/${id}`);
    return data;
  },

  create: async (operationData) => {
    const { data } = await api.post('/daily-operations', operationData);
    return data;
  },

  update: async (id, operationData) => {
    const { data } = await api.patch(`/daily-operations/${id}`, operationData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/daily-operations/${id}`);
    return data;
  },

  getToday: async () => {
    const { data } = await api.get('/daily-operations/today');
    return data;
  },

  getWeekly: async () => {
    const { data } = await api.get('/daily-operations/weekly');
    return data;
  },

  getMonthly: async () => {
    const { data } = await api.get('/daily-operations/monthly');
    return data;
  },

  getReports: async () => {
    const { data } = await api.get('/daily-operations/reports');
    return data;
  },
};
