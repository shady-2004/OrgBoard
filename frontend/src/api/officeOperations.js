import api from './axios';

export const officeOperationsAPI = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/office-operations', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/office-operations/${id}`);
    return data;
  },

  create: async (operationData) => {
    const { data } = await api.post('/office-operations', operationData);
    return data;
  },

  update: async (id, operationData) => {
    const { data } = await api.patch(`/office-operations/${id}`, operationData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/office-operations/${id}`);
    return data;
  },

  getDepartments: async () => {
    const { data } = await api.get('/office-operations/departments');
    return data;
  },

  getFacilities: async () => {
    const { data } = await api.get('/office-operations/facilities');
    return data;
  },

  getMaintenance: async () => {
    const { data } = await api.get('/office-operations/maintenance');
    return data;
  },

  getResources: async () => {
    const { data } = await api.get('/office-operations/resources');
    return data;
  },
};
