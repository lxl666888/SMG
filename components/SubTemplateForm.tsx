import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileCode, Info, ChevronRight, ChevronDown, Check, Minus } from 'lucide-react';

interface SubTemplateFormProps {
  onSave: (name: string, description: string, modules: string[]) => void;
  onCancel: () => void;
}

interface ModuleNode {
  id: string;
  label: string;
  children?: ModuleNode[];
}

const MODULE_TREE: ModuleNode[] = [
  {
    id: 'all',
    label: '全部',
    children: [
      {
        id: 'network',
        label: '网络',
        children: [
            { id: 'network_interfaces', label: '接口' },
            { id: 'network_zones', label: '区域' },
            { id: 'network_vwire', label: '虚拟网线' },
            { id: 'network_vlist', label: '虚拟线路列表' },
        ]
      },
      {
        id: 'system',
        label: '系统',
        children: [
             { id: 'system_general', label: '通用设置' },
             { id: 'system_logs', label: '日志设置' },
             { id: 'system_log_hosts', label: '日志主机列表' },
             { id: 'system_snmp', label: 'SNMP' },
             { id: 'system_modules', label: '模块功能设置' },
        ]
      }
    ]
  }
];

const SubTemplateForm: React.FC<SubTemplateFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{name?: string}>({});
  
  // Tree State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['all', 'network', 'system']));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['all', 'network', 'network_interfaces', 'network_zones', 'network_vwire', 'network_vlist', 'system', 'system_general']));

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Get all descendant IDs of a node
  const getDescendantIds = (node: ModuleNode): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child)];
      });
    }
    return ids;
  };

  const isChecked = (id: string) => selectedIds.has(id);
  
  const handleCheck = (node: ModuleNode) => {
    const idsToToggle = getDescendantIds(node);
    const isCurrentlyChecked = isChecked(node.id);
    
    const newSelected = new Set(selectedIds);
    
    if (isCurrentlyChecked) {
      // Uncheck
      idsToToggle.forEach(id => newSelected.delete(id));
      
      // Also uncheck ancestors if they become partial? 
      // Simplified: If we uncheck a child, the parent 'all' selection logic might get complicated to sync perfectly 
      // without a full tree traversal bottom-up. 
      // For this demo, we'll just uncheck the node and children.
      // Ideally we should also uncheck 'all' if 'network' is unchecked.
      // Let's do a simple pass to remove 'all' if any child is removed.
      if (newSelected.has('all')) newSelected.delete('all');
      if (node.id.startsWith('network_') && newSelected.has('network')) newSelected.delete('network');
      if (node.id.startsWith('system_') && newSelected.has('system')) newSelected.delete('system');
      
    } else {
      // Check
      idsToToggle.forEach(id => newSelected.add(id));
      
      // Auto-check parent if all siblings checked? 
      // For demo, we can just ensure 'network' is checked if we clicked 'network' (already handled by idsToToggle).
      // If we clicked a leaf, we might need to check parent.
      // Simple Hack: If we check a leaf, ensure its direct parent category is checked if logically appropriate, 
      // but strictly we should check if ALL siblings are checked. 
      // Let's just leave strictly manual or simple parent checking for now.
    }
    
    setSelectedIds(newSelected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        setErrors({ name: '模版名称不能为空' });
        return;
    }
    onSave(name, description, Array.from(selectedIds));
  };

  // Recursive Tree Renderer
  const renderTree = (nodes: ModuleNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedIds.has(node.id);
      const checked = isChecked(node.id);
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <React.Fragment key={node.id}>
          <div 
            className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${node.id === 'all' ? 'bg-gray-50/50' : ''}`}
          >
            <div 
                className="flex items-center cursor-pointer select-none"
                style={{ paddingLeft: `${level * 24}px` }}
                onClick={() => toggleExpand(node.id)}
            >
              <div className={`mr-2 p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-colors ${!hasChildren ? 'invisible' : ''}`}>
                 {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              <span className={`text-sm ${level === 0 ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                  {node.label}
              </span>
            </div>
            
            <div onClick={() => handleCheck(node)} className="cursor-pointer">
               {checked ? (
                   <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                       <Check className="w-3.5 h-3.5 text-white" />
                   </div>
               ) : (
                   <div className="w-5 h-5 border border-gray-300 rounded bg-white hover:border-blue-400 transition-colors"></div>
               )}
            </div>
          </div>
          {hasChildren && isExpanded && renderTree(node.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {/* Header */}
       <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
              <button 
                onClick={onCancel}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                  <h1 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded text-blue-600 flex items-center justify-center mr-2">
                          <PlusIcon className="w-3.5 h-3.5" />
                      </div>
                      新建模版参数
                  </h1>
              </div>
          </div>
       </div>

       {/* Form Body */}
       <div className="flex-1 overflow-y-auto p-8">
           <div className="max-w-3xl mx-auto">
               <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    
                    {/* Basic Info */}
                    <div className="mb-8">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-base font-bold text-gray-800">基础信息配置</h2>
                            <p className="text-sm text-gray-500 mt-1">定义模版参数的名称和用途，创建后将直接关联到来源模版。</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    模版名称 <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if(errors.name) setErrors({});
                                    }}
                                    placeholder="例如：访客区域安全策略"
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'}`}
                                    autoFocus
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    描述说明
                                </label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="简要描述该模版包含的网络配置内容..."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature Modules Scope */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-base font-bold text-gray-800 mr-2">功能模块</h2>
                            <span title="选择该模版可以配置的功能范围" className="cursor-help flex items-center">
                                <Info className="w-4 h-4 text-gray-400" />
                            </span>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Table Header */}
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                                <span className="font-semibold text-gray-600 text-sm">页面</span>
                                <div className="w-5 h-5"></div> {/* Placeholder for alignment */}
                            </div>
                            
                            {/* Tree Content */}
                            <div className="max-h-[320px] overflow-y-auto">
                                {renderTree(MODULE_TREE)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 flex items-start">
                        <FileCode className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        <p>
                            提示：当前仅需配置基础元数据。点击保存后，该模版将被自动添加到模版集的首位，您可以随后在模版集中点击它来配置具体的网络接口、路由或区域策略。
                        </p>
                    </div>

                    <div className="pt-6 flex items-center justify-end space-x-3 border-t border-gray-50 mt-8">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center transition-all hover:shadow-md"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            保存并关联
                        </button>
                    </div>
               </form>
           </div>
       </div>
    </div>
  );
};

const PlusIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default SubTemplateForm;