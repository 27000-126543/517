import { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Save, X, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { Template, ContractType } from '../../types';
import { formatContractType } from '../../utils/format';

export default function TemplatesSettingsPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useContractStore();
  const { currentUser } = useUserStore();

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Template | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'purchase' as ContractType,
    content: '',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
  });

  const canEdit = currentUser.role === 'admin';

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'purchase',
      content: '',
      riskLevel: 'low',
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
      riskLevel: template.riskLevel,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) return;

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
    } else {
      addTemplate(formData);
    }
    resetForm();
  };

  const handleDelete = (template: Template) => {
    deleteTemplate(template.id);
    setDeleteConfirm(null);
  };

  const columns: Column<Template>[] = [
    {
      key: 'name',
      title: '模板名称',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">创建于 {row.createdAt}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: '适用类型',
      render: (row) => (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {formatContractType(row.type)}
        </span>
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
      key: 'content',
      title: '内容预览',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {row.content.substring(0, 50)}...
        </p>
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
            <h1 className="text-2xl font-bold text-gray-900">模板管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理合同模板库，新增、编辑和删除模板
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              新增模板
            </Button>
          )}
        </div>

        {!canEdit && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">权限提示</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                仅管理员可以新增、编辑和删除模板
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={templates}
              loading={false}
              emptyText="暂无模板"
              rowKey={(row) => row.id}
            />
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isCreating || !!editingTemplate}
        onClose={resetForm}
        title={editingTemplate ? '编辑模板' : '新增模板'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                模板名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入模板名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                适用类型 <span className="text-red-500">*</span>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              风险等级
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              模板内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入模板内容"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
            />
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
            disabled={!formData.name.trim() || !formData.content.trim()}
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
          确定要删除模板 <span className="font-medium text-gray-900">「{deleteConfirm?.name}」</span> 吗？
        </p>
        <p className="text-sm text-gray-500 mt-2">
          删除后无法恢复，请谨慎操作。
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
