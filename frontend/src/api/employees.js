import api from './axios';

export const employeesAPI = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, search = '', organization = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(organization && { organization }),
    });
    const { data } = await api.get(`/employees?${queryParams}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/employees/${id}`);
    return data;
  },

  create: async (employeeData) => {
    const { data } = await api.post('/employees', employeeData);
    return data;
  },

  update: async (id, employeeData) => {
    const { data } = await api.patch(`/employees/${id}`, employeeData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  },
};

export default employeesAPI;
