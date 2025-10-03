import api from './axios';

export const organizationsAPI = {
  getAll: async () => {
    const { data } = await api.get('/organizations');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/organizations/${id}`);
    return data;
  },

  getNamesAndIds: async () => {
    const { data } = await api.get('/organizations/names/ids');
    return data;
  },

  create: async (orgData) => {
    const { data } = await api.post('/organizations', orgData);
    return data;
  },

  update: async (id, orgData) => {
    const { data } = await api.patch(`/organizations/${id}`, orgData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/organizations/${id}`);
    return data;
  },

  getEmployees: async (id) => {
    const { data } = await api.get(`/organizations/${id}/employees`);
    return data;
  },

  getEmployeesTotals: async (id) => {
    const { data } = await api.get(`/organizations/${id}/employees/totals`);
    return data;
  },

  getDailyOperations: async (id) => {
    const { data } = await api.get(`/organizations/${id}/daily-operations`);
    return data;
  },
};
