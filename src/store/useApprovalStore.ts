import { create } from 'zustand';
import type { ApprovalFlow, ApprovalActionRequest, ApprovalRule, PerformanceTask, ContractChange, DashboardStats, Warning } from '../types';
import { approvalFlows as mockFlows, approvalRules as mockRules, performanceTasks as mockTasks, contractChanges as mockChanges, getDashboardStats } from '../mock/data';

interface ApprovalStore {
  approvalFlows: ApprovalFlow[];
  approvalRules: ApprovalRule[];
  performanceTasks: PerformanceTask[];
  contractChanges: ContractChange[];
  dashboardStats: DashboardStats | null;
  warnings: Warning[];
  loading: boolean;
  
  fetchPendingApprovals: () => Promise<ApprovalFlow[]>;
  fetchApprovedApprovals: () => Promise<ApprovalFlow[]>;
  fetchApprovalFlow: (contractId: string) => ApprovalFlow | undefined;
  approve: (flowId: string, data: ApprovalActionRequest) => Promise<boolean>;
  reject: (flowId: string, data: ApprovalActionRequest) => Promise<boolean>;
  escalateNode: (flowId: string, nodeId: string) => void;
  
  fetchTasks: (contractId?: string) => Promise<PerformanceTask[]>;
  completeTask: (taskId: string) => Promise<boolean>;
  
  fetchChanges: (contractId?: string) => Promise<ContractChange[]>;
  submitChange: (contractId: string, reason: string) => Promise<ContractChange>;
  
  fetchDashboardStats: () => Promise<DashboardStats>;
  fetchWarnings: () => Promise<Warning[]>;
  
  getApprovalRules: () => ApprovalRule[];
  addApprovalRule: (rule: Omit<ApprovalRule, 'id'>) => void;
  updateApprovalRule: (id: string, data: Partial<ApprovalRule>) => void;
  deleteApprovalRule: (id: string) => void;
  
