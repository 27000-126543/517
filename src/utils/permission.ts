import type { UserRole, Contract } from '../types';

interface PermissionCheck {
  role: UserRole;
  departmentId: string;
  id: string;
}

export function canViewContract(contract: Contract, user: PermissionCheck): boolean {
  if (user.role === 'admin' || user.role === 'legal') {
    return true;
  }
  
  if (user.role === 'manager') {
    return contract.departmentId === user.departmentId;
  }
  
  if (user.role === 'operator') {
    return contract.creatorId === user.id;
  }
  
  return false;
}

export function canEditContract(contract: Contract, user: PermissionCheck): boolean {
  if (user.role === 'admin') {
    return true;
  }
  
  if (contract.status !== 'draft') {
    return false;
  }
  
  if (user.role === 'legal') {
    return false;
  }
  
  if (user.role === 'manager') {
    return contract.departmentId === user.departmentId;
  }
  
  if (user.role === 'operator') {
    return contract.creatorId === user.id;
  }

  return false;
}

export function canSubmitApproval(contract: Contract, user: PermissionCheck): boolean {
  if (contract.status !== 'draft' && contract.status !== 'pending_approval' && contract.status !== 'rejected') {
    return false;
  }
  
  if (user.role === 'admin' || user.role === 'legal') {
    return true;
  }
  
  if (user.role === 'manager') {
    return contract.departmentId === user.departmentId;
  }
  
  if (user.role === 'operator') {
    return contract.creatorId === user.id;
  }

  return false;
}

export function canApprove(userRole: UserRole): boolean {
  return userRole === 'manager' || userRole === 'legal' || userRole === 'admin';
}

export function canManageTemplates(userRole: UserRole): boolean {
  return userRole === 'legal' || userRole === 'admin';
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function canManageRules(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function canRequestChange(contract: Contract, user: PermissionCheck): boolean {
  if (contract.status !== 'performing' && contract.status !== 'signed') {
    return false;
  }
  
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'legal') {
    return false;
  }
  
  if (user.role === 'manager') {
    return contract.departmentId === user.departmentId;
  }
  
  if (user.role === 'operator') {
    return contract.creatorId === user.id;
  }

  return false;
}

export function canExport(userRole: UserRole): boolean {
  return true;
}

export function getRoutePermission(route: string, userRole: UserRole): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['operator', 'manager', 'legal', 'admin'],
    '/contracts': ['operator', 'manager', 'legal', 'admin'],
    '/contracts/create': ['operator', 'manager', 'legal', 'admin'],
    '/approval/pending': ['manager', 'legal', 'admin'],
    '/approval/approved': ['manager', 'legal', 'admin'],
    '/performance/tasks': ['operator', 'manager', 'admin'],
    '/performance/changes': ['operator', 'manager', 'admin'],
    '/warnings': ['operator', 'manager', 'legal', 'admin'],
    '/settings/users': ['admin'],
    '/settings/templates': ['legal', 'admin'],
    '/settings/rules': ['admin'],
  };
  
  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true;
  
  return allowedRoles.includes(userRole);
}
