import api from './axios';

export const settingsAPI = {
  getAll: async () => {
    const { data } = await api.get('/settings');
    return data;
  },

  update: async (settingsData) => {
    const { data } = await api.put('/settings', settingsData);
    return data;
  },

  getGeneral: async () => {
    const { data } = await api.get('/settings/general');
    return data;
  },

  updateGeneral: async (generalData) => {
    const { data } = await api.put('/settings/general', generalData);
    return data;
  },

  getPermissions: async () => {
    const { data } = await api.get('/settings/permissions');
    return data;
  },

  updatePermissions: async (permissionsData) => {
    const { data } = await api.put('/settings/permissions', permissionsData);
    return data;
  },

  getNotifications: async () => {
    const { data } = await api.get('/settings/notifications');
    return data;
  },

  updateNotifications: async (notificationsData) => {
    const { data } = await api.put('/settings/notifications', notificationsData);
    return data;
  },

  getSecurity: async () => {
    const { data } = await api.get('/settings/security');
    return data;
  },

  updateSecurity: async (securityData) => {
    const { data } = await api.put('/settings/security', securityData);
    return data;
  },
};
