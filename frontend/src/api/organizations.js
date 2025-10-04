import api from './axios';

export const organizationsAPI = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, ownerName = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(ownerName && { ownerName }),
    });
    const { data } = await api.get(`/organizations?${queryParams}`);
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

  getEmployees: async (id, params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const { data } = await api.get(`/organizations/${id}/employees?${queryParams}`);
    return data;
  },

  getEmployeesTotals: async (id) => {
    const { data } = await api.get(`/organizations/${id}/employees/totals`);
    return data;
  },

  getEmployeesCount: async (id) => {
    const { data } = await api.get(`/organizations/${id}/employees/count`);
    return data;
  },

  getEmployeesNamesAndIds: async (id) => {
    const { data } = await api.get(`/organizations/${id}/employees/names`);
    return data;
  },

  getDailyOperations: async (id, params = {}) => {
    const { page = 1, limit = 10, employeeName = '', startDate = '', endDate = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(employeeName && { employeeName }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const { data } = await api.get(`/organizations/${id}/daily-operations?${queryParams}`);
    return data;
  },

  getDailyOperationsCount: async (id) => {
    const { data } = await api.get(`/organizations/${id}/daily-operations/count`);
    return data;
  },

  getDailyOperationsTotals: async (id) => {
    const { data } = await api.get(`/organizations/${id}/daily-operations/totals`);
    return data;
  },

  getOrganizationDailyOperations: async (id, params = {}) => {
    const { page = 1, limit = 10, startDate = '', endDate = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const { data } = await api.get(`/organizations/${id}/organization-daily-operations?${queryParams}`);
    return data;
  },
};
