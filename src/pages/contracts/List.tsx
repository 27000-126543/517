import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Send, Award, Shield, Copy, Calendar, User } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FilterBar } from './FilterBar';
import { Table, Pagination } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { Contract, ContractFilter, ArchiveInfo } from '../../types';
import { formatCurrency, formatDate, formatContractType, formatDateTime } from '../../utils/format';
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
  const [archiveCertModal, setArchiveCertModal] = useState<{ open: boolean; contract: Contract | null }>({ open: false, contract: null });
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'archived' | 'unarchived'>('all');

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

      if (archiveFilter === 'archived') {
        filtered = filtered.filter(c => !!c.archiveInfo);
      } else if (archiveFilter === 'unarchived') {
        filtered = filtered.filter(c => !c.archiveInfo);
      }
      
      setContracts(filtered);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize, fetchContracts, currentUser, archiveFilter]);

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
      key: 'archiveNo',
      title: '归档编号',
      width: '160px',
      render: (row: Contract) => {
        if (!row.archiveInfo) {
          return <span className="text-sm text-gray-300">-</span>;
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setArchiveCertModal({ open: true, contract: row });
            }}
            className="group flex items-center gap-1.5 text-sm font-mono text-primary-600 hover:text-primary-700"
            title="点击查看归档凭证"
          >
            <Award className="w-3.5 h-3.5 text-primary-500 group-hover:text-primary-600" />
            <span className="border-b border-dashed border-primary-400 group-hover:border-primary-600">
              {row.archiveInfo.archiveNo}
            </span>
          </button>
        );
      },
    },
    {
      key: 'archivedAt',
      title: '归档时间',
      width: '150px',
      render: (row: Contract) => {
        if (!row.archiveInfo) {
          return <span className="text-sm text-gray-300">-</span>;
        }
        return (
          <div>
            <p className="text-sm text-gray-600">{formatDate(row.archiveInfo.archivedAt)}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              {row.archiveInfo.archivedByName}
            </p>
          </div>
        );
      },
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

        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all' as const, label: '全部合同' },
            { key: 'archived' as const, label: '已归档' },
            { key: 'unarchived' as const, label: '未归档' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setArchiveFilter(f.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                archiveFilter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

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

      <Modal
        isOpen={archiveCertModal.open}
        onClose={() => setArchiveCertModal({ open: false, contract: null })}
        title="归档凭证"
        size="md"
      >
        {archiveCertModal.contract?.archiveInfo && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">合同归档凭证</h3>
                    <p className="text-sm text-primary-700">Contract Archive Certificate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-600">凭证编号</p>
                  <p className="font-mono font-bold text-primary-800">{archiveCertModal.contract.archiveInfo.archiveNo}</p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">合同名称</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{archiveCertModal.contract.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">合同编号</p>
                    <p className="text-sm font-mono font-medium text-gray-900 mt-0.5">{archiveCertModal.contract.contractNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">合同金额</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formatCurrency(archiveCertModal.contract.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">合同版本</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">V{archiveCertModal.contract.version}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">签署日期</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(archiveCertModal.contract.archiveInfo.signDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">归档时间</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDateTime(archiveCertModal.contract.archiveInfo.archivedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">经办人</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{archiveCertModal.contract.archiveInfo.archivedByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">所属部门</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{archiveCertModal.contract.departmentName}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">合同摘要</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{archiveCertModal.contract.archiveInfo.summary}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">本凭证由系统自动生成，具有唯一编号</span>
                </div>
                <button
                  onClick={() => {
                    if (archiveCertModal.contract?.archiveInfo) {
                      navigator.clipboard.writeText(archiveCertModal.contract.archiveInfo.archiveNo);
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制编号
                </button>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setArchiveCertModal({ open: false, contract: null })}>
            关闭
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (archiveCertModal.contract) {
                navigate(`/contracts/${archiveCertModal.contract.id}`);
                setArchiveCertModal({ open: false, contract: null });
              }
            }}
          >
            查看合同详情
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
