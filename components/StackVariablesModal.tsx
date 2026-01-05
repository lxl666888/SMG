
import React from 'react';
import { X, Settings2, FileCode, Variable } from 'lucide-react';
import { TemplateStack, Template } from '../types';

interface StackVariablesModalProps {
  stack: TemplateStack;
  allTemplates: Template[];
  onClose: () => void;
  onEditTemplate: (templateId: string) => void;
}

const StackVariablesModal: React.FC<StackVariablesModalProps> = ({ stack, allTemplates, onClose, onEditTemplate }) => {
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
                      查看模版堆栈 <span className="font-bold text-gray-700">{stack.name}</span> 中包含的所有变量定义
                  </p>
              </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
            {stack.templates.map((tmpl, index) => {
                // Find full template data to get variables
                const fullTemplate = allTemplates.find(t => t.id === tmpl.id) || tmpl;
                const variables = fullTemplate.variables || [];

                return (
                    <div key={tmpl.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center">
                                <span className="bg-gray-100 text-gray-500 text-xs font-mono px-2 py-1 rounded mr-3">
                                    优先级 {index + 1}
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
                            {variables.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-2 w-1/4 font-medium">变量名</th>
                                            <th className="px-6 py-2 w-1/4 font-medium">类型</th>
                                            <th className="px-6 py-2 w-1/4 font-medium">默认值</th>
                                            <th className="px-6 py-2 font-medium">描述</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {variables.map(v => (
                                            <tr key={v.name} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-2 font-mono text-xs text-indigo-600 font-medium">
                                                    {v.name}
                                                </td>
                                                <td className="px-6 py-2 text-xs text-gray-600">
                                                    {v.type}
                                                </td>
                                                <td className="px-6 py-2 text-xs text-gray-500 font-mono">
                                                    {v.defaultValue || '-'}
                                                </td>
                                                <td className="px-6 py-2 text-xs text-gray-500 truncate max-w-[200px]">
                                                    {v.description || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-4 text-center text-gray-400 text-xs italic bg-gray-50/30">
                                    此模版未定义任何变量
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {stack.templates.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Variable className="w-12 h-12 mb-3 opacity-20" />
                    <p>当前模版堆栈未包含任何模版参数。</p>
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
