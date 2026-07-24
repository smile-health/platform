export const isSuperAdmin = (role: string): boolean => role === 'super_admin';
export const isAdmin = (role: string): boolean => role === 'admin' || role === 'manager';
export const isOperator = (role: string): boolean =>
  role === 'sanitarian' || role.startsWith('operator');
export const isManager = (role: string): boolean => role === 'manager';
export const isOnlyAdmin = (role: string): boolean => role === 'admin';
