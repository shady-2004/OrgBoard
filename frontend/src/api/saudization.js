import api from './axios';

export const saudizationAPI = {
  getAll: async () => {
    const { data } = await api.get('/saudization');
    return data;
  },

  create: async (saudizationData) => {
    const { data } = await api.post('/saudization', saudizationData);
    return data;
  },

  getCompliance: async () => {
    const { data } = await api.get('/saudization/compliance');
    return data;
  },

  getReports: async () => {
    const { data } = await api.get('/saudization/reports');
    return data;
  },

  getTargets: async () => {
    const { data } = await api.get('/saudization/targets');
    return data;
  },

  updateTargets: async (targetsData) => {
    const { data } = await api.put('/saudization/targets', targetsData);
    return data;
  },

  getStatistics: async () => {
    const { data } = await api.get('/saudization/statistics');
    return data;
  },

  getQuotas: async () => {
    const { data } = await api.get('/saudization/quotas');
    return data;
  },

  updateQuotas: async (quotasData) => {
    const { data } = await api.put('/saudization/quotas', quotasData);
    return data;
  },
};
