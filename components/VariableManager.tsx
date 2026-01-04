import React, { useState, useEffect } from 'react';
import { VariableMapping, TemplateStack, Template } from '../types';
import { Search, Server, Edit2, Check, X, Sliders, Layers, AlertTriangle } from 'lucide-react';

interface VariableManagerProps {
  stack: TemplateStack;
  allTemplates: Template[];
  onSave: (newMappings: VariableMapping[]) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({ stack, allTemplates, onSave }) => {
  const [mappings, setMappings] = useState<VariableMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate aggregated variables from the stack's templates
  useEffect(() => {
      // 1. Identify all templates in this stack
      const stackTemplateIds = stack.templates.map(t => t.id);
      
      // 2. Collect all variables defined in these templates
      const aggregatedVars: Map<string, { variable: string, description: string, defaultValue: string, sourceTemplates: string[] }> = new Map();

      stack.templates.forEach(tmpl => {
          // Find the full template object to get variables (in case stack.templates only has summaries, though typically it has full ref)
          // Ideally rely on the passed `stack.templates` if populated, or lookup in `allTemplates`. 
          // Assuming `stack.templates` is populated with `variables`.
          const fullTmpl = allTemplates.find(t => t.id === tmpl.id) || tmpl;
          
          if (fullTmpl.variables) {
              fullTmpl.variables.forEach(v => {
                  if (!aggregatedVars.has(v.name)) {
                      aggregatedVars.set(v.name, {
                          variable: v.name,
                          description: v.description || '',
                          defaultValue: v.defaultValue || '',
                          sourceTemplates: [fullTmpl.name]
                      });
                  } else {
                      const existing = aggregatedVars.get(v.name)!;
                      existing.sourceTemplates.push(fullTmpl.name);
                  }
              });
          }
      });

      // 3. Merge with existing mappings in the stack to preserve set values
      const mergedMappings: VariableMapping[] = Array.from(aggregatedVars.values()).map(v => {
          const existingMapping = stack.variableMappings?.find(m => m.variable === v.variable);
          return {
              variable: v.variable,
              description: v.description + (v.sourceTemplates.length > 1 ? ` (from: ${v.sourceTemplates.join(', ')})` : ''),
              value: existingMapping?.value || '', // Stack-level override
              deviceValues: existingMapping?.deviceValues || {}
          };
      });

      setMappings(mergedMappings);

  }, [stack, allTemplates]);

  const handleStackValueChange = (variableName: string, value: string) => {
      setMappings(prev => prev.map(m => 
          m.variable === variableName ? { ...m, value } : m
      ));
  };

  const handleSaveAll = () => {
      onSave(mappings);
  };

  const filteredMappings = mappings.filter(m => 
      m.variable.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header / Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <Sliders className="w-4 h-4 mr-2 text-indigo-600" />
                    变量映射管理 (Variable Mapping)
                </h3>
                <p className="text-xs text-gray-500 mt-1">管理当前模版堆栈中所有引用变量的具体数值</p>
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="搜索变量..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <button 
                    onClick={handleSaveAll}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center shadow-sm"
                >
                    <Check className="w-3.5 h-3.5 mr-1" /> 保存变更
                </button>
            </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-3">变量名称</th>
                        <th className="px-6 py-3">来源模版</th>
                        <th className="px-6 py-3 w-1/3">
                            <div className="flex items-center">
                                堆栈值 (Stack Value)
                                <span title="此值将应用到所有未单独覆盖的设备">
                                    <AlertTriangle className="w-3 h-3 text-orange-400 ml-1" />
                                </span>
                            </div>
                        </th>
                        <th className="px-6 py-3">描述</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredMappings.map((mapping) => {
                        // Find original definition for default value hint
                        // In a real app we'd store this better, simplified here
                        
                        return (
                            <tr key={mapping.variable} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-3">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-mono font-bold border border-indigo-100">
                                        {mapping.variable}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Layers className="w-3 h-3 mr-1.5 opacity-50" />
                                        自动聚合
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="text" 
                                            value={mapping.value || ''}
                                            onChange={(e) => handleStackValueChange(mapping.variable, e.target.value)}
                                            className={`
                                                w-full max-w-md px-3 py-1.5 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all
                                                ${mapping.value 
                                                    ? 'border-indigo-300 bg-white text-gray-900' 
                                                    : 'border-gray-200 bg-gray-50 text-gray-400'
                                                }
                                            `}
                                            placeholder="未设置 (None)"
                                        />
                                        <Edit2 className="w-3.5 h-3.5 ml-2 text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none absolute right-2" />
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-xs text-gray-500">
                                    {mapping.description}
                                </td>
                            </tr>
                        );
                    })}
                    {filteredMappings.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <Sliders className="w-12 h-12 mb-3 opacity-20" />
                                    <p>当前模版堆栈中未检测到任何变量定义。</p>
                                    <p className="text-xs mt-1">请在“模版构成”中编辑具体的模版参数并添加变量。</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default VariableManager;