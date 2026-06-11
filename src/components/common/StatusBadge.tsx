import type { ContractStatus, RiskLevel, ApprovalStatus, TaskStatus } from '../../types';
import { getStatusColor, formatContractStatus, getRiskColor, formatRiskLevel, getApprovalStatusColor, formatApprovalStatus, getTaskStatusColor, formatTaskStatus } from '../../utils/format';

interface StatusBadgeProps {
  type: 'contract' | 'risk' | 'approval' | 'task';
  status: ContractStatus | RiskLevel | ApprovalStatus | TaskStatus;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  let colorClass = '';
  let label = '';

  switch (type) {
    case 'contract':
      colorClass = getStatusColor(status as ContractStatus);
      label = formatContractStatus(status as ContractStatus);
      break;
    case 'risk':
      colorClass = getRiskColor(status as RiskLevel);
      label = formatRiskLevel(status as RiskLevel);
      break;
    case 'approval':
      colorClass = getApprovalStatusColor(status as ApprovalStatus);
      label = formatApprovalStatus(status as ApprovalStatus);
      break;
    case 'task':
      colorClass = getTaskStatusColor(status as TaskStatus);
      label = formatTaskStatus(status as TaskStatus);
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
