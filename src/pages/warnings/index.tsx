import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarDays, Clock, FileText, Eye, Bell } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import type { Warning } from '../../types';
type WarningType = 'expiry' | 'approval_timeout' | 'performance_overdue';
import { formatDateTime } from '../../utils/format';

type WarningFilter = 'all' | WarningType;

export default function WarningsPage() {
  const navigate = useNavigate();
  const { fetchWarnings } = useApprovalStore();
  const { currentUser } = useUserStore();

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WarningFilter>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchWarnings();
    setWarnings(data);
    setLoading(false);
  }, [fetchWarnings]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredWarnings = warnings.filter(w => {
    if (filter === 'all') return true;
    return w.type === filter;
  });

  const getWarningIcon = (type: WarningType) => {
    switch (type) {
      case 'expiry': return <CalendarDays className="w-5 h-5" />;
      case 'approval_timeout': return <Clock className="w-5 h-5" />;
      case 'performance_overdue': return <FileText className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getWarningIconBg = (type: WarningType) => {
    switch (type) {
      case 'expiry': return 'bg-orange-100 text-orange-600';
      case 'approval_timeout': return 'bg-red-100 text-red-600';
      case 'performance_overdue': return 'bg-purple-100 text-purple-600';
      default: return 'bg-yellow-100 text-yellow-600';
    }
  };

  const getWarningLevelBg = (level: string) => {
    switch (level) {
      case 'danger': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getWarningLevelBadge = (level: string) => {
    switch (level) {
      case 'danger': return 'bg-red-100 text-red-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getTypeLabel = (type: WarningType) => {
    switch (type) {
      case 'expiry': return '合同到期';
      case 'approval_timeout': return '审批超时';
      case 'performance_overdue': return '履约逾期';
      default: return '预警';
    }
  };

  const expiryCount = warnings.filter(w => w.type === 'expiry').length;
  const approvalTimeoutCount = warnings.filter(w => w.type === 'approval_timeout').length;
  const performanceOverdueCount = warnings.filter(w => w.type === 'performance_overdue').length;
  const dangerCount = warnings.filter(w => w.level === 'danger').length;

  const filters: { key: WarningFilter; label: string; count: number }[] = [
    { key: 'all', label: '全部预警', count: warnings.length },
    { key: 'expiry', label: '合同到期', count: expiryCount },
    { key: 'approval_timeout', label: '审批超时', count: approvalTimeoutCount },
    { key: 'performance_overdue', label: '履约逾期', count: performanceOverdueCount },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">预警中心</h1>
            <p className="text-sm text-gray-500 mt-1">
              集中查看合同到期、审批超时、履约逾期等预警信息
            </p>
          </div>
          <Button variant="secondary" onClick={loadData}>
            <Bell className="w-4 h-4 mr-1.5" />
            刷新预警
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">全部预警</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{warnings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">合同到期</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{expiryCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">审批超时</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{approvalTimeoutCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">履约逾期</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{performanceOverdueCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {dangerCount > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">紧急预警</p>
              <p className="text-xs text-red-600 mt-0.5">
                您有 {dangerCount} 条紧急预警需要立即处理
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

        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredWarnings.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无预警信息</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredWarnings.map((warning) => (
              <div
                key={warning.id}
                className={`p-4 rounded-lg border flex items-start gap-4 ${getWarningLevelBg(warning.level)}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getWarningIconBg(warning.type)}`}>
                  {getWarningIcon(warning.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{warning.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getWarningLevelBadge(warning.level)}`}>
                      {warning.level === 'danger' ? '紧急' : warning.level === 'warning' ? '警告' : '提示'}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-white rounded-full text-gray-600 border border-gray-200">
                      {getTypeLabel(warning.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{warning.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(warning.createdAt)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => warning.contractId && navigate(`/contracts/${warning.contractId}`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  查看
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
