import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Send, FileText, Clock, AlertTriangle, CheckCircle, XCircle, User, Building2, Calendar, Hash, DollarSign, FileUp } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { useContractStore } from '../../store/useContractStore';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import type { Contract, ApprovalFlow, PerformanceTask, ContractChange } from '../../types';
import { formatCurrency, formatDate, formatDateTime, formatContractType, getHoursRemaining, formatTaskType, formatUserRole } from '../../utils/format';
import { canEditContract, canSubmitApproval, canViewContract } from '../../utils/permission';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchContract, submitForApproval } = useContractStore();
  const { fetchApprovalFlow, fetchTasks, fetchChanges } = useApprovalStore();
  const { currentUser } = useUserStore();

  const [contract, setContract] = useState<Contract | null>(null);
  const [approvalFlow, setApprovalFlow] = useState<ApprovalFlow | null>(null);
  const [tasks, setTasks] = useState<PerformanceTask[]>([]);
  const [changes, setChanges] = useState<ContractChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'approval' | 'tasks' | 'changes'>('info');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const contractData = fetchContract(id);
      if (contractData) {
        if (!canViewContract(contractData, currentUser)) {
          navigate('/contracts');
          return;
        }
        setContract(contractData);
      }

      const flowData = fetchApprovalFlow(id);
      setApprovalFlow(flowData || null);

      const tasksData = await fetchTasks(id);
      setTasks(tasksData);

      const changesData = await fetchChanges(id);
      setChanges(changesData);
    } finally {
      setLoading(false);
    }
  }, [id, fetchContract, fetchApprovalFlow, fetchTasks, fetchChanges, currentUser, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitApproval = async () => {
    if (!contract) return;
    const success = await submitForApproval(contract.id);
    if (success) {
      setSubmitModal(false);
      loadData();
    }
  };

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) => (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900 mt-0.5">{value || '-'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">合同不存在</h3>
          <p className="text-gray-500 mt-2">您访问的合同可能已被删除</p>
          <Button className="mt-4" onClick={() => navigate('/contracts')}>返回列表</Button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { key: 'info' as const, label: '基本信息', count: null },
    { key: 'approval' as const, label: '审批流程', count: approvalFlow?.nodes.length || 0 },
    { key: 'tasks' as const, label: '履约任务', count: tasks.length },
    { key: 'changes' as const, label: '变更历史', count: changes.length },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/contracts')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <StatusBadge type="contract" status={contract.status} />
              <StatusBadge type="risk" status={contract.riskLevel} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatContractType(contract.type)} · {contract.departmentName} · {contract.creatorName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEditContract(contract, currentUser) && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/contracts/${contract.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-1.5" />
                编辑
              </Button>
            )}
            {canSubmitApproval(contract, currentUser) && (
              <Button
                variant="primary"
                onClick={() => setSubmitModal(true)}
              >
                <Send className="w-4 h-4 mr-1.5" />
                提交审批
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border-b border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500">合同编号</p>
              <p className="text-lg font-mono font-semibold text-primary-600 mt-1">{contract.contractNo}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">合同金额</p>
              <p className="text-lg font-mono font-semibold text-gray-900 mt-1">{formatCurrency(contract.amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">版本号</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">V{contract.version}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">归档编号</p>
              <p className="text-lg font-mono font-semibold text-gray-500 mt-1">{contract.archiveNo || '-'}</p>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">合同信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="合同类型" value={formatContractType(contract.type)} icon={FileText} />
                    <InfoItem label="合同金额" value={formatCurrency(contract.amount)} icon={DollarSign} />
                    <InfoItem label="开始日期" value={formatDate(contract.startDate)} icon={Calendar} />
                    <InfoItem label="结束日期" value={formatDate(contract.endDate)} icon={Calendar} />
                    <InfoItem label="签署日期" value={formatDate(contract.signDate || '')} icon={Calendar} />
                    <InfoItem label="创建时间" value={formatDateTime(contract.createdAt)} icon={Clock} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">甲方（我方）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary-500" />
                        <div>
                          <p className="font-semibold text-gray-900">{contract.partyA}</p>
                          <p className="text-sm text-gray-500">本公司</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">乙方（对方）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">{contract.partyB}</p>
                          <p className="text-sm text-gray-500">合作单位</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">创建信息</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-900">{contract.creatorName}</p>
                          <p className="text-sm text-gray-500">{contract.departmentName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">风险等级</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-8 h-8 ${
                          contract.riskLevel === 'high' ? 'text-red-500' :
                          contract.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                        <div>
                          <StatusBadge type="risk" status={contract.riskLevel} />
                          <p className="text-sm text-gray-500 mt-1">
                            {contract.riskLevel === 'high' ? '需要法务严格审核' :
                             contract.riskLevel === 'medium' ? '需要部门主管审批' : '常规合同流程'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">合同内容</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed">
                      {contract.content}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approval' && (
              <div>
                {approvalFlow ? (
                  <div className="relative">
                    <div className="space-y-6">
                      {approvalFlow.nodes.map((node, index) => {
                        const isPending = node.status === 'pending';
                        const isApproved = node.status === 'approved';
                        const isRejected = node.status === 'rejected';
                        const isCurrent = approvalFlow.currentNodeIndex === index;
                        const hoursLeft = getHoursRemaining(node.deadline);

                        return (
                          <div key={node.id} className="relative flex gap-4">
                            {index < approvalFlow.nodes.length - 1 && (
                              <div className={`absolute left-5 top-12 w-0.5 h-12 ${
                                isApproved ? 'bg-green-200' : 'bg-gray-200'
                              }`} />
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isApproved ? 'bg-green-500' :
                              isRejected ? 'bg-red-500' :
                              isPending ? 'bg-blue-500 ring-4 ring-blue-100' :
                              'bg-gray-300'
                            }`}>
                              {isApproved && <CheckCircle className="w-5 h-5 text-white" />}
                              {isRejected && <XCircle className="w-5 h-5 text-white" />}
                              {isPending && <Clock className="w-5 h-5 text-white" />}
                              {!isApproved && !isRejected && !isPending && (
                                <Hash className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{node.nodeName}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                      当前节点
                                    </span>
                                  )}
                                </div>
                                <StatusBadge type="approval" status={node.status} />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <User className="w-4 h-4" />
                                <span>{node.approverName}</span>
                                <span className="text-gray-300">|</span>
                                <Clock className="w-4 h-4" />
                                <span>
                                  截止时间：{formatDateTime(node.deadline)}
                                  {isPending && (
                                    <span className={`ml-2 ${
                                      hoursLeft < 24 ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                      （剩余 {hoursLeft} 小时）
                                    </span>
                                  )}
                                </span>
                              </div>
                              {node.comment && (
                                <div className="bg-white rounded p-3 border border-gray-100">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-700">审批意见：</span>
                                    {node.comment}
                                  </p>
                                  {node.approvedAt && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDateTime(node.approvedAt)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">暂无审批流程</h3>
                    <p className="text-gray-500 mt-2">此合同尚未提交审批</p>
                    {canSubmitApproval(contract, currentUser) && (
                      <Button className="mt-4" onClick={() => setSubmitModal(true)}>
                        <Send className="w-4 h-4 mr-1.5" />
                        提交审批
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          task.status === 'completed' ? 'bg-green-100' :
                          task.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {task.status === 'overdue' && <XCircle className="w-5 h-5 text-red-600" />}
                          {task.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{task.name}</span>
                            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                              {formatTaskType(task.type)}
                            </span>
                            <StatusBadge type="task" status={task.status} />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>计划日期：{formatDate(task.plannedDate)}</span>
                            {task.actualDate && <span>实际日期：{formatDate(task.actualDate)}</span>}
                          </div>
                        </div>
                        {task.status === 'pending' && (
                          <Button variant="secondary" size="sm">
                            标记完成
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">暂无履约任务</h3>
                    <p className="text-gray-500 mt-2">此合同当前没有待执行的履约任务</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'changes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">共 {changes.length} 条变更记录</p>
                  {contract.status === 'performing' && (
                    <Button variant="secondary" size="sm">
                      <FileUp className="w-4 h-4 mr-1.5" />
                      申请变更
                    </Button>
                  )}
                </div>
                {changes.length > 0 ? (
                  <div className="space-y-4">
                    {changes.map((change) => (
                      <div key={change.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              版本 V{change.oldVersion} → V{change.newVersion}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              change.status === 'approved' ? 'bg-green-100 text-green-700' :
                              change.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {change.status === 'approved' ? '已通过' :
                               change.status === 'rejected' ? '已驳回' : '待审核'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(change.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">变更原因：</span>{change.reason}
                        </p>
                        <p className="text-xs text-gray-400">
                          申请人：{change.createdByName} · {formatUserRole(currentUser.role)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">暂无变更记录</h3>
                    <p className="text-gray-500 mt-2">此合同尚未申请过变更</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        title="提交审批"
        size="sm"
      >
        <p className="text-gray-600">
          确定要提交合同 <span className="font-medium text-gray-900">「{contract.title}」</span> 进入审批流程吗？
        </p>
        <p className="text-sm text-gray-500 mt-2">
          提交后将根据合同金额（{formatCurrency(contract.amount)}）和风险等级自动分配审批节点。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSubmitModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmitApproval}>
            确认提交
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
