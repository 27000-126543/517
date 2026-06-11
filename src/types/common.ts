export type UserRole = 'operator' | 'manager' | 'legal' | 'admin';

export type ContractType = 'purchase' | 'sales' | 'service' | 'labor' | 'other';

export type ContractStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approving' 
  | 'approved' 
  | 'signing' 
  | 'signed' 
  | 'performing' 
  | 'completed' 
  | 'expired' 
  | 'terminated';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'timeout';

export type TaskType = 'payment' | 'delivery' | 'acceptance' | 'other';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface Department {
  id: string;
  name: string;
  managerId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
