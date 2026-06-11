import type { TaskType, TaskStatus } from './common';

export interface PerformanceTask {
  id: string;
  contractId: string;
  contractTitle?: string;
  type: TaskType;
  name: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  status: TaskStatus;
  reminderSent: boolean;
  createdAt: string;
}

export interface ContractChange {
  id: string;
  contractId: string;
  contractTitle?: string;
  oldVersion: number;
  newVersion: number;
  reason: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface ChangeRequest {
  contractId: string;
  reason: string;
  attachment?: File;
}

export interface DashboardStats {
  totalContracts: number;
  pendingApproval: number;
  performing: number;
  expiringIn30Days: number;
  statusDistribution: Array<{ name: string; value: number }>;
  approvalRanking: Array<{ name: string; count: number; avgHours: number }>;
  departmentHeatmap: Array<{ department: string; amount: number; count: number }>;
  expiryWarnings: Array<{
    contractId: string;
    title: string;
    daysLeft: number;
    amount: number;
  }>;
}

export interface Warning {
  id: string;
  type: 'expiry' | 'approval_timeout' | 'performance_overdue';
  title: string;
  description: string;
  contractId?: string;
  level: 'info' | 'warning' | 'danger';
  createdAt: string;
}
