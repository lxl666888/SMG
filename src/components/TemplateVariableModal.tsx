
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, AlertCircle, Settings2, Search } from 'lucide-react';
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

const TemplateVariableModal: React.FC<TemplateVariableModalProps> = ({ template, onClose, onSave }) => {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<TemplateVariable>({ name: '$', type: 'IP Netmask', description: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template.variables) {
        setVariables(template.variables);
    }
  }, [template]);

  const resetForm = () => {
      setFormData({ name: '$', type: 'IP Netmask', description: '', defaultValue: '' });
      setEditingIndex(null);
      setError(null);
      setIsFormOpen(false);
  };

  const handleAddNew = () => {
      resetForm();
      setIsFormOpen(true);
  };

  const handleEditClick = (index: number) => {
      setFormData({ ...variables[index] });
      setEditingIndex(index);
      setIsFormOpen(true);
      setError(null);
  };

  const handleSaveVariable = () => {
      if (!formData.name.startsWith('$') || formData.name.length < 2) {
          setError("变量名必须以 '$' 开头且不能为空");
          return;
      }
      
      const isDuplicate = variables.some((v, idx) => v.name === formData.name && idx !== editingIndex);
      if (isDuplicate) {
          setError("变量名已存在");
          return;
      }

      if (editingIndex !== null) {
          const updated = [...variables];
          updated[editingIndex] = formData;
          setVariables(updated);
      } else {
          setVariables([...variables, formData]);
      }
      
      resetForm();
  };

  const handleDelete = (index: number) => {
      const newVars = [...variables];
      newVars.splice(index, 1);
      setVariables(newVars);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[650px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
              <Settings2 className="w-5 h-5 mr-3 text-blue-600" />
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
                <div className="relative w-72">
                    <input 
                        type="text" 
                        placeholder="搜索变量..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        添加变量
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
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
                                <td className="px-4 py-3 font-mono text-blue-600 font-medium">{variable.name}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {TYPE_OPTIONS.find(t => t.value === variable.type)?.label || variable.type}
                                </td>
                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                                    {variable.defaultValue || '空'}
                                </td>
                                <td className="px-4 py-3 text-gray-500 truncate" title={variable.description}>
                                    {variable.description}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        <button 
                                            onClick={() => handleEditClick(idx)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(idx)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {variables.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 bg-gray-50/30">
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
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors">取消</button>
            <button onClick={() => onSave(variables)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">保存配置</button>
        </div>

        {/* ADD VARIABLE FORM MODAL (Matches Figure 2) */}
        {isFormOpen && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px] z-50">
                <div className="bg-white rounded-xl shadow-2xl w-[500px] flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Form Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-blue-600" /> 
                            {editingIndex !== null ? '编辑变量' : '新增变量'}
                        </h4>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">变量名称 (Name)</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => {
                                    // Ensure it starts with $
                                    let val = e.target.value;
                                    if (!val.startsWith('$') && val.length > 0) val = '$' + val.replace(/\$/g, '');
                                    else if (val.length === 0) val = '$';
                                    setFormData({...formData, name: val});
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                placeholder="$"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">变量名必须以 '$' 开头</p>
                        </div>

                        {/* Type Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">类型 (Type)</label>
                            <div className="relative">
                                <select 
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white"
                                >
                                    {TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Default Value Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">默认值 (Default)</label>
                            <input 
                                type="text" 
                                value={formData.defaultValue || ''}
                                onChange={e => setFormData({...formData, defaultValue: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                placeholder="选填，需符合类型格式"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">例如: 192.168.1.1/24</p>
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">描述 (Description)</label>
                            <textarea 
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-24"
                                placeholder="输入变量描述..."
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center text-xs text-red-600 bg-red-50 p-3 rounded border border-red-100">
                                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                        <button 
                            onClick={resetForm} 
                            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleSaveVariable} 
                            className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors"
                        >
                            {editingIndex !== null ? '保存配置' : '确认添加'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TemplateVariableModal;
