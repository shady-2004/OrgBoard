/**
 * Permission utilities for role-based access control
 * 
 * Roles:
 * - admin: Full access (create, read, update, delete)
 * - moderator (مشرف): Can create, read, and update (no delete)
 * - user: Can create and read only (no update or delete)
 */

export const canDelete = (userRole) => {
  return userRole === 'admin';
};

export const canEdit = (userRole) => {
  return userRole === 'admin' || userRole === 'moderator';
};

export const canCreate = (userRole) => {
  return userRole === 'admin' || userRole === 'moderator' || userRole === 'user';
};

export const isAdmin = (userRole) => {
  return userRole === 'admin';
};

export const isModerator = (userRole) => {
  return userRole === 'moderator';
};

export const isUser = (userRole) => {
  return userRole === 'user';
};

/**
 * Get role display name in Arabic
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: 'مدير',
    moderator: 'مشرف',
    user: 'مستخدم',
  };
  return roleNames[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    moderator: 'bg-green-100 text-green-800',
    user: 'bg-blue-100 text-blue-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
