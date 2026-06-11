import { Search, Filter, X, Download, Plus } from 'lucide-react';
import { useState } from 'react';
import type { ContractFilter, ContractType, ContractStatus } from '../../types';
import { departments } from '../../mock/data';
import { formatContractType, formatContractStatus } from '../../utils/format';
import { Button } from '../../components/common/Button';

interface FilterBarProps {
  filter: ContractFilter;
  onFilterChange: (filter: ContractFilter) => void;
  onExport: () => void;
  onCreate: () => void;
}

const contractTypes: ContractType[] = ['purchase', 'sales', 'service', 'labor', 'other'];
const contractStatuses: ContractStatus[] = ['draft', 'pending_approval', 'approving', 'approved', 'signing', 'signed', 'performing', 'completed', 'expired', 'terminated', 'rejected'];

export function FilterBar({ filter, onFilterChange, onExport, onCreate }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleReset = () => {
    onFilterChange({
      type: undefined,
      departmentId: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      keyword: undefined,
    });
  };

  const hasActiveFilters = filter.type || filter.departmentId || filter.status || filter.startDate || filter.endDate || filter.keyword;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索合同编号、名称、乙方..."
              value={filter.keyword || ''}
              onChange={(e) => onFilterChange({ ...filter, keyword: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {Object.values(filter).filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              重置
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={onExport}
          >
            导出台账
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreate}
          >
            新建合同
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">合同类型</label>
            <select
              value={filter.type || ''}
              onChange={(e) => onFilterChange({ ...filter, type: (e.target.value as ContractType) || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部类型</option>
              {contractTypes.map(type => (
                <option key={type} value={type}>{formatContractType(type)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
            <select
              value={filter.departmentId || ''}
              onChange={(e) => onFilterChange({ ...filter, departmentId: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部部门</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">合同状态</label>
            <select
              value={filter.status || ''}
              onChange={(e) => onFilterChange({ ...filter, status: (e.target.value as ContractStatus) || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部状态</option>
              {contractStatuses.map(status => (
                <option key={status} value={status}>{formatContractStatus(status)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
