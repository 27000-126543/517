import { useState, useEffect } from 'react';
import { FileText, Sparkles, AlertTriangle, CheckCircle, Plus, X, Percent } from 'lucide-react';
import { Modal, ModalFooter } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useContractStore } from '../../store/useContractStore';
import type { RecommendedTemplate, Clause, ContractType } from '../../types';
import { formatContractType, truncateText } from '../../utils/format';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: RecommendedTemplate) => void;
  onInsertClause: (clause: Clause) => void;
  contractType?: ContractType;
  contractAmount?: number;
}

export function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  onInsertClause,
  contractType,
  contractAmount = 0,
}: TemplateSelectorProps) {
  const { getRecommendedTemplates, getRecommendedClauses } = useContractStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'clauses'>('templates');
  const [templates, setTemplates] = useState<RecommendedTemplate[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contractType) {
      const recommendedTemplates = getRecommendedTemplates(contractType, contractAmount);
      const recommendedClauses = getRecommendedClauses(contractType);
      setTemplates(recommendedTemplates);
      setClauses(recommendedClauses);
      setSelectedTemplateId(null);
    }
  }, [isOpen, contractType, contractAmount, getRecommendedTemplates, getRecommendedClauses]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleSelectTemplate = (template: RecommendedTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleConfirmTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      onSelectTemplate(template);
      onClose();
    }
  };

  const handleInsertClause = (clause: Clause) => {
    onInsertClause(clause);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="智能推荐" size="xl">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-sm font-medium text-primary-900">AI 智能推荐</p>
            <p className="text-xs text-primary-700">
              根据合同类型「{contractType ? formatContractType(contractType) : '未选择'}」和「{contractAmount > 0 ? `¥${contractAmount.toLocaleString()}` : '未设置'}」金额，为您推荐以下模板和条款
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            推荐模板 ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('clauses')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'clauses'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            推荐条款 ({clauses.length})
          </button>
        </div>

        {activeTab === 'templates' && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTemplateId === template.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedTemplateId === template.id ? 'bg-primary-500' : 'bg-gray-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          selectedTemplateId === template.id ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${getMatchScoreColor(template.matchScore)}`}>
                            <Percent className="w-3 h-3" />
                            {template.matchScore}% 匹配
                          </span>
                          {selectedTemplateId === template.id && (
                            <CheckCircle className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {truncateText(template.content, 100)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <p className="text-xs text-gray-400">风险提示：</p>
                          <div className="flex flex-wrap gap-1">
                            {template.riskTips.map((tip, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700 rounded"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {tip}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无匹配的模板</p>
                <p className="text-sm text-gray-400 mt-1">请先选择合同类型</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clauses' && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {clauses.length > 0 ? (
              clauses.map((clause) => (
                <div
                  key={clause.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{clause.title}</h4>
                        <StatusBadge type="risk" status={clause.riskLevel} />
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 mb-2">
                        {clause.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">风险提示：</span>{clause.riskDescription}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleInsertClause(clause)}
                      className="ml-4 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      插入
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无推荐的条款</p>
                <p className="text-sm text-gray-400 mt-1">请先选择合同类型</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          <X className="w-4 h-4 mr-1.5" />
          关闭
        </Button>
        {activeTab === 'templates' && selectedTemplateId && (
          <Button variant="primary" onClick={handleConfirmTemplate}>
            <CheckCircle className="w-4 h-4 mr-1.5" />
            使用此模板
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
