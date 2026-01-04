
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, RotateCcw, AlertCircle, Settings2, Edit2, Check } from 'lucide-react';
import { TemplateVariable, Template } from '../types';

interface TemplateVariableModalProps {
  template: Template;
  onClose: () => void;
  onSave: (variables: TemplateVariable[]) => void;
}

const TYPE_OPTIONS = [
    { value: 'IP Netmask', label: 'IP掩码 (IP Netmask)' },
    { value: 'IP Range', label: 'IP范围 (IP Range)' },
    { value: 'IP Wildcard', label: 'IP通配符 (IP Wildcard)' },
    { value: 'FQDN', label: '域名 (FQDN)' },
    { value: 'Group ID', label: '组ID (Group ID)' },
    { value: 'Interface', label: '接口 (Interface)' },
];

// Regex Patterns
const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const CIDR_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[1-2]?[0-9]|[0-9])$/;
const FQDN_REGEX = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$)/;

const TemplateVariableModal: React.FC<TemplateVariableModalProps> = ({ template, onClose, onSave }) => {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which item is being edited
  const [formData, setFormData] = useState<TemplateVariable>({ name: '$', type: 'IP Netmask', description: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template.variables) {
        setVariables(template.variables);
    }
  }, [template]);

  // Validation Logic
  const validateValue = (type: string, value?: string): boolean => {
      if (!value) return true; // Empty is allowed as per requirement (default value is empty)
      
      switch(type) {
          case 'IP Netmask':
              return IP_REGEX.test(value) || CIDR_REGEX.test(value);
          case 'IP Range':
              // Simple check for "IP-IP"
              const parts = value.split('-');
              return parts.length === 2 && IP_REGEX.test(parts[0].trim()) && IP_REGEX.test(parts[1].trim());
          case 'FQDN':
              return FQDN_REGEX.test(value);
          case 'Group ID':
              return /^\d+$/.test(value);
          default:
              return true;
      }
  };

  const resetForm = () => {
      setFormData({ name: '$', type: 'IP Netmask', description: '', defaultValue: '' });
      setEditingIndex(null);
      setError(null);
      setIsAdding(false);
  };

  const handleEditClick = (index: number) => {
      setFormData({ ...variables[index] });
      setEditingIndex(index);
      setIsAdding(true);
      setError(null);
  };

  const handleSaveVariable = () => {
      // Name Validation
      if (!formData.name.startsWith('$') || formData.name.length < 2) {
          setError("变量名必须以 '$' 开头且不能为空");
          return;
      }
      
      // Duplicate Name Check (Skip check if editing self)
      const isDuplicate = variables.some((v, idx) => v.name === formData.name && idx !== editingIndex);
      if (isDuplicate) {
          setError("变量名已存在");
          return;
      }

      // Type/Value Validation
      if (!validateValue(formData.type, formData.defaultValue)) {
          let msg = "默认值格式不正确";
          if (formData.type === 'IP Netmask') msg = "请输入有效的 IP 地址或网段 (e.g. 1.1.1.1/24)";
          if (formData.type === 'IP Range') msg = "请输入有效的 IP 范围 (e.g. 1.1.1.1-1.1.1.20)";
          if (formData.type === 'FQDN') msg = "请输入有效的域名";
          if (formData.type === 'Group ID') msg = "组ID必须为数字";
          setError(msg);
          return;
      }

      if (editingIndex !== null) {
          // Update existing
          const updated = [...variables];
          updated[editingIndex] = formData;
          setVariables(updated);
      } else {
          // Add new
          setVariables([...variables, formData]);
      }
      
      resetForm();
  };

  const handleDelete = (index: number) => {
      const newVars = [...variables];
      newVars.splice(index, 1);
      setVariables(newVars);
  };

  const getTypeLabel = (typeVal: string) => {
      return TYPE_OPTIONS.find(t => t.value === typeVal)?.label || typeVal;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[650px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
              <Settings2 className="w-5 h-5 mr-2 text-indigo-600" />
              <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    模版变量定义 (Template Variables)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">所属模版: {template.name}</p>
              </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white relative">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-64">
                    <input 
                        type="text" 
                        placeholder="搜索变量..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-medium hover:bg-indigo-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        添加变量
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                            <th className="px-4 py-3 w-48">变量名称</th>
                            <th className="px-4 py-3 w-48">类型</th>
                            <th className="px-4 py-3 w-48">默认值</th>
                            <th className="px-4 py-3">描述</th>
                            <th className="px-4 py-3 w-24 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {variables.map((variable, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded" /></td>
                                <td className="px-4 py-3 font-mono text-indigo-600 font-medium">{variable.name}</td>
                                <td className="px-4 py-3 text-gray-600">{getTypeLabel(variable.type)}</td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                    {variable.defaultValue ? (
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">
                                            {variable.defaultValue}
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 italic">空</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]" title={variable.description}>
                                    {variable.description}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button 
                                            onClick={() => handleEditClick(idx)}
                                            className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                                            title="编辑"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(idx)}
                                            className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {variables.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 bg-gray-50/30">
                                    <div className="flex flex-col items-center justify-center">
                                        <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                                        <span>暂无变量定义，请点击上方“添加变量”按钮。</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded transition-colors">取消</button>
            <button onClick={() => onSave(variables)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition-colors">保存配置</button>
        </div>

        {/* Add/Edit Modal Overlay */}
        {isAdding && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px] z-10">
                <div className="bg-white rounded-lg shadow-xl w-[450px] p-6 animate-in zoom-in-95 duration-200 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                            {editingIndex !== null ? <Edit2 className="w-4 h-4 mr-2 text-blue-600" /> : <Plus className="w-4 h-4 mr-2 text-blue-600" />} 
                            {editingIndex !== null ? '编辑变量' : '新增变量'}
                        </h4>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">变量名称 (Name)</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                placeholder="$variable_name"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">变量名必须以 '$' 开头</p>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">类型 (Type)</label>
                            <select 
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            >
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Default Value */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">默认值 (Default)</label>
                            <input 
                                type="text" 
                                value={formData.defaultValue || ''}
                                onChange={e => setFormData({...formData, defaultValue: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                placeholder="选填，需符合类型格式"
                            />
                            {/* Format Hint */}
                            <p className="text-[10px] text-gray-400 mt-1">
                                {formData.type === 'IP Netmask' && '例如: 192.168.1.1/24'}
                                {formData.type === 'IP Range' && '例如: 192.168.1.10-192.168.1.20'}
                                {formData.type === 'FQDN' && '例如: www.example.com'}
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">描述 (Description)</label>
                            <textarea 
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-20"
                                placeholder="输入变量描述..."
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-2">
                            <button 
                                onClick={resetForm} 
                                className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleSaveVariable} 
                                className="px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                {editingIndex !== null ? '确认修改' : '确认添加'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TemplateVariableModal;
