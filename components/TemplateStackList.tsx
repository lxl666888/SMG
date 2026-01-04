
import React from 'react';
import { TemplateStack } from '../types';
import { Layers, Monitor, Plus, ChevronRight, Settings2 } from 'lucide-react';

interface TemplateStackListProps {
  stacks: TemplateStack[];
  onSelectStack: (stack: TemplateStack) => void;
  onCreateStack: () => void;
}

const TemplateStackList: React.FC<TemplateStackListProps> = ({ stacks, onSelectStack, onCreateStack }) => {
  return (
    <div className="p-8 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">网络环境模版</h1>
            <p className="text-gray-500 mt-1">管理和定义不同区域或业务场景下的网络配置基线</p>
          </div>
          <button 
            onClick={onCreateStack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建模版
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacks.map((stack) => (
            <div 
              key={stack.id}
              onClick={() => onSelectStack(stack)}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                   <Layers className="w-6 h-6" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded">
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {stack.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
                {stack.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs">
                 <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded">
                   <Monitor className="w-3.5 h-3.5 mr-1.5" />
                   <span>生效范围: {stack.assignedDeviceGroups.length > 0 ? `${stack.assignedDeviceGroups.length} 个设备组` : '未关联'}</span>
                 </div>
                 <div className="flex items-center text-gray-400 group-hover:translate-x-1 transition-transform">
                    <span className="mr-1">配置详情</span>
                    <ChevronRight className="w-3 h-3" />
                 </div>
              </div>
            </div>
          ))}

          {/* New Stack Placeholder Card */}
          <button
             onClick={onCreateStack}
             className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50/10 hover:text-blue-500 transition-all min-h-[240px]"
          >
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Plus className="w-6 h-6" />
             </div>
             <span className="font-medium">创建一个新的模版</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateStackList;