  determineApprovalNodes: (type: string, amount: number, riskLevel: string) => Array<{ name: string; role?: string; userId?: string }>;
}

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  approvalFlows: mockFlows,
  approvalRules: mockRules,
  performanceTasks: mockTasks,
  contractChanges: mockChanges,
  dashboardStats: null,
  warnings: [],
  loading: false,
  
  fetchPendingApprovals: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return get().approvalFlows.filter(f => f.status === 'approving');
  },
  
  fetchApprovedApprovals: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return get().approvalFlows.filter(f => f.status === 'approved' || f.status === 'rejected');
  },
  
  fetchApprovalFlow: (contractId) => {
    return get().approvalFlows.find(f => f.contractId === contractId);
  },
  
  approve: async (flowId, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set((state) => {
      const flows = state.approvalFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        const nodes = flow.nodes.map(node => {
          if (node.id !== data.nodeId) return node;
          return {
            ...node,
            status: 'approved' as const,
            comment: data.comment,
            approvedAt: new Date().toISOString(),
          };
        });
        
        const currentNodeIndex = nodes.findIndex(n => n.status === 'pending');
        const allApproved = nodes.every(n => n.status === 'approved');
        
        return {
          ...flow,
          nodes,
          currentNodeIndex: currentNodeIndex >= 0 ? currentNodeIndex : nodes.length,
          status: allApproved ? 'approved' as const : 'approving' as const,
        };
      });
      
      return { approvalFlows: flows };
    });
    
    return true;
  },
  
  reject: async (flowId, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set((state) => {
      const flows = state.approvalFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        const nodes = flow.nodes.map(node => {
          if (node.id !== data.nodeId) return node;
          return {
            ...node,
            status: 'rejected' as const,
            comment: data.comment,
            approvedAt: new Date().toISOString(),
          };
        });
        
        return {
          ...flow,
          nodes,
          status: 'rejected' as const,
        };
      });
      
      return { approvalFlows: flows };
    });
    
    return true;
  },
  
  escalateNode: (flowId, nodeId) => {
    set((state) => ({
      approvalFlows: state.approvalFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        return {
          ...flow,
          nodes: flow.nodes.map(node => {
            if (node.id !== nodeId) return node;
            return { ...node, status: 'escalated' as const };
          }),
        };
      }),
    }));
  },
  
  fetchTasks: async (contractId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    let tasks = get().performanceTasks;
    if (contractId) {
      tasks = tasks.filter(t => t.contractId === contractId);
    }
    return tasks;
  },
  
  completeTask: async (taskId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    set((state) => ({
      performanceTasks: state.performanceTasks.map(t => 
        t.id === taskId ? { ...t, status: 'completed' as const, actualDate: new Date().toISOString().split('T')[0] } : t
      ),
    }));
    
    return true;
  },
  
  fetchChanges: async (contractId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    let changes = get().contractChanges;
    if (contractId) {
      changes = changes.filter(c => c.contractId === contractId);
    }
    return changes;
  },
  
  submitChange: async (contractId, reason) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const contract = get().approvalFlows.find(f => f.contractId === contractId);
    const newChange: ContractChange = {
      id: `change${Date.now()}`,
      contractId,
      contractTitle: contract?.contractTitle,
      oldVersion: 1,
      newVersion: 2,
      reason,
      status: 'pending',
      createdBy: 'user1',
      createdByName: '系统管理员',
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    set((state) => ({ contractChanges: [newChange, ...state.contractChanges] }));
    return newChange;
  },
  
  fetchDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stats = getDashboardStats();
    set({ dashboardStats: stats });
    return stats;
  },
  
  fetchWarnings: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = getDashboardStats();
    const warnings: Warning[] = [];
    
    stats.expiryWarnings.forEach(w => {
      warnings.push({
        id: `warn_expiry_${w.contractId}`,
        type: 'expiry',
        title: '合同即将到期',
        description: `合同「${w.title}」将在${w.daysLeft}天后到期`,
        contractId: w.contractId,
        level: w.daysLeft <= 7 ? 'danger' : w.daysLeft <= 15 ? 'warning' : 'info',
        createdAt: new Date().toISOString(),
      });
    });
    
    get().approvalFlows.filter(f => f.status === 'approving').forEach(f => {
      const pendingNode = f.nodes.find(n => n.status === 'pending');
      if (pendingNode) {
        const hoursLeft = Math.ceil((new Date(pendingNode.deadline).getTime() - Date.now()) / (1000 * 60 * 60));
        if (hoursLeft < 24) {
          warnings.push({
            id: `warn_approval_${f.id}`,
            type: 'approval_timeout',
            title: '审批即将超时',
            description: `合同「${f.contractTitle}」的${pendingNode.nodeName}还剩${hoursLeft}小时`,
            contractId: f.contractId,
            level: hoursLeft < 12 ? 'danger' : 'warning',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
    
    get().performanceTasks.filter(t => t.status === 'overdue').forEach(t => {
      warnings.push({
        id: `warn_task_${t.id}`,
        type: 'performance_overdue',
        title: '履约任务逾期',
        description: `合同「${t.contractTitle}」的${t.name}任务已逾期`,
        contractId: t.contractId,
        level: 'danger',
        createdAt: new Date().toISOString(),
      });
    });
    
    set({ warnings });
    return warnings;
  },
  
  getApprovalRules: () => get().approvalRules,
  
  addApprovalRule: (rule) => {
    const newRule: ApprovalRule = {
      ...rule,
      id: `rule${Date.now()}`,
    };
    set((state) => ({ approvalRules: [...state.approvalRules, newRule] }));
  },
  
  updateApprovalRule: (id, data) => {
    set((state) => ({
      approvalRules: state.approvalRules.map(r => r.id === id ? { ...r, ...data } : r),
    }));
  },
  
  deleteApprovalRule: (id) => {
    set((state) => ({ approvalRules: state.approvalRules.filter(r => r.id !== id) }));
  },
  
  determineApprovalNodes: (type, amount, riskLevel) => {
    const rule = get().approvalRules.find(r => 
      r.type === type && 
      amount >= r.minAmount && 
      amount < r.maxAmount &&
      r.riskLevel === riskLevel
    );
    
    if (rule) {
      return rule.approvalNodes;
    }
    
    return [
      { name: '部门主管审批', role: 'manager' },
      { name: '法务审核', role: 'legal' },
    ];
  },
}));
