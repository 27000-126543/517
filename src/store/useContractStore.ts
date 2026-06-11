import { create } from 'zustand';
import type { Contract, ContractFilter, CreateContractRequest, Template, Clause, RecommendedTemplate, PaginatedResponse, ContractStatus } from '../types';
import { contracts as mockContracts, templates as mockTemplates, clauses as mockClauses } from '../mock/data';
import { generateContractNo, generateArchiveNo } from '../utils/format';
import { useApprovalStore } from './useApprovalStore';

interface ContractStore {
  contracts: Contract[];
  templates: Template[];
  clauses: Clause[];
  loading: boolean;
  fetchContracts: (filter?: ContractFilter & { page?: number; pageSize?: number }) => Promise<PaginatedResponse<Contract>>;
  fetchContract: (id: string) => Contract | undefined;
  createContract: (data: CreateContractRequest) => Promise<Contract>;
  updateContract: (id: string, data: Partial<Contract>) => Promise<Contract>;
  deleteContract: (id: string) => void;
  submitForApproval: (id: string) => Promise<boolean>;
  signContract: (id: string) => Promise<boolean>;
  archiveContract: (id: string) => Promise<boolean>;
  updateContractStatus: (id: string, status: ContractStatus) => void;
  getRecommendedTemplates: (type: string, amount: number) => RecommendedTemplate[];
  getRecommendedClauses: (type: string) => Clause[];
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, data: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addClause: (clause: Omit<Clause, 'id'>) => void;
  updateClause: (id: string, data: Partial<Clause>) => void;
  deleteClause: (id: string) => void;
  exportContracts: (filter?: ContractFilter) => void;
}

export const useContractStore = create<ContractStore>((set, get) => ({
  contracts: mockContracts,
  templates: mockTemplates,
  clauses: mockClauses,
  loading: false,
  
  fetchContracts: async (filter) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let filtered = [...get().contracts];
    
    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(c => c.type === filter.type);
      }
      if (filter.departmentId) {
        filtered = filtered.filter(c => c.departmentId === filter.departmentId);
      }
      if (filter.status) {
        filtered = filtered.filter(c => c.status === filter.status);
      }
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(keyword) || 
          c.contractNo.toLowerCase().includes(keyword) ||
          c.partyB.toLowerCase().includes(keyword)
        );
      }
      if (filter.startDate) {
        filtered = filtered.filter(c => c.startDate >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(c => c.endDate <= filter.endDate!);
      }
    }
    
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },
  
  fetchContract: (id) => {
    return get().contracts.find(c => c.id === id);
  },
  
  createContract: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newContract: Contract = {
      ...data,
      id: `contract${Date.now()}`,
      contractNo: generateContractNo(),
      riskLevel: data.amount > 500000 ? 'high' : data.amount > 100000 ? 'medium' : 'low',
      status: 'draft',
      departmentId: 'dept1',
      creatorId: 'user1',
      creatorName: '系统管理员',
      departmentName: '销售部',
      version: 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    set((state) => ({ contracts: [newContract, ...state.contracts] }));
    return newContract;
  },
  
  updateContract: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    set((state) => ({
      contracts: state.contracts.map(c => 
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] } : c
      ),
    }));
    
    const updated = get().contracts.find(c => c.id === id);
    return updated!;
  },
  
  deleteContract: (id) => {
    set((state) => ({ contracts: state.contracts.filter(c => c.id !== id) }));
  },
  
  submitForApproval: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const contract = get().contracts.find(c => c.id === id);
    if (!contract) return false;
    
    const { createApprovalFlow } = useApprovalStore.getState();
    createApprovalFlow(
      contract.id,
      contract.title,
      contract.amount,
      contract.type,
      contract.riskLevel,
      contract.departmentId
    );
    
    set((state) => ({
      contracts: state.contracts.map(c => 
        c.id === id ? { ...c, status: 'approving', updatedAt: new Date().toISOString().split('T')[0] } : c
      ),
    }));
    
    return true;
  },

  signContract: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set((state) => ({
      contracts: state.contracts.map(c => 
        c.id === id ? { ...c, status: 'signed', signDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] } : c
      ),
    }));
    
    const contract = get().contracts.find(c => c.id === id);
    if (contract) {
      const { generatePerformanceTasks } = useApprovalStore.getState();
      generatePerformanceTasks(
        contract.id,
        contract.title,
        contract.startDate,
        contract.endDate
      );
    }
    
    return true;
  },

  archiveContract: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const archiveNo = generateArchiveNo();
    
    set((state) => ({
      contracts: state.contracts.map(c => 
        c.id === id ? { 
          ...c, 
          status: 'performing', 
          archiveNo, 
          updatedAt: new Date().toISOString().split('T')[0] 
        } : c
      ),
    }));
    
    return true;
  },
  
  updateContractStatus: (id, status) => {
    set((state) => ({
      contracts: state.contracts.map(c => 
        c.id === id ? { ...c, status, updatedAt: new Date().toISOString().split('T')[0] } : c
      ),
    }));
  },
  
  getRecommendedTemplates: (type, amount) => {
    return get().templates
      .filter(t => t.type === type)
      .map(t => ({
        ...t,
        matchScore: Math.floor(70 + Math.random() * 30),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  },
  
  getRecommendedClauses: (type) => {
    return get().clauses.filter(() => Math.random() > 0.3);
  },
  
  addTemplate: (template) => {
    const newTemplate: Template = {
      ...template,
      id: `tpl${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ templates: [...state.templates, newTemplate] }));
  },
  
  updateTemplate: (id, data) => {
    set((state) => ({
      templates: state.templates.map(t => t.id === id ? { ...t, ...data } : t),
    }));
  },
  
  deleteTemplate: (id) => {
    set((state) => ({ templates: state.templates.filter(t => t.id !== id) }));
  },
  
  addClause: (clause) => {
    const newClause: Clause = {
      ...clause,
      id: `clause${Date.now()}`,
    };
    set((state) => ({ clauses: [...state.clauses, newClause] }));
  },
  
  updateClause: (id, data) => {
    set((state) => ({
      clauses: state.clauses.map(c => c.id === id ? { ...c, ...data } : c),
    }));
  },
  
  deleteClause: (id) => {
    set((state) => ({ clauses: state.clauses.filter(c => c.id !== id) }));
  },
  
  exportContracts: (filter) => {
    let data = [...get().contracts];
    
    if (filter) {
      if (filter.type) data = data.filter(c => c.type === filter.type);
      if (filter.departmentId) data = data.filter(c => c.departmentId === filter.departmentId);
      if (filter.startDate) data = data.filter(c => c.startDate >= filter.startDate!);
      if (filter.endDate) data = data.filter(c => c.endDate <= filter.endDate!);
    }
    
    const headers = ['合同编号', '合同名称', '合同类型', '金额', '状态', '甲方', '乙方', '开始日期', '结束日期', '创建人', '创建时间'];
    const csvContent = [
      headers.join(','),
      ...data.map(c => [
        c.contractNo,
        `"${c.title}"`,
        c.type,
        c.amount,
        c.status,
        c.partyA,
        `"${c.partyB}"`,
        c.startDate,
        c.endDate,
        c.creatorName,
        c.createdAt,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `合同台账_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  },
}));
