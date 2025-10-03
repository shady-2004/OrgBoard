export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ITEMS_PER_PAGE = 10;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const EMPLOYEE_DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Sales',
  'Marketing',
  'Customer Service',
];

export const OPERATION_CATEGORIES = {
  REVENUE: 'revenue',
  EXPENSE: 'expense',
};
