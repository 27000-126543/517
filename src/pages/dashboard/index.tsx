import { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from './StatCard';
import { StatusDistribution } from './StatusDistribution';
import { ApprovalRanking } from './ApprovalRanking';
import { ExpiryWarning } from './ExpiryWarning';
import { DepartmentHeatmap } from './DepartmentHeatmap';
import { useApprovalStore } from '../../store/useApprovalStore';
import type { DashboardStats } from '../../types';

export default function DashboardPage() {
  const { fetchDashboardStats } = useApprovalStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <DashboardLayout onRefresh={loadData} showRefresh={true} showFullscreen={true} dark={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">合同管理数据大屏</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-400">
                  实时监控合同全生命周期状态
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>数据每5秒自动刷新</span>
                  <span className="text-gray-600">|</span>
                  <span>最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>

          {loading && !stats ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
                <p className="text-gray-400">加载数据中...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="合同总数"
                  value={stats.totalContracts}
                  unit="份"
                  icon={<FileText className="w-6 h-6" />}
                  color="blue"
                  trend={{ value: 12, isUp: true }}
                />
                <StatCard
                  title="待审批"
                  value={stats.pendingApproval}
                  unit="份"
                  icon={<Clock className="w-6 h-6" />}
                  color="yellow"
                  trend={{ value: 5, isUp: false }}
                />
                <StatCard
                  title="履约中"
                  value={stats.performing}
                  unit="份"
                  icon={<CheckCircle className="w-6 h-6" />}
                  color="green"
                  trend={{ value: 8, isUp: true }}
                />
                <StatCard
                  title="30天内到期"
                  value={stats.expiringIn30Days}
                  unit="份"
                  icon={<AlertTriangle className="w-6 h-6" />}
                  color="red"
                  trend={{ value: 3, isUp: true }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <StatusDistribution data={stats.statusDistribution} />
                <ApprovalRanking data={stats.approvalRanking} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DepartmentHeatmap data={stats.departmentHeatmap} />
                </div>
                <ExpiryWarning data={stats.expiryWarnings} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
