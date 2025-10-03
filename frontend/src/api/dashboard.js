import api from './axios';

export const dashboardAPI = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  getRecentActivities: async () => {
    const { data } = await api.get('/dashboard/activities');
    return data;
  },

  getChartData: async (type) => {
    const { data } = await api.get(`/dashboard/charts/${type}`);
    return data;
  },
};
