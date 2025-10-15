import api from './axios';

export const dashboardAPI = {
  getStats: async (params = {}) => {
    const { data } = await api.get('/dashboard/stats', { params });
    return data;
  },

  getOfficeOperationsFinancials: async (params = {}) => {
    const { data } = await api.get('/dashboard/financials/office-operations', { params });
    return data;
  },

  getDailyOperationsFinancials: async (params = {}) => {
    const { data } = await api.get('/dashboard/financials/daily-operations', { params });
    return data;
  },

  // Use existing employee routes for expired/expiring employees
  getExpiredEmployees: async (params = {}) => {
    const { data } = await api.get('/employees/residence/expired', { params });
    return data;
  },

  getNearlyExpiredEmployees: async (params = {}) => {
    const { data } = await api.get('/employees/residence/expiring-soon', { params });
    return data;
  },

  getRecentActivities: async (limit = 10) => {
    const { data } = await api.get('/dashboard/activities', { params: { limit } });
    return data;
  },

  getOrganizationsTrend: async () => {
    const { data } = await api.get('/dashboard/trends/organizations');
    return data;
  },

  getOfficeOperationsTrend: async () => {
    const { data } = await api.get('/dashboard/trends/office-operations');
    return data;
  },
};
