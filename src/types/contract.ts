import type { ContractType, ContractStatus, RiskLevel } from './common';

export interface Contract {
  id: string;
  contractNo: string;
  title: string;
  type: ContractType;
  amount: number;
  riskLevel: RiskLevel;
  status: ContractStatus;
  departmentId: string;
  creatorId: string;
  creatorName?: string;
  departmentName?: string;
  partyA: string;
  partyB: string;
  signDate?: string;
  startDate: string;
  endDate: string;
  content: string;
  templateId?: string;
  version: number;
  archiveNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractFilter {
  type?: ContractType;
  departmentId?: string;
  status?: ContractStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface CreateContractRequest {
  title: string;
  type: ContractType;
  amount: number;
  partyA: string;
  partyB: string;
  startDate: string;
  endDate: string;
  content: string;
  templateId?: string;
}

export interface Template {
  id: string;
  name: string;
  type: ContractType;
  content: string;
  riskLevel: RiskLevel;
  riskTips?: string[];
  createdAt: string;
}

export interface RecommendedTemplate extends Template {
  matchScore: number;
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  riskLevel: RiskLevel;
  riskDescription: string;
}

export interface ExportParams {
  type?: ContractType;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}
