import type { ContractStatus, RiskLevel, ApprovalStatus, TaskStatus, ContractType, UserRole, TaskType } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getHoursRemaining(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export function formatContractType(type: ContractType): string {
  const map: Record<ContractType, string> = {
    purchase: '采购合同',
    sales: '销售合同',
    service: '服务合同',
    labor: '劳动合同',
    other: '其他合同',
  };
  return map[type] || type;
}

export function formatContractStatus(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    draft: '草稿',
    pending_approval: '待提交审批',
    approving: '审批中',
    approved: '审批通过',
    signing: '签署中',
    signed: '已签署',
    performing: '履约中',
    completed: '已完成',
    expired: '已到期',
    terminated: '已终止',
    rejected: '已驳回',
  };
  return map[status] || status;
}

export function getStatusColor(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_approval: 'bg-yellow-100 text-yellow-700',
    approving: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    signing: 'bg-purple-100 text-purple-700',
    signed: 'bg-indigo-100 text-indigo-700',
    performing: 'bg-cyan-100 text-cyan-700',
    completed: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-orange-100 text-orange-700',
    terminated: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function formatRiskLevel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return map[level] || level;
}

export function getRiskColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };
  return map[level] || 'bg-gray-100 text-gray-700';
}

export function formatApprovalStatus(status: ApprovalStatus): string {
  const map: Record<ApprovalStatus, string> = {
    pending: '待处理',
    approved: '已通过',
    rejected: '已驳回',
    escalated: '已越级',
    timeout: '已超时',
  };
  return map[status] || status;
}

export function getApprovalStatusColor(status: ApprovalStatus): string {
  const map: Record<ApprovalStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    escalated: 'bg-orange-100 text-orange-700',
    timeout: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function formatTaskStatus(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: '待处理',
    completed: '已完成',
    overdue: '已逾期',
  };
  return map[status] || status;
}

export function getTaskStatusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function formatTaskType(type: TaskType): string {
  const map: Record<TaskType, string> = {
    payment: '付款',
    delivery: '交货',
    acceptance: '验收',
    other: '其他',
  };
  return map[type] || type;
}

export function formatUserRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    operator: '合同经办人',
    manager: '部门主管',
    legal: '法务人员',
    admin: '系统管理员',
  };
  return map[role] || role;
}

export function generateContractNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HT-${year}${month}-${random}`;
}

export function generateArchiveNo(): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  return `GD-${timestamp}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
