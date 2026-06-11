import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Send } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FilterBar } from './FilterBar';
import { Table, Pagination } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { Contract, ContractFilter } from '../../types';
import { formatCurrency, formatDate, formatContractType } from '../../utils/format';
import { canEditContract, canSubmitApproval, canViewContract } from '../../utils/permission';
import { truncateText } from '../../utils/format';

export default function ContractListPage() {
  const navigate = useNavigate();
  const { fetchContracts, exportContracts, submitForApproval, deleteContract } = useContractStore();
  const { currentUser } = useUserStore();
  
  const [filter, setFilter] = useState<ContractFilter>({});
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [submitModal, setSubmitModal] = useState<Contract | null>(null);
  const [deleteModal, setDeleteModal] = useState<Contract | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchContracts({ ...filter, page, pageSize });
      let filtered = result.data;
      
      if (currentUser.role === 'manager') {
        filtered = filtered.filter(c => c.departmentId === currentUser.departmentId);
      } else if (currentUser.role === 'operator') {
        filtered = filtered.filter(c => c.creatorId === currentUser.id);
      }
      
      setContracts(filtered);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize, fetchContracts, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilter: ContractFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSubmitApproval = async (contract: Contract) => {
    const success = await submitForApproval(contract.id);
    if (success) {
      setSubmitModal(null);
      loadData();
    }
  };

  const handleDelete = async (contract: Contract) => {
    deleteContract(contract.id);
    setDeleteModal(null);
    loadData();
  };

  const columns = [
    {
      key: 'contractNo',
      title: '合同编号',
      width: '140px',
      render: (row: Contract) => (
        <span className="font-mono text-sm text-primary-600">{row.contractNo}</span>
      ),
    },
    {
      key: 'title',
      title: '合同名称',
      render: (row: Contract) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-xs" title={row.title}>
            {truncateText(row.title, 30)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatContractType(row.type)} · {row.departmentName}
          </p>
        </div>
      ),
    },
    {
      key: 'partyB',
      title: '乙方',
      width: '150px',
      render: (row: Contract) => (
        <span className="text-sm text-gray-600" title={row.partyB}>
          {truncateText(row.partyB, 15)}
        </span>
      ),
    },
    {
      key: 'amount',
      title: '合同金额',
      align: 'right' as const,
      width: '120px',
      render: (row: Contract) => (
        <span className="font-mono font-semibold text-gray-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (row: Contract) => (
        <StatusBadge type="contract" status={row.status} />
      ),
    },
    {
      key: 'riskLevel',
      title: '风险等级',
      width: '100px',
      render: (row: Contract) => (
        <StatusBadge type="risk" status={row.riskLevel} />
      ),
    },
    {
      key: 'startDate',
      title: '开始日期',
      width: '100px',
      render: (row: Contract) => (
        <span className="text-sm text-gray-600">{formatDate(row.startDate)}</span>
      ),
    },
    {
      key: 'endDate',
      title: '结束日期',
      width: '100px',
      render: (row: Contract) => (
        <span className="text-sm text-gray-600">{formatDate(row.endDate)}</span>
      ),
    },
    {
      key: 'creatorName',
      title: '创建人',
      width: '80px',
      render: (row: Contract) => (
        <span className="text-sm text-gray-600">{row.creatorName}</span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '180px',
      align: 'center' as const,
      render: (row: Contract) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => navigate(`/contracts/${row.id}`)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canEditContract(row, currentUser) && (
            <button
              onClick={() => navigate(`/contracts/${row.id}/edit`)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canSubmitApproval(row, currentUser) && (
            <button
              onClick={() => setSubmitModal(row)}
              className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
              title="提交审批"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setDeleteModal(row)}
              className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">合同列表</h1>
            <p className="text-sm text-gray-500 mt-1">管理所有合同，支持多维度筛选和导出</p>
          </div>
        </div>

        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          onExport={() => exportContracts(filter)}
          onCreate={() => navigate('/contracts/create')}
        />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table
            columns={columns}
            data={contracts}
            loading={loading}
            rowKey={(row) => row.id}
            onRowClick={(row) => {
              if (canViewContract(row, currentUser)) {
                navigate(`/contracts/${row.id}`);
              }
            }}
          />
          {total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={!!submitModal}
        onClose={() => setSubmitModal(null)}
        title="提交审批"
        size="sm"
      >
        <p className="text-gray-600">
          确定要提交合同 <span className="font-medium text-gray-900">「{submitModal?.title}」</span> 进入审批流程吗？
        </p>
        <p className="text-sm text-gray-500 mt-2">
          提交后将根据合同金额和风险等级自动分配审批节点。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSubmitModal(null)}>
            取消
          </Button>
          <Button variant="primary" onClick={() => submitModal && handleSubmitApproval(submitModal)}>
            确认提交
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="删除合同"
        size="sm"
      >
        <p className="text-gray-600">
          确定要删除合同 <span className="font-medium text-gray-900">「{deleteModal?.title}」</span> 吗？
        </p>
        <p className="text-sm text-red-500 mt-2">
          此操作不可恢复，请谨慎操作。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>
            确认删除
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
