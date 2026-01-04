
import React from 'react';
import { Template, TemplateStack } from '../types';
import { Plus, Edit3, Settings2, FileCode, Layers, Link } from 'lucide-react';

interface SubTemplateListProps {
  templates: Template[];
  stacks: TemplateStack[]; // Added to calculate references
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
}

const SubTemplateList: React.FC<SubTemplateListProps> = ({ templates, stacks, onSelectTemplate, onCreateTemplate }) => {
  return (
    <div className="p-8 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">模版参数</h1>
            <p className="text-gray-500 mt-1">创建和维护原子化的网络配置单元，供模版灵活调用</p>
          </div>
          {/* Header button removed as requested */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((tmpl) => {
            // Calculate which stacks use this template
            const relatedStacks = stacks.filter(stack => 
                stack.templates.some(t => t.id === tmpl.id)
            );

            return (
                <div 
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative flex flex-col h-[240px]"
                >
                <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileCode className="w-5 h-5" />
                    </div>
                    <button className="text-gray-400 hover:text-indigo-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="font-bold text-gray-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {tmpl.name}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                    {tmpl.description}
                </p>

                {/* Reference Section */}
                <div className="mt-auto bg-gray-50 rounded-lg p-2 mb-3">
                    <div className="flex items-center text-[10px] text-gray-400 mb-1.5 uppercase font-semibold tracking-wider">
                         <Link className="w-3 h-3 mr-1" />
                         被以下模版引用 ({relatedStacks.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                        {relatedStacks.length > 0 ? (
                            relatedStacks.slice(0, 2).map(stack => (
                                <span 
                                    key={stack.id} 
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-indigo-600 border border-indigo-100 shadow-sm truncate max-w-[120px]" 
                                    title={stack.name}
                                >
                                    <Layers className="w-3 h-3 mr-1 opacity-70" />
                                    {stack.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-400 italic pl-1">暂无引用</span>
                        )}
                        {relatedStacks.length > 2 && (
                             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                +{relatedStacks.length - 2}
                             </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                    <span className="text-[10px] text-gray-300 font-mono select-all hover:text-gray-500 transition-colors">
                        {tmpl.id}
                    </span>
                    <div className="flex items-center text-indigo-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-3 h-3 mr-1" />
                        编辑配置
                    </div>
                </div>
                </div>
            );
          })}

          {/* Create Button Card */}
          <button
             onClick={onCreateTemplate}
             className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:bg-indigo-50/10 hover:text-indigo-500 transition-all h-[240px]"
          >
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100">
               <Plus className="w-5 h-5" />
             </div>
             <span className="text-sm font-medium">新建模版参数</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubTemplateList;
