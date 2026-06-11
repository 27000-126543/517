import type { Contract, User, Department, Template, Clause, ApprovalFlow, PerformanceTask, ContractChange, ApprovalRule, DashboardStats } from '../types';

export const departments: Department[] = [
  { id: 'dept1', name: '销售部', managerId: 'user2' },
  { id: 'dept2', name: '采购部', managerId: 'user3' },
  { id: 'dept3', name: '技术部', managerId: 'user4' },
  { id: 'dept4', name: '财务部', managerId: 'user5' },
  { id: 'dept5', name: '法务部', managerId: 'user6' },
];

export const users: User[] = [
  { id: 'user1', username: 'admin', name: '系统管理员', role: 'admin', departmentId: 'dept5', email: 'admin@company.com', createdAt: '2024-01-01' },
  { id: 'user2', username: 'lisi', name: '李四', role: 'manager', departmentId: 'dept1', email: 'lisi@company.com', createdAt: '2024-01-01' },
  { id: 'user3', username: 'wangwu', name: '王五', role: 'manager', departmentId: 'dept2', email: 'wangwu@company.com', createdAt: '2024-01-01' },
  { id: 'user4', username: 'zhaoliu', name: '赵六', role: 'manager', departmentId: 'dept3', email: 'zhaoliu@company.com', createdAt: '2024-01-01' },
  { id: 'user5', username: 'qianqi', name: '钱七', role: 'manager', departmentId: 'dept4', email: 'qianqi@company.com', createdAt: '2024-01-01' },
  { id: 'user6', username: 'sunba', name: '孙八', role: 'legal', departmentId: 'dept5', email: 'sunba@company.com', createdAt: '2024-01-01' },
  { id: 'user7', username: 'zhangwei', name: '张伟', role: 'operator', departmentId: 'dept1', email: 'zhangwei@company.com', createdAt: '2024-01-01' },
  { id: 'user8', username: 'liuhong', name: '刘红', role: 'operator', departmentId: 'dept2', email: 'liuhong@company.com', createdAt: '2024-01-01' },
  { id: 'user9', username: 'chenjie', name: '陈杰', role: 'operator', departmentId: 'dept3', email: 'chenjie@company.com', createdAt: '2024-01-01' },
];

const contractTypes = ['采购合同', '销售合同', '服务合同', '劳动合同', '其他合同'];
const contractTypeCodes: Record<string, string> = {
  '采购合同': 'purchase',
  '销售合同': 'sales',
  '服务合同': 'service',
  '劳动合同': 'labor',
  '其他合同': 'other',
};
const statuses = ['draft', 'pending_approval', 'approving', 'approved', 'signing', 'signed', 'performing', 'completed', 'expired', 'terminated'];
const riskLevels = ['low', 'medium', 'high'];
const parties = ['阿里巴巴集团', '腾讯科技', '百度在线', '字节跳动', '京东集团', '美团点评', '小米科技', '华为技术'];

function generateContractNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HT-${year}-${random}`;
}

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export const contracts: Contract[] = Array.from({ length: 50 }, (_, i) => {
  const typeName = contractTypes[Math.floor(Math.random() * contractTypes.length)];
  const typeCode = contractTypeCodes[typeName] as any;
  const startDate = randomDate(new Date('2024-01-01'), new Date('2025-06-01'));
  const endDate = addDays(startDate, 30 + Math.floor(Math.random() * 365));
  const creator = users[6 + Math.floor(Math.random() * 3)];
  
  return {
    id: `contract${i + 1}`,
    contractNo: generateContractNo(),
    title: `${typeName}-${parties[Math.floor(Math.random() * parties.length)]}`,
    type: typeCode,
    amount: Math.floor(Math.random() * 5000000) + 10000,
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)] as any,
    status: statuses[Math.floor(Math.random() * statuses.length)] as any,
    departmentId: creator.departmentId,
    creatorId: creator.id,
    creatorName: creator.name,
    departmentName: departments.find(d => d.id === creator.departmentId)?.name,
    partyA: '本公司',
    partyB: parties[Math.floor(Math.random() * parties.length)],
    signDate: Math.random() > 0.3 ? startDate : undefined,
    startDate,
    endDate,
    content: `这是一份${typeName}的详细内容，包含了双方的权利和义务条款...`,
    version: 1 + Math.floor(Math.random() * 3),
    archiveNo: Math.random() > 0.5 ? `GD-${Date.now()}` : undefined,
    createdAt: startDate,
    updatedAt: startDate,
  };
});

export const templates: Template[] = [
  {
    id: 'tpl1',
    name: '标准采购合同模板',
    type: 'purchase',
    content: '采购合同模板内容...',
    riskTips: ['注意验收标准条款', '付款条件需明确', '违约责任需对等'],
    createdAt: '2024-01-01',
  },
  {
    id: 'tpl2',
    name: '标准销售合同模板',
    type: 'sales',
    content: '销售合同模板内容...',
    riskTips: ['收款条款需明确', '交付时间需具体', '质量标准要清晰'],
    createdAt: '2024-01-01',
  },
  {
    id: 'tpl3',
    name: '技术服务合同模板',
    type: 'service',
    content: '服务合同模板内容...',
    riskTips: ['服务范围需详细', '验收标准要量化', '保密条款不可少'],
    createdAt: '2024-01-01',
  },
  {
    id: 'tpl4',
    name: '劳动合同模板',
    type: 'labor',
    content: '劳动合同模板内容...',
    riskTips: ['薪资结构需明确', '试用期规定合法', '竞业限制合理'],
    createdAt: '2024-01-01',
  },
];

export const clauses: Clause[] = [
  {
    id: 'clause1',
    title: '违约责任条款',
    content: '任何一方违反本合同约定，应向守约方支付合同总金额的5%作为违约金，并赔偿由此造成的实际损失。',
    riskLevel: 'high',
    riskDescription: '违约金比例是否合理，是否过高或过低',
  },
  {
    id: 'clause2',
    title: '保密条款',
    content: '双方应对在合作过程中获悉的对方商业秘密承担保密义务，保密期限为合同终止后5年。',
    riskLevel: 'medium',
    riskDescription: '保密范围和期限是否合理',
  },
  {
    id: 'clause3',
    title: '付款条款',
    content: '甲方应在收到乙方发票后30个工作日内支付相应款项，逾期按每日万分之五支付滞纳金。',
    riskLevel: 'medium',
    riskDescription: '付款周期和滞纳金比例是否可接受',
  },
  {
    id: 'clause4',
    title: '知识产权条款',
    content: '本合同履行过程中产生的知识产权，除另有约定外，归委托方所有。',
    riskLevel: 'high',
    riskDescription: '知识产权归属是否清晰，是否有遗漏',
  },
  {
    id: 'clause5',
    title: '争议解决条款',
    content: '因本合同引起的争议，双方应友好协商解决；协商不成的，提交合同签订地有管辖权的人民法院诉讼解决。',
    riskLevel: 'medium',
    riskDescription: '争议解决方式和管辖地是否对我方有利',
  },
];

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export const approvalFlows: ApprovalFlow[] = contracts.slice(0, 10).map((contract, i) => {
  const now = new Date();
  const nodes = [
    {
      id: `node${i}_1`,
      flowId: `flow${i}`,
      nodeIndex: 0,
      nodeName: '部门主管审批',
      approverId: users[1 + (i % 4)].id,
      approverName: users[1 + (i % 4)].name,
      status: i < 5 ? 'approved' : 'pending' as any,
      comment: i < 5 ? '同意，情况属实' : undefined,
      deadline: addHours(now, 48).toISOString(),
      approvedAt: i < 5 ? now.toISOString() : undefined,
      createdAt: now.toISOString(),
    },
  ];
  
  if (contract.amount > 100000) {
    nodes.push({
      id: `node${i}_2`,
      flowId: `flow${i}`,
      nodeIndex: 1,
      nodeName: '财务主管审批',
      approverId: users[4].id,
      approverName: users[4].name,
      status: i < 3 ? 'approved' : (i < 5 ? 'pending' : 'pending') as any,
      comment: i < 3 ? '财务审核通过' : undefined,
      deadline: addHours(now, 48).toISOString(),
      approvedAt: i < 3 ? now.toISOString() : undefined,
      createdAt: now.toISOString(),
    });
  }
  
  if (contract.amount > 500000) {
    nodes.push({
      id: `node${i}_3`,
      flowId: `flow${i}`,
      nodeIndex: 2,
      nodeName: '法务审核',
      approverId: users[5].id,
      approverName: users[5].name,
      status: i < 2 ? 'approved' : 'pending' as any,
      comment: i < 2 ? '法律风险可控' : undefined,
      deadline: addHours(now, 48).toISOString(),
      approvedAt: i < 2 ? now.toISOString() : undefined,
      createdAt: now.toISOString(),
    });
  }
  
  const currentNodeIndex = nodes.findIndex(n => n.status === 'pending');
  
  return {
    id: `flow${i}`,
    contractId: contract.id,
    contractTitle: contract.title,
    contractAmount: contract.amount,
    nodes,
    currentNodeIndex: currentNodeIndex >= 0 ? currentNodeIndex : nodes.length,
    status: currentNodeIndex === -1 ? 'approved' : 'approving' as any,
    createdAt: now.toISOString(),
  };
});

export const performanceTasks: PerformanceTask[] = contracts.filter(c => c.status === 'performing').slice(0, 15).map((contract, i) => {
  const taskTypes = [
    { type: 'payment', name: '付款节点' },
    { type: 'delivery', name: '交货节点' },
    { type: 'acceptance', name: '验收节点' },
  ];
  const task = taskTypes[i % 3];
  const plannedDate = addDays(new Date().toISOString().split('T')[0], Math.floor(Math.random() * 60) - 15);
  const isPast = new Date(plannedDate) < new Date();
  
  return {
    id: `task${i}`,
    contractId: contract.id,
    contractTitle: contract.title,
    type: task.type as any,
    name: task.name,
    description: `请按时完成${task.name}相关工作`,
    plannedDate,
    actualDate: isPast && Math.random() > 0.3 ? plannedDate : undefined,
    status: isPast ? (Math.random() > 0.3 ? 'completed' : 'overdue') : 'pending' as any,
    reminderSent: Math.random() > 0.5,
    createdAt: '2025-01-01',
  };
});

export const contractChanges: ContractChange[] = contracts.slice(0, 5).map((contract, i) => ({
  id: `change${i}`,
  contractId: contract.id,
  contractTitle: contract.title,
  oldVersion: contract.version - 1,
  newVersion: contract.version,
  reason: '因业务需求调整，需修改合同条款内容',
  status: i < 3 ? 'approved' : (i < 4 ? 'pending' : 'rejected') as any,
  createdBy: users[6 + (i % 3)].id,
  createdByName: users[6 + (i % 3)].name,
  createdAt: '2025-03-01',
}));

export const approvalRules: ApprovalRule[] = [
  {
    id: 'rule1',
    type: 'purchase',
    minAmount: 0,
    maxAmount: 100000,
    riskLevel: 'low',
    approvalNodes: [{ name: '部门主管审批', role: 'manager' }],
  },
  {
    id: 'rule2',
    type: 'purchase',
    minAmount: 100000,
    maxAmount: 500000,
    riskLevel: 'medium',
    approvalNodes: [
      { name: '部门主管审批', role: 'manager' },
      { name: '财务主管审批', role: 'manager' },
    ],
  },
  {
    id: 'rule3',
    type: 'purchase',
    minAmount: 500000,
    maxAmount: 999999999,
    riskLevel: 'high',
    approvalNodes: [
      { name: '部门主管审批', role: 'manager' },
      { name: '财务主管审批', role: 'manager' },
      { name: '法务审核', role: 'legal' },
      { name: '总经理审批', role: 'admin' },
    ],
  },
  {
    id: 'rule4',
    type: 'sales',
    minAmount: 0,
    maxAmount: 500000,
    riskLevel: 'low',
    approvalNodes: [{ name: '部门主管审批', role: 'manager' }],
  },
  {
    id: 'rule5',
    type: 'sales',
    minAmount: 500000,
    maxAmount: 999999999,
    riskLevel: 'high',
    approvalNodes: [
      { name: '部门主管审批', role: 'manager' },
      { name: '法务审核', role: 'legal' },
      { name: '总经理审批', role: 'admin' },
    ],
  },
];

export function getDashboardStats(): DashboardStats {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'pending_approval': '待提交审批',
    'approving': '审批中',
    'approved': '审批通过',
    'signing': '签署中',
    'signed': '已签署',
    'performing': '履约中',
    'completed': '已完成',
    'expired': '已到期',
    'terminated': '已终止',
  };
  
  const statusDistribution = Object.entries(
    contracts.reduce((acc, c) => {
      acc[statusMap[c.status]] = (acc[statusMap[c.status]] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  
  const approvalRanking = users
    .filter(u => u.role !== 'operator')
    .map(u => ({
      name: u.name,
      count: Math.floor(Math.random() * 50) + 10,
      avgHours: Math.floor(Math.random() * 24) + 2,
    }))
    .sort((a, b) => b.count - a.count);
  
  const departmentHeatmap = departments.map(d => {
    const deptContracts = contracts.filter(c => c.departmentId === d.id);
    return {
      department: d.name,
      amount: deptContracts.reduce((sum, c) => sum + c.amount, 0),
      count: deptContracts.length,
    };
  });
  
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const expiryWarnings = contracts
    .filter(c => {
      const endDate = new Date(c.endDate);
      return endDate >= now && endDate <= thirtyDaysLater && c.status !== 'expired' && c.status !== 'completed';
    })
    .map(c => ({
      contractId: c.id,
      title: c.title,
      daysLeft: Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      amount: c.amount,
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 10);
  
  return {
    totalContracts: contracts.length,
    pendingApproval: contracts.filter(c => c.status === 'approving' || c.status === 'pending_approval').length,
    performing: contracts.filter(c => c.status === 'performing').length,
    expiringIn30Days: expiryWarnings.length,
    statusDistribution,
    approvalRanking,
    departmentHeatmap,
    expiryWarnings,
  };
}

export const currentUser = users[0];
