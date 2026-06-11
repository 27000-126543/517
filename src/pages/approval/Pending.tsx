import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, FileText, CheckCircle, XCircle, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import type { ApprovalFlow } from '../../types';
import { formatCurrency, formatDate, formatDateTime, getHoursRemaining, formatContractType } from '../../utils/format';

export default function PendingApprovalsPage() {
  const navigate = useNavigate();
  const { fetchPendingApprovalsForUser, approve, reject } = useApprovalStore();
  const { currentUser } = useUserStore();

  const [approvals, setApprovals] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ open: boolean; approve: boolean; flow?: ApprovalFlow; nodeId?: string }>({
    open: false,
    approve: true,
  });
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    const data = fetchPendingApprovalsForUser(currentUser.id);
    setApprovals(data);
    setLoading(false);
  }, [fetchPendingApprovalsForUser, currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    if (!actionModal.flow && !actionModal.nodeId) return;
    setProcessing(true);
    const success = await approve(actionModal.flow!.id, {
      nodeId: actionModal.nodeId!,
      action: 'approve',
      comment,
    }, currentUser.id);
    setProcessing(false);
    if (success) {
      setActionModal({ open: false, approve: true });
      setComment('');
      loadData();
    }
  };

  const handleReject = async () => {
    if (!actionModal.flow || !actionModal.nodeId) return;
    setProcessing(true);
    const success = await reject(actionModal.flow!.id, {
      nodeId: actionModal.nodeId!,
      action: 'reject',
      comment,
    }, currentUser.id);
    setProcessing(false);
    if (success) {
      setActionModal({ open: false, approve: false });
      setComment('');
      loadData();
    }
  };

  const columns: Column<ApprovalFlow>[] = [
    {
      key: 'contractTitle',
      title: '合同信息',
      render: (row) => {
        const currentNode = row.nodes[row.currentNodeIndex];
        const hoursLeft = currentNode ? getHoursRemaining(currentNode.deadline) : 0;
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{row.contractTitle}</p>
              {hoursLeft < 24 && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              合同金额：{formatCurrency(row.contractAmount)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'node',
      title: '审批节点',
      render: (row) => {
        const currentNode = row.nodes[row.currentNodeIndex];
        const hoursLeft = currentNode ? getHoursRemaining(currentNode.deadline) : 0;
        return (
          <div>
            <p className="font-medium text-gray-900">{currentNode?.nodeName || '-'}</p>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{currentNode?.approverName || '-'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'deadline',
      title: '截止时间',
      render: (row) => {
        const currentNode = row.nodes[row.currentNodeIndex];
        const hoursLeft = currentNode ? getHoursRemaining(currentNode.deadline) : 0;
        return (
          <div>
          <p className="text-sm text-gray-900">{currentNode ? formatDateTime(currentNode.deadline) : '-'}</p>
          {currentNode && (
            <p className={`text-xs mt-1 ${
              hoursLeft < 24 ? 'text-red-600' : hoursLeft < 48 ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              <Clock className="w-3 h-3 inline mr-1" />
              剩余 {hoursLeft} 小时
            </p>
          )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: () => (
        <StatusBadge type="approval" status="pending" />
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (row) => {
        const currentNode = row.nodes[row.currentNodeIndex];
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/contracts/${row.contractId}`)}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              查看
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActionModal({ open: true, approve: true, flow: row, nodeId: currentNode?.id });
                setComment('');
              }}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              通过
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setActionModal({ open: true, approve: false, flow: row, nodeId: currentNode?.id });
                setComment('');
              }}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              驳回
            </Button>
          </div>
        );
      },
    },
  ];

  const urgentCount = approvals.filter(a => {
    const node = a.nodes[a.currentNodeIndex];
    return node && getHoursRemaining(node.deadline) < 24;
  }).length;

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">待我审批</h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {approvals.length} 条待审批，其中 {urgentCount} 条即将超时
            </p>
          </div>
        </div>

        {urgentCount > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">超时预警</p>
              <p className="text-xs text-red-600 mt-0.5">
                您有 {urgentCount} 条审批将在24小时内超时，请尽快处理
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={approvals}
              loading={loading}
              emptyText="暂无待审批的合同"
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/contracts/${row.contractId}`)}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, approve: true })}
        title={actionModal.approve ? '审批通过' : '审批驳回'}
        size="md"
      >
        <div className="space-y-4">
          {actionModal.flow && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{actionModal.flow.contractTitle}</p>
            <p className="text-xs text-gray-500 mt-1">
              金额：{formatCurrency(actionModal.flow.contractAmount)} · {actionModal.flow.nodes[actionModal.flow.currentNodeIndex]?.nodeName}
            </p>
          </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {actionModal.approve ? '审批意见' : '驳回原因'}
              {!actionModal.approve && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionModal.approve ? '请输入审批意见（选填）' : '请输入驳回原因（必填）'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setActionModal({ open: false, approve: true })}>
            取消
          </Button>
          {actionModal.approve ? (
            <Button variant="primary" onClick={handleApprove} disabled={processing}>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {processing ? '处理中...' : '确认通过'}
            </Button>
          ) : (
            <Button variant="danger" onClick={handleReject} disabled={processing || !comment.trim()}>
              <XCircle className="w-4 h-4 mr-1.5" />
              {processing ? '处理中...' : '确认驳回'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
