import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import type { ApprovalFlow } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function ApprovedApprovalsPage() {
  const navigate = useNavigate();
  const { fetchApprovedApprovalsForUser } = useApprovalStore();
  const { currentUser } = useUserStore();

  const [approvals, setApprovals] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    const data = fetchApprovedApprovalsForUser(currentUser.id);
    setApprovals(data);
    setLoading(false);
  }, [fetchApprovedApprovalsForUser, currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMyNode = (flow: ApprovalFlow) => {
    return flow.nodes.find(n => n.approverId === currentUser.id);
  };

  const columns: Column<ApprovalFlow>[] = [
    {
      key: 'contractTitle',
      title: '合同信息',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.contractTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            合同金额：{formatCurrency(row.contractAmount)}
          </p>
        </div>
      ),
    },
    {
      key: 'myNode',
      title: '我的审批',
      render: (row) => {
        const myNode = getMyNode(row);
        return (
          <div>
            <p className="font-medium text-gray-900">{myNode?.nodeName || '-'}</p>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{myNode?.approverName || '-'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '我的审批状态',
      render: (row) => {
        const myNode = getMyNode(row);
        return myNode ? (
          <StatusBadge type="approval" status={myNode.status} />
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'flowStatus',
      title: '整体状态',
      render: (row) => (
        <StatusBadge type="approval" status={row.status} />
      ),
    },
    {
      key: 'approvedAt',
      title: '审批时间',
      render: (row) => {
        const myNode = getMyNode(row);
        return myNode?.approvedAt ? (
          <div>
            <p className="text-sm text-gray-900">{formatDateTime(myNode.approvedAt)}</p>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'comment',
      title: '审批意见',
      render: (row) => {
        const myNode = getMyNode(row);
        return (
          <p className="text-sm text-gray-600 max-w-xs truncate">
            {myNode?.comment || '无意见'}
          </p>
        );
      },
    },
    {
      key: 'action',
      title: '操作',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/contracts/${row.contractId}`)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          查看
        </Button>
      ),
    },
  ];

  const approvedCount = approvals.filter(a => {
    const node = getMyNode(a);
    return node?.status === 'approved';
  }).length;

  const rejectedCount = approvals.filter(a => {
    const node = getMyNode(a);
    return node?.status === 'rejected';
  }).length;

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我已审批</h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {approvals.length} 条记录，其中通过 {approvedCount} 条，驳回 {rejectedCount} 条
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">全部记录</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{approvals.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
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
              data={approvals}
              loading={loading}
              emptyText="暂无已审批的合同"
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/contracts/${row.contractId}`)}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
