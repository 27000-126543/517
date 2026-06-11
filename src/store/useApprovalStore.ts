import { create } from 'zustand';
import type { ApprovalFlow, ApprovalActionRequest, ApprovalRule, PerformanceTask, ContractChange, DashboardStats, Warning, ApprovalNode } from '../types';
import { approvalFlows as mockFlows, approvalRules as mockRules, performanceTasks as mockTasks, contractChanges as mockChanges, getDashboardStats, users, departments } from '../mock/data';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getApproverForRole(role: string, departmentId?: string): { id: string; name: string } {
  if (role === 'legal') {
    const legal = users.find(u => u.role === 'legal');
    return legal ? { id: legal.id, name: legal.name } : { id: 'user6', name: '孙八' };
  }
  if (role === 'admin') {
    const admin = users.find(u => u.role === 'admin');
    return admin ? { id: admin.id, name: admin.name } : { id: 'user1', name: '系统管理员' };
  }
  if (role === 'manager') {
    if (departmentId) {
      const dept = departments.find(d => d.id === departmentId);
      if (dept && dept.managerId) {
        const manager = users.find(u => u.id === dept.managerId);
        if (manager) return { id: manager.id, name: manager.name };
      }
    }
    const anyManager = users.find(u => u.role === 'manager');
    return anyManager ? { id: anyManager.id, name: anyManager.name } : { id: 'user2', name: '李四' };
  }
  return { id: 'user1', name: '系统管理员' };
}

interface ApprovalStore {
  approvalFlows: ApprovalFlow[];
  approvalRules: ApprovalRule[];
  performanceTasks: PerformanceTask[];
  contractChanges: ContractChange[];
  dashboardStats: DashboardStats | null;
  warnings: Warning[];
  loading: boolean;
  
  createApprovalFlow: (contractId: string, contractTitle: string, contractAmount: number, type: string, riskLevel: string, departmentId?: string) => ApprovalFlow;
  fetchPendingApprovals: () => Promise<ApprovalFlow[]>;
  fetchPendingApprovalsForUser: (userId: string) => ApprovalFlow[];
  fetchApprovedApprovalsForUser: (userId: string) => ApprovalFlow[];
  fetchApprovedApprovals: () => Promise<ApprovalFlow[]>;
  fetchApprovalFlow: (contractId: string) => ApprovalFlow | undefined;
  approve: (flowId: string, data: ApprovalActionRequest, userId: string) => Promise<boolean>;
  reject: (flowId: string, data: ApprovalActionRequest, userId: string) => Promise<boolean>;
  escalateNode: (flowId: string, nodeId: string) => void;
  
  generatePerformanceTasks: (contractId: string, contractTitle: string, startDate: string, endDate: string) => void;
  fetchTasks: (contractId?: string) => Promise<PerformanceTask[]>;
  completeTask: (taskId: string) => Promise<boolean>;
  
  fetchChanges: (contractId?: string) => Promise<ContractChange[]>;
  submitChange: (contractId: string, reason: string, contractTitle: string, currentVersion: number, userId: string, userName: string) => Promise<ContractChange>;
  approveChange: (changeId: string) => void;
  rejectChange: (changeId: string) => void;
  
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

  createApprovalFlow: (contractId, contractTitle, contractAmount, type, riskLevel, departmentId) => {
    const nodeDefinitions = get().determineApprovalNodes(type, contractAmount, riskLevel);
    const now = new Date();
    
    const nodes: ApprovalNode[] = nodeDefinitions.map((nodeDef, index) => {
      const approver = nodeDef.userId 
        ? { id: nodeDef.userId, name: users.find(u => u.id === nodeDef.userId)?.name || '审批人' }
        : getApproverForRole(nodeDef.role || 'manager', departmentId);
      
      return {
        id: `node_${contractId}_${index}_${Date.now()}`,
        flowId: `flow_${contractId}_${Date.now()}`,
        nodeIndex: index,
        nodeName: nodeDef.name,
        approverId: approver.id,
        approverName: approver.name,
        status: index === 0 ? 'pending' : 'pending',
        deadline: addHours(now, 48).toISOString(),
        createdAt: now.toISOString(),
      };
    });
    
    nodes[0].status = 'pending';

    const newFlow: ApprovalFlow = {
      id: `flow_${contractId}_${Date.now()}`,
      contractId,
      contractTitle,
      contractAmount,
      nodes,
      currentNodeIndex: 0,
      status: 'approving',
      createdAt: now.toISOString(),
    };

    set((state) => ({
      approvalFlows: [newFlow, ...state.approvalFlows],
    }));

    return newFlow;
  },
  
