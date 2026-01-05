
import React, { useState } from 'react';
import { X, Settings2, FileCode, Variable, Search } from 'lucide-react';
import { TemplateStack, Template } from '../types';

interface StackVariablesModalProps {
  stack: TemplateStack;
  allTemplates: Template[];
  onClose: () => void;
  onEditTemplate: (templateId: string) => void;
}

const StackVariablesModal: React.FC<StackVariablesModalProps> = ({ stack, allTemplates, onClose, onEditTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredTemplates = stack.templates.map(tmpl => {
      const fullTemplate = allTemplates.find(t => t.id === tmpl.id) || tmpl;
      const variables = fullTemplate.variables || [];
      
      // If search term exists, check if template name OR any variable matches
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          const nameMatch = tmpl.name.toLowerCase().includes(lowerTerm);
          const varMatch = variables.some(v => v.name.toLowerCase().includes(lowerTerm));
          
          if (!nameMatch && !varMatch) return null; // Exclude this template from view if no match
          
          // If template matches by variable only, maybe we want to highlight? 
          // For now just return the full template context.
      }
      
      return { tmpl, variables };
  }).filter(Boolean) as { tmpl: Template, variables: any[] }[];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center">
              <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    模版变量总览
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                      查看模版堆栈 <span className="font-bold text-gray-700">{stack.name}</span> 中包含的所有变量定义及当前取值
                  </p>
              </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="搜索变量名称或模版名称..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
            {filteredTemplates.length > 0 ? (
                filteredTemplates.map(({ tmpl, variables }, index) => {
                    // Re-filter variables if searching, to only show matching variables? 
                    // Optional: keep it simple and show all variables of matched template for context, 
                    // OR filter variables list too. Let's filter list too for better UX.
                    const displayVariables = searchTerm 
                        ? variables.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || tmpl.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        : variables;

                    return (
                        <div key={tmpl.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div className="flex items-center">
                                    <span className="bg-gray-100 text-gray-500 text-xs font-mono px-2 py-1 rounded mr-3">
                                        {/* Find original index in stack for priority display */}
                                        优先级 {stack.templates.findIndex(t => t.id === tmpl.id) + 1}
                                    </span>
                                    <FileCode className="w-4 h-4 text-blue-500 mr-2" />
                                    <h4 className="font-bold text-gray-800">{tmpl.name}</h4>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-xs text-gray-500">{variables.length} 个变量</span>
                                </div>
                                <button 
                                    onClick={() => onEditTemplate(tmpl.id)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                                >
                                    <Settings2 className="w-3 h-3 mr-1" />
                                    管理定义
                                </button>
                            </div>
                            
                            <div className="p-0">
                                {displayVariables.length > 0 ? (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-2 w-1/4 font-medium">变量名</th>
                                                <th className="px-6 py-2 w-1/4 font-medium">类型</th>
                                                <th className="px-6 py-2 w-1/3 font-medium">当前值 (Stack Value)</th>
                                                <th className="px-6 py-2 font-medium">描述</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {displayVariables.map(v => {
                                                // Check for stack-level override in mappings
                                                const mapping = stack.variableMappings?.find(m => m.variable === v.name);
                                                const isOverridden = mapping?.value !== undefined && mapping?.value !== '';
                                                const displayValue = isOverridden ? mapping?.value : (v.defaultValue || '-');

                                                return (
                                                    <tr key={v.name} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-2 font-mono text-xs text-indigo-600 font-medium">
                                                            {v.name}
                                                        </td>
                                                        <td className="px-6 py-2 text-xs text-gray-600">
                                                            {v.type}
                                                        </td>
                                                        <td className="px-6 py-2 text-xs font-mono">
                                                            <div className="flex items-center">
                                                                <span className={`${isOverridden ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                                                                    {displayValue}
                                                                </span>
                                                                {isOverridden && (
                                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-600 border border-blue-100">
                                                                        覆盖
                                                                    </span>
                                                                )}
                                                                {!isOverridden && v.defaultValue && (
                                                                    <span className="ml-2 text-[9px] text-gray-400 italic">
                                                                        (默认)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2 text-xs text-gray-500 truncate max-w-[200px]">
                                                            {v.description || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="px-6 py-4 text-center text-gray-400 text-xs italic bg-gray-50/30">
                                        {searchTerm ? '未找到匹配的变量' : '此模版未定义任何变量'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Search className="w-12 h-12 mb-3 opacity-20" />
                    <p>{searchTerm ? '未找到匹配的模版或变量' : '当前模版堆栈未包含任何模版参数'}</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
            <button 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded transition-colors"
            >
                关闭
            </button>
        </div>
      </div>
    </div>
  );
};

export default StackVariablesModal;
