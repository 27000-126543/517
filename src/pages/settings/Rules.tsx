import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, Save, X, AlertTriangle, Hash, DollarSign } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import type { ApprovalRule, ContractType, RiskLevel } from '../../types';
import { formatCurrency, formatContractType } from '../../utils/format';

interface RuleForm {
  name: string;
  type: ContractType;
  minAmount: string;
  maxAmount: string;
  riskLevel: RiskLevel;
  approvalNodes: Array<{ name: string; role?: string; userId?: string }>;
}

export default function RulesSettingsPage() {
  const { approvalRules, addApprovalRule, updateApprovalRule, deleteApprovalRule } = useApprovalStore();
  const { currentUser } = useUserStore();

  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ApprovalRule | null>(null);

  const [formData, setFormData] = useState<RuleForm>({
    name: '',
    type: 'purchase',
    minAmount: '0',
    maxAmount: '100000',
    riskLevel: 'low',
    approvalNodes: [{ name: '部门主管审批', role: 'manager' }],
  });

  const canEdit = currentUser.role === 'admin';

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'purchase',
      minAmount: '0',
      maxAmount: '100000',
      riskLevel: 'low',
      approvalNodes: [{ name: '部门主管审批', role: 'manager' }],
    });
    setEditingRule(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type as ContractType,
      minAmount: rule.minAmount.toString(),
      maxAmount: rule.maxAmount.toString(),
      riskLevel: rule.riskLevel,
      approvalNodes: [...rule.approvalNodes],
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || formData.approvalNodes.length === 0) return;

    const data = {
      name: formData.name,
      type: formData.type,
      minAmount: parseFloat(formData.minAmount) || 0,
      maxAmount: parseFloat(formData.maxAmount) || 999999999,
      riskLevel: formData.riskLevel,
      approvalNodes: formData.approvalNodes,
    };

    if (editingRule) {
      updateApprovalRule(editingRule.id, data);
    } else {
      addApprovalRule(data);
    }
    resetForm();
  };

  const handleDelete = (rule: ApprovalRule) => {
    deleteApprovalRule(rule.id);
    setDeleteConfirm(null);
  };

  const addNode = () => {
    setFormData({
      ...formData,
      approvalNodes: [...formData.approvalNodes, { name: '', role: 'manager' }],
    });
  };

  const removeNode = (index: number) => {
    setFormData({
      ...formData,
      approvalNodes: formData.approvalNodes.filter((_, i) => i !== index),
    });
  };

  const updateNode = (index: number, field: string, value: string) => {
    setFormData({
      ...formData,
      approvalNodes: formData.approvalNodes.map((node, i) =>
        i === index ? { ...node, [field]: value } : node
      ),
    });
  };

  const columns: Column<ApprovalRule>[] = [
    {
      key: 'name',
      title: '规则名称',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatContractType(row.type as ContractType)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      title: '金额范围',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">
            {formatCurrency(row.minAmount)} - {formatCurrency(row.maxAmount)}
          </p>
        </div>
      ),
    },
    {
      key: 'riskLevel',
      title: '风险等级',
      render: (row) => (
        <StatusBadge type="risk" status={row.riskLevel} />
      ),
    },
    {
      key: 'nodes',
      title: '审批节点',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.approvalNodes.map((node, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              <Hash className="w-3 h-3" />
              {node.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (row) => canEdit ? (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteConfirm(row)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">审批规则</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理审批流程规则，根据合同类型、金额和风险等级动态分配审批节点
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              新增规则
            </Button>
          )}
        </div>

        {!canEdit && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">权限提示</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                仅管理员可以新增、编辑和删除审批规则
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={approvalRules}
              loading={false}
              emptyText="暂无审批规则"
              rowKey={(row) => row.id}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isCreating || !!editingRule}
        onClose={resetForm}
        title={editingRule ? '编辑审批规则' : '新增审批规则'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              规则名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入规则名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                合同类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="purchase">采购合同</option>
                <option value="sales">销售合同</option>
                <option value="service">服务合同</option>
                <option value="labor">劳动合同</option>
                <option value="other">其他合同</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                风险等级
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">低风险</option>
                <option value="medium">中风险</option>
                <option value="high">高风险</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <DollarSign className="w-4 h-4 inline mr-1" />
                最小金额（元）
              </label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <DollarSign className="w-4 h-4 inline mr-1" />
                最大金额（元）
              </label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                placeholder="999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                审批节点 <span className="text-red-500">*</span>
              </label>
              <Button variant="secondary" size="sm" onClick={addNode}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                添加节点
              </Button>
            </div>
            <div className="space-y-2">
              {formData.approvalNodes.map((node, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={node.name}
                    onChange={(e) => updateNode(index, 'name', e.target.value)}
                    placeholder="节点名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={node.role || 'manager'}
                    onChange={(e) => updateNode(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="manager">部门主管</option>
                    <option value="legal">法务</option>
                    <option value="admin">管理员</option>
                  </select>
                  {formData.approvalNodes.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeNode(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={resetForm}>
            <X className="w-4 h-4 mr-1.5" />
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.name.trim() || formData.approvalNodes.length === 0}
          >
            <Save className="w-4 h-4 mr-1.5" />
            保存
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600">
          确定要删除规则 <span className="font-medium text-gray-900">「{deleteConfirm?.name}」</span> 吗？
        </p>
        <p className="text-sm text-gray-500 mt-2">
          删除后新提交的审批将不再使用此规则匹配节点。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            <Trash2 className="w-4 h-4 mr-1.5" />
            确认删除
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
