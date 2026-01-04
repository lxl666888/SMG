
import React, { useState } from 'react';
import { DeviceGroup, TemplateStack, Template } from '../types';
import { Search, ChevronRight, ChevronDown, MoreHorizontal, Folder, Server, Layers, FileCode, Plus, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  groups: DeviceGroup[];
  stacks: TemplateStack[];
  templates: Template[];
  selectedId: string | null;
  onSelect: (id: string, type: 'group' | 'device' | 'stack' | 'template_param') => void;
  onCreateStack: () => void;
  onCreateTemplate: () => void;
  initialViewMode?: 'devices' | 'templates';
  disableViewSwitcher?: boolean;
}

const TreeNode: React.FC<{
  node: DeviceGroup;
  level: number;
  selectedId: string | null;
  onSelect: (id: string, type: 'group' | 'device' | 'stack' | 'template_param') => void;
}> = ({ node, level, selectedId, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isDevice = node.type === 'device';

  // Status color mapping
  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="select-none">
      <div
        className={`
            flex items-center px-3 py-2 cursor-pointer text-sm group transition-all duration-200
            ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(node.id, node.type || 'group')}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`mr-1 p-0.5 rounded hover:bg-gray-200/50 ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3 opacity-70" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-70" />
          )}
        </button>
        
        <span className={`flex-1 truncate flex items-center`}>
            {isDevice ? (
                <div className="relative mr-2">
                    <Server className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(node.status)}`}></span>
                </div>
            ) : (
                <Folder className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
            
            <span className={isSelected ? 'font-medium' : ''}>{node.name}</span>
        </span>
      </div>
      
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    onAdd?: () => void;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ title, icon, onAdd, isExpanded, onToggle }) => (
    <div className="flex items-center justify-between px-4 py-2 mt-2 group">
        <div 
            className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
            onClick={onToggle}
        >
            {isExpanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
            {title}
        </div>
        {onAdd && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                }}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
                title={`新建${title}`}
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        )}
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
    groups, 
    stacks, 
    templates, 
    selectedId, 
    onSelect, 
    onCreateStack, 
    onCreateTemplate,
    initialViewMode = 'templates',
    disableViewSwitcher = false
}) => {
  const [viewMode, setViewMode] = useState<'devices' | 'templates'>(initialViewMode);
  const [expandedSections, setExpandedSections] = useState({
      stacks: true,
      templates: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 pb-2">
        <div className={`relative ${!disableViewSwitcher ? 'mb-3' : ''}`}>
          <input
            type="text"
            placeholder="搜索..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
        </div>

        {/* View Switcher Tabs (Segmented Control) */}
        {!disableViewSwitcher && (
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('templates')}
                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    模版视图
                </button>
                <button 
                    onClick={() => setViewMode('devices')}
                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'devices' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Server className="w-3.5 h-3.5 mr-1.5" />
                    设备视图
                </button>
            </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        
        {viewMode === 'devices' ? (
            /* 2. Devices Section */
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                {groups.map((group) => (
                    <TreeNode
                        key={group.id}
                        node={group}
                        level={0}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        ) : (
            /* 1. Templates Section */
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                
                {/* Parameters Section (Moved to Top) */}
                <SectionHeader 
                    title="模版参数 (Params)" 
                    icon={<FileCode className="w-3 h-3" />} 
                    onAdd={onCreateTemplate}
                    isExpanded={expandedSections.templates}
                    onToggle={() => toggleSection('templates')}
                />
                {expandedSections.templates && (
                    <div className="pl-2">
                        {templates.map(tmpl => (
                            <div 
                                key={tmpl.id}
                                onClick={() => onSelect(tmpl.id, 'template_param')}
                                className={`
                                    flex items-center px-3 py-2 cursor-pointer text-sm rounded-l-md border-l-2 ml-2 transition-colors
                                    ${selectedId === tmpl.id 
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-500 font-medium' 
                                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <FileCode className={`w-3.5 h-3.5 mr-2 ${selectedId === tmpl.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                                <span className="truncate">{tmpl.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="my-2 border-t border-gray-100"></div>

                {/* Stacks Section (Moved to Bottom) */}
                <SectionHeader 
                    title="网络模版 (Stacks)" 
                    icon={<Layers className="w-3 h-3" />} 
                    onAdd={onCreateStack}
                    isExpanded={expandedSections.stacks}
                    onToggle={() => toggleSection('stacks')}
                />
                {expandedSections.stacks && (
                    <div className="pl-2">
                        {stacks.map(stack => (
                            <div 
                                key={stack.id}
                                onClick={() => onSelect(stack.id, 'stack')}
                                className={`
                                    flex items-center px-3 py-2 cursor-pointer text-sm rounded-l-md border-l-2 ml-2 transition-colors
                                    ${selectedId === stack.id 
                                        ? 'bg-blue-50 text-blue-700 border-blue-500 font-medium' 
                                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <Layers className={`w-3.5 h-3.5 mr-2 ${selectedId === stack.id ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="truncate">{stack.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>
    </aside>
  );
};

export default Sidebar;
