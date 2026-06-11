import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Upload, CheckCircle, XCircle, Clock, Eye, FileUp, Send } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { ContractChange, Contract } from '../../types';
import { formatDate } from '../../utils/format';
import { canViewContract } from '../../utils/permission';

export default function PerformanceChangesPage() {
  const navigate = useNavigate();
  const { fetchChanges, submitChange, approveChange, rejectChange } = useApprovalStore();
  const { contracts, fetchContract } = useContractStore();
  const { currentUser } = useUserStore();

  const [changes, setChanges] = useState<ContractChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);

  const viewableContracts = contracts.filter(c => canViewContract(c, currentUser) && c.status === 'performing');

  const loadData = useCallback(async () => {
    setLoading(true);
    const allChanges = await fetchChanges();
    const filteredChanges = allChanges.filter(change => {
      const contract = fetchContract(change.contractId);
      if (contract && !canViewContract(contract, currentUser)) {
        return false;
      }
      return true;
    });
    setChanges(filteredChanges);
    setLoading(false);
  }, [fetchChanges, fetchContract, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!selectedContractId || !reason.trim()) return;
    setProcessing(true);
    const contract = fetchContract(selectedContractId);
    if (contract) {
      await submitChange(
        selectedContractId,
        reason,
        contract.title,
        contract.version,
        currentUser.id,
        currentUser.name
      );
    }
    setProcessing(false);
    setCreateModal(false);
    setSelectedContractId('');
    setReason('');
    setFileName('');
    loadData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleApprove = async (changeId: string) => {
    approveChange(changeId);
    loadData();
  };

  const handleReject = async (changeId: string) => {
    rejectChange(changeId);
    loadData();
  };

  const columns: Column<ContractChange>[] = [
    {
      key: 'contractTitle',
      title: '合同信息',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.contractTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            版本变更：V{row.oldVersion} → V{row.newVersion}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      title: '变更原因',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {row.reason}
        </p>
      ),
    },
    {
      key: 'createdBy',
      title: '申请人',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{row.createdByName}</p>
          <p className="text-xs text-gray-500">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'approved' ? 'bg-green-100 text-green-700' :
          row.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status === 'approved' ? '已通过' :
           row.status === 'rejected' ? '已驳回' : '待审核'}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/contracts/${row.contractId}`)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            查看合同
          </Button>
          {row.status === 'pending' && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'legal') && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(row.id)}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                通过
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(row.id)}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                驳回
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = changes.filter(c => c.status === 'pending').length;
  const approvedCount = changes.filter(c => c.status === 'approved').length;
  const rejectedCount = changes.filter(c => c.status === 'rejected').length;

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">变更申请</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理合同变更申请，支持版本对比和审批流程
            </p>
          </div>
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            申请变更
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待审核</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已通过</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已驳回</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={changes}
              loading={loading}
              emptyText="暂无变更申请"
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/contracts/${row.contractId}`)}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="申请合同变更"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              选择合同 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">请选择要变更的合同（仅显示履约中的合同）</option>
              {viewableContracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.title} (V{contract.version})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              变更原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细说明变更原因和内容"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              附件说明
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                {fileName ? (
                  <p className="text-sm text-primary-600 font-medium">{fileName}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">点击上传或拖拽文件到此处</p>
                    <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、图片等格式</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedContractId || !reason.trim() || processing}
          >
            <Send className="w-4 h-4 mr-1.5" />
            {processing ? '提交中...' : '提交变更申请'}
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