  fetchPendingApprovals: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return get().approvalFlows.filter(f => f.status === 'approving');
  },

  fetchPendingApprovalsForUser: (userId) => {
    return get().approvalFlows.filter(f => {
      if (f.status !== 'approving') return false;
      const currentNode = f.nodes[f.currentNodeIndex];
      return currentNode && currentNode.approverId === userId && currentNode.status === 'pending';
    });
  },

  fetchApprovedApprovalsForUser: (userId) => {
    return get().approvalFlows.filter(f => {
      return f.nodes.some(n => n.approverId === userId && (n.status === 'approved' || n.status === 'rejected'));
    });
  },
  
  fetchApprovedApprovals: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return get().approvalFlows.filter(f => f.status === 'approved' || f.status === 'rejected');
  },
  
  fetchApprovalFlow: (contractId) => {
    return get().approvalFlows.find(f => f.contractId === contractId);
  },
  
  approve: async (flowId, data, userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let contractId = '';
    let allApproved = false;
    
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
        allApproved = nodes.every(n => n.status === 'approved');
        contractId = flow.contractId;
        
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
  
  reject: async (flowId, data, userId) => {
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

  generatePerformanceTasks: (contractId, contractTitle, startDate, endDate) => {
    const taskTypes = [
      { type: 'payment' as const, name: '付款节点', offsetDays: 10 },
      { type: 'delivery' as const, name: '交货节点', offsetDays: 30 },
      { type: 'acceptance' as const, name: '验收节点', offsetDays: 60 },
    ];

    const newTasks: PerformanceTask[] = taskTypes.map((task, idx) => {
      const plannedDate = addDays(startDate, task.offsetDays);
      const isPast = new Date(plannedDate) < new Date();
      
      return {
        id: `task_${contractId}_${idx}_${Date.now()}`,
        contractId,
        contractTitle,
        type: task.type,
        name: task.name,
        description: `请按时完成${task.name}相关工作`,
        plannedDate,
        actualDate: undefined,
        status: isPast ? 'overdue' : 'pending',
        reminderSent: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

    set((state) => ({
      performanceTasks: [...newTasks, ...state.performanceTasks],
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
  
  submitChange: async (contractId, reason, contractTitle, currentVersion, userId, userName) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newChange: ContractChange = {
      id: `change_${contractId}_${Date.now()}`,
      contractId,
      contractTitle,
      oldVersion: currentVersion,
      newVersion: currentVersion + 1,
      reason,
      status: 'pending',
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    set((state) => ({ contractChanges: [newChange, ...state.contractChanges] }));
    return newChange;
  },

  approveChange: (changeId) => {
    set((state) => ({
      contractChanges: state.contractChanges.map(c =>
        c.id === changeId ? { ...c, status: 'approved' as const } : c
      ),
    }));
  },

  rejectChange: (changeId) => {
    set((state) => ({
      contractChanges: state.contractChanges.map(c =>
        c.id === changeId ? { ...c, status: 'rejected' as const } : c
      ),
    }));
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
      id: `rule_${Date.now()}`,
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
    
    const fallbackNodes: Array<{ name: string; role?: string }> = [
      { name: '部门主管审批', role: 'manager' },
    ];
    
    if (amount > 100000) {
      fallbackNodes.push({ name: '财务主管审批', role: 'manager' });
    }
    
    if (amount > 500000 || riskLevel === 'high') {
      fallbackNodes.push({ name: '法务审核', role: 'legal' });
      fallbackNodes.push({ name: '总经理审批', role: 'admin' });
    }
    
    return fallbackNodes;
  },
}));
