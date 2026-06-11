import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Sparkles, AlertTriangle, FileText, Building2, User, Calendar, DollarSign, FilePlus, X, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { TemplateSelector } from './TemplateSelector';
import { useContractStore } from '../../store/useContractStore';
import { useUserStore } from '../../store/useUserStore';
import type { Contract, CreateContractRequest, RecommendedTemplate, Clause, ContractType } from '../../types';
import { formatCurrency, formatContractType } from '../../utils/format';
import { canEditContract, canSubmitApproval } from '../../utils/permission';

interface FormData {
  title: string;
  type: ContractType;
  amount: string;
  partyA: string;
  partyB: string;
  startDate: string;
  endDate: string;
  content: string;
  templateId?: string;
}

const initialFormData: FormData = {
  title: '',
  type: 'purchase',
  amount: '',
  partyA: '本公司',
  partyB: '',
  startDate: '',
  endDate: '',
  content: '',
};

export default function ContractCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchContract, createContract, updateContract, submitForApproval } = useContractStore();
  const { currentUser } = useUserStore();

  const isEdit = !!id;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecommendedTemplate | null>(null);
  const [insertedClauses, setInsertedClauses] = useState<Clause[]>([]);
  const [submitModal, setSubmitModal] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isEdit && id) {
      const existing = fetchContract(id);
      if (existing) {
        if (!canEditContract(existing, currentUser)) {
          navigate('/contracts');
          return;
        }
        setContract(existing);
        setFormData({
          title: existing.title,
          type: existing.type,
          amount: existing.amount.toString(),
          partyA: existing.partyA,
          partyB: existing.partyB,
          startDate: existing.startDate,
          endDate: existing.endDate,
          content: existing.content,
          templateId: existing.templateId,
        });
      }
    }
  }, [isEdit, id, fetchContract, currentUser, navigate]);

  const contractTypeOptions: { value: ContractType; label: string }[] = [
    { value: 'purchase', label: '采购合同' },
    { value: 'sales', label: '销售合同' },
    { value: 'service', label: '服务合同' },
    { value: 'labor', label: '劳动合同' },
    { value: 'other', label: '其他合同' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入合同名称';
    }
    if (!formData.type) {
      newErrors.type = '请选择合同类型';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的合同金额';
    }
    if (!formData.partyB.trim()) {
      newErrors.partyB = '请输入乙方名称';
    }
    if (!formData.startDate) {
      newErrors.startDate = '请选择开始日期';
    }
    if (!formData.endDate) {
      newErrors.endDate = '请选择结束日期';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    if (!formData.content.trim()) {
      newErrors.content = '请输入合同内容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectTemplate = (template: RecommendedTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      content: template.content,
      templateId: template.id,
    }));
  };

  const handleInsertClause = (clause: Clause) => {
    setInsertedClauses(prev => [...prev, clause]);
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + '## ' + clause.title + '\n' + clause.content,
    }));
  };

  const handleRemoveClause = (clauseId: string) => {
    setInsertedClauses(prev => prev.filter(c => c.id !== clauseId));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const request: CreateContractRequest = {
        title: formData.title,
        type: formData.type,
        amount: parseFloat(formData.amount),
        partyA: formData.partyA,
        partyB: formData.partyB,
        startDate: formData.startDate,
        endDate: formData.endDate,
        content: formData.content,
        templateId: formData.templateId,
      };

      if (isEdit && id) {
        await updateContract(id, request);
      } else {
        await createContract(request);
      }
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const request: CreateContractRequest = {
        title: formData.title,
        type: formData.type,
        amount: parseFloat(formData.amount),
        partyA: formData.partyA,
        partyB: formData.partyB,
        startDate: formData.startDate,
        endDate: formData.endDate,
        content: formData.content,
        templateId: formData.templateId,
      };

      let newContract: Contract;
      if (isEdit && id) {
        newContract = await updateContract(id, request);
      } else {
        newContract = await createContract(request);
      }
      
      await submitForApproval(newContract.id);
      navigate(`/contracts/${newContract.id}?tab=approval`);
    } finally {
      setSubmitting(false);
      setSubmitModal(false);
    }
  };

  const calculateRiskLevel = (amount: number): 'low' | 'medium' | 'high' => {
    if (amount > 500000) return 'high';
    if (amount > 100000) return 'medium';
    return 'low';
  };

  const currentAmount = parseFloat(formData.amount) || 0;
  const currentRiskLevel = calculateRiskLevel(currentAmount);

  const FormField = ({
    label,
    icon: Icon,
    error,
    children,
    required,
  }: {
    label: string;
    icon?: any;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {Icon && <Icon className="w-4 h-4 inline mr-1.5 text-gray-400" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  const InputField = ({
    field,
    placeholder,
    type = 'text',
  }: {
    field: keyof FormData;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      type={type}
      value={formData[field]}
      onChange={(e) => handleChange(field, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
        errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
      }`}
    />
  );

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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? '编辑合同' : '新建合同'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? '修改合同信息，保存后可提交审批' : '填写合同信息，系统将智能推荐模板和条款'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              {loading ? '保存中...' : '保存草稿'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setSubmitModal(true)}
              disabled={submitting}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {submitting ? '提交中...' : '提交审批'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">基本信息</CardTitle>
                  {contract && (
                    <div className="flex items-center gap-2">
                      <StatusBadge type="contract" status={contract.status} />
                      <StatusBadge type="risk" status={contract.riskLevel} />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField label="合同名称" icon={FileText} required error={errors.title}>
                      <InputField field="title" placeholder="请输入合同名称" />
                    </FormField>
                  </div>
                  
                  <div>
                    <FormField label="合同类型" icon={FileText} required error={errors.type}>
                      <select
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value as ContractType)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                          errors.type ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                      >
                        {contractTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div>
                    <FormField label="合同金额（元）" icon={DollarSign} required error={errors.amount}>
                      <InputField field="amount" placeholder="请输入合同金额" type="number" />
                    </FormField>
                  </div>

                  <div>
                    <FormField label="甲方" icon={Building2} required>
                      <InputField field="partyA" placeholder="请输入甲方名称" />
                    </FormField>
                  </div>

                  <div>
                    <FormField label="乙方" icon={Building2} required error={errors.partyB}>
                      <InputField field="partyB" placeholder="请输入乙方名称" />
                    </FormField>
                  </div>

                  <div>
                    <FormField label="开始日期" icon={Calendar} required error={errors.startDate}>
                      <InputField field="startDate" type="date" />
                    </FormField>
                  </div>

                  <div>
                    <FormField label="结束日期" icon={Calendar} required error={errors.endDate}>
                      <InputField field="endDate" type="date" />
                    </FormField>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">合同内容</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTemplateSelectorOpen(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      智能推荐
                    </Button>
                    {selectedTemplate && (
                      <span className="text-xs text-gray-500">
                        使用模板：{selectedTemplate.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {insertedClauses.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <FilePlus className="w-4 h-4" />
                      已插入 {insertedClauses.length} 个条款
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insertedClauses.map((clause) => (
                        <span
                          key={clause.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-blue-200 rounded"
                        >
                          {clause.title}
                          <button
                            onClick={() => handleRemoveClause(clause.id)}
                            className="text-gray-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <FormField label="合同正文" icon={FileText} required error={errors.content}>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="请输入合同内容，或点击上方智能推荐按钮获取模板和条款建议"
                    rows={16}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none font-mono text-sm ${
                      errors.content ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  />
                </FormField>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">风险评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                    currentRiskLevel === 'high' ? 'bg-red-100' :
                    currentRiskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`w-8 h-8 ${
                      currentRiskLevel === 'high' ? 'text-red-500' :
                      currentRiskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <StatusBadge type="risk" status={currentRiskLevel} />
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">合同金额</span>
                    <span className="font-medium text-gray-900">{formatCurrency(currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">风险等级</span>
                    <span className={`font-medium ${
                      currentRiskLevel === 'high' ? 'text-red-600' :
                      currentRiskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {currentRiskLevel === 'high' ? '高风险' :
                       currentRiskLevel === 'medium' ? '中风险' : '低风险'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">合同类型</span>
                    <span className="font-medium text-gray-900">{formatContractType(formData.type)}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    {currentRiskLevel === 'high' && (
                      <>⚠️ 高风险合同需要部门主管、财务、法务和总经理四级审批</>
                    )}
                    {currentRiskLevel === 'medium' && (
                      <>⚡ 中风险合同需要部门主管和财务两级审批</>
                    )}
                    {currentRiskLevel === 'low' && (
                      <>✅ 低风险合同仅需部门主管一级审批</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && selectedTemplate.riskTips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">模板风险提示</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedTemplate.riskTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">操作指南</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                    <span>填写合同基本信息，确保必填项完整</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                    <span>点击「智能推荐」选择匹配的模板和条款</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                    <span>编辑合同内容，查看风险评估提示</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                    <span>保存草稿或直接提交审批流程</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TemplateSelector
        isOpen={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onInsertClause={handleInsertClause}
        contractType={formData.type}
        contractAmount={currentAmount}
      />

      <Modal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        title="提交审批"
        size="sm"
      >
        <p className="text-gray-600">
          确定要提交合同 <span className="font-medium text-gray-900">「{formData.title}」</span> 进入审批流程吗？
        </p>
        <p className="text-sm text-gray-500 mt-2">
          提交后将根据合同金额（{formatCurrency(currentAmount)}）和风险等级自动分配审批节点。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSubmitModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmitApproval} disabled={submitting}>
            {submitting ? '提交中...' : '确认提交'}
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
