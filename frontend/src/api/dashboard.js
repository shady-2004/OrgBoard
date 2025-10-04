import api from './axios';

export const dashboardAPI = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  // Use existing employee routes for expired/expiring employees
  getExpiredEmployees: async () => {
    const { data } = await api.get('/employees/residence/expired');
    return data;
  },

  getNearlyExpiredEmployees: async () => {
    const { data } = await api.get('/employees/residence/expiring-soon');
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
