import type { ApprovalStatus } from './common';

export interface ApprovalNode {
  id: string;
  flowId: string;
  nodeIndex: number;
  nodeName: string;
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment?: string;
  deadline: string;
  approvedAt?: string;
  escalatedTo?: string;
  createdAt: string;
}

export interface ApprovalFlow {
  id: string;
  contractId: string;
  contractTitle?: string;
  contractAmount?: number;
  nodes: ApprovalNode[];
  currentNodeIndex: number;
  status: 'pending' | 'approving' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ApprovalActionRequest {
  nodeId: string;
  action: 'approve' | 'reject';
  comment: string;
}

export interface ApprovalRule {
  id: string;
  type: string;
  minAmount: number;
  maxAmount: number;
  riskLevel: string;
  approvalNodes: Array<{
    name: string;
    role?: string;
    userId?: string;
  }>;
}
