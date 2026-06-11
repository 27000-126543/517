import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, XCircle, Eye, Calendar, DollarSign, Truck, ClipboardCheck, CheckSquare, AlertTriangle, User } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal, ModalFooter } from '../../components/common/Modal';
import type { Column } from '../../components/common/Table';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { PerformanceTask, TaskType } from '../../types';
import { formatDate, formatTaskType } from '../../utils/format';
import { canViewContract } from '../../utils/permission';

type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue';

export default function PerformanceTasksPage() {
  const navigate = useNavigate();
  const { fetchTasks, completeTask } = useApprovalStore();
  const { currentUser } = useUserStore();
  const { fetchContract } = useContractStore();

  const [tasks, setTasks] = useState<PerformanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [completeModal, setCompleteModal] = useState<{ open: boolean; taskId: string }>({ open: false, taskId: '' });
  const [completeNote, setCompleteNote] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const allTasks = await fetchTasks();
    const filteredTasks = allTasks.filter(task => {
      const contract = fetchContract(task.contractId);
      if (contract && !canViewContract(contract, currentUser)) {
        return false;
      }
      return true;
    });
    setTasks(filteredTasks);
    setLoading(false);
  }, [fetchTasks, fetchContract, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleComplete = async (taskId: string) => {
    setCompleteModal({ open: true, taskId });
    setCompleteNote('');
  };

  const confirmComplete = async () => {
    if (!completeModal.taskId) return;
    const success = await completeTask(completeModal.taskId, completeNote);
    if (success) {
      setCompleteModal({ open: false, taskId: '' });
      setCompleteNote('');
      loadData();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'delivery': return <Truck className="w-5 h-5" />;
      case 'acceptance': return <ClipboardCheck className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTaskIconBg = (type: TaskType) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-600';
      case 'delivery': return 'bg-blue-100 text-blue-600';
      case 'acceptance': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const columns: Column<PerformanceTask>[] = [
    {
      key: 'name',
      title: '任务信息',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTaskIconBg(row.type)}`}>
            {getTaskIcon(row.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{row.name}</p>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {formatTaskType(row.type)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{row.contractTitle}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'assignee',
      title: '负责人',
      width: '100px',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          <span>{row.assigneeName || '-'}</span>
        </div>
      ),
    },
    {
      key: 'plannedDate',
      title: '计划日期',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{formatDate(row.plannedDate)}</p>
          {row.actualDate && (
            <p className="text-xs text-green-600 mt-0.5">
              实际：{formatDate(row.actualDate)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge type="task" status={row.status} />
          {row.status === 'overdue' && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'description',
      title: '描述',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {row.description}
        </p>
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
          {row.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleComplete(row.id)}
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              标记完成
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  const filters: { key: TaskFilter; label: string; count: number }[] = [
    { key: 'all', label: '全部任务', count: tasks.length },
    { key: 'pending', label: '待完成', count: pendingCount },
    { key: 'completed', label: '已完成', count: completedCount },
    { key: 'overdue', label: '已逾期', count: overdueCount },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">履约任务</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理合同的付款、交货、验收等履约节点
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">全部任务</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
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
                  <p className="text-sm text-gray-500">待完成</p>
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
                  <p className="text-sm text-gray-500">已完成</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
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
                  <p className="text-sm text-gray-500">已逾期</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {overdueCount > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">逾期预警</p>
              <p className="text-xs text-red-600 mt-0.5">
                您有 {overdueCount} 个履约任务已逾期，请尽快处理
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={filteredTasks}
              loading={loading}
              emptyText={filter === 'all' ? '暂无履约任务' : `暂无${filters.find(f => f.key === filter)?.label}任务`}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/contracts/${row.contractId}`)}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={completeModal.open}
        onClose={() => setCompleteModal({ open: false, taskId: '' })}
        title="完成履约任务"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">请填写任务完成说明：</p>
          <textarea
            value={completeNote}
            onChange={(e) => setCompleteNote(e.target.value)}
            placeholder="请描述任务完成情况..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setCompleteModal({ open: false, taskId: '' })}>
            取消
          </Button>
          <Button variant="primary" onClick={confirmComplete} disabled={!completeNote.trim()}>
            <CheckCircle className="w-4 h-4 mr-1.5" />
            确认完成
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
