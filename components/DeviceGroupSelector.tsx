
import React, { useState, useEffect, useMemo } from 'react';
import { DeviceGroup } from '../types';
import { ChevronRight, ChevronDown, Folder, X, Save, Search, Server } from 'lucide-react';

interface DeviceGroupSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  groups: DeviceGroup[];
  selectedGroupIds: string[];
  onSave: (selectedIds: string[]) => void;
}

// Helper to filter groups based on search term
const filterGroups = (groups: DeviceGroup[], term: string): DeviceGroup[] => {
    if (!term) return groups;
    return groups.reduce((acc: DeviceGroup[], group) => {
        const matches = group.name.toLowerCase().includes(term.toLowerCase());
        const filteredChildren = group.children ? filterGroups(group.children, term) : [];
        
        if (matches || filteredChildren.length > 0) {
            acc.push({
                ...group,
                children: filteredChildren
            });
        }
        return acc;
    }, []);
};

const SelectorNode: React.FC<{
  node: DeviceGroup;
  level: number;
  checkedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  searchTerm: string;
}> = ({ node, level, checkedIds, onToggle, searchTerm }) => {
  // If searching, always expand to show matches
  const [expanded, setExpanded] = useState(!searchTerm); 
  const hasChildren = node.children && node.children.length > 0;
  const isChecked = checkedIds.has(node.name);
  const isDevice = node.type === 'device';

  useEffect(() => {
      if (searchTerm) setExpanded(true);
  }, [searchTerm]);

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(node.name, e.target.checked);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center px-3 py-2 hover:bg-gray-50 transition-colors`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`mr-2 p-0.5 rounded hover:bg-gray-200 ${hasChildren ? 'visible' : 'invisible'}`}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <input 
            type="checkbox" 
            checked={isChecked}
            onChange={handleCheck}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
        />
        
        <span className="flex-1 flex items-center text-sm text-gray-700">
             {isDevice ? (
                 <Server className="w-4 h-4 mr-2 text-gray-400" />
             ) : (
                 <Folder className="w-4 h-4 mr-2 text-blue-400" />
             )}
            {node.name}
            {!isDevice && node.count !== undefined && <span className="ml-1 text-gray-400 text-xs">({node.count})</span>}
        </span>
      </div>
      {hasChildren && expanded && (
        <div className="border-l border-gray-100 ml-4">
          {node.children!.map((child) => (
            <SelectorNode
              key={child.id}
              node={child}
              level={level + 1}
              checkedIds={checkedIds}
              onToggle={onToggle}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DeviceGroupSelector: React.FC<DeviceGroupSelectorProps> = ({ 
  isOpen, 
  onClose, 
  groups, 
  selectedGroupIds, 
  onSave 
}) => {
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedGroupIds));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
        setTempSelected(new Set(selectedGroupIds));
        setSearchTerm('');
    }
  }, [isOpen, selectedGroupIds]);

  const handleToggle = (id: string, checked: boolean) => {
    const newSet = new Set(tempSelected);
    if (checked) {
        newSet.add(id);
    } else {
        newSet.delete(id);
    }
    setTempSelected(newSet);
  };

  const handleSave = () => {
    onSave(Array.from(tempSelected));
  };

  const filteredGroups = useMemo(() => filterGroups(groups, searchTerm), [groups, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
                <h3 className="text-lg font-bold text-gray-800">关联设备范围</h3>
                <p className="text-xs text-gray-500 mt-0.5">选择该模版集将应用到的设备组或防火墙节点</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="搜索设备或组名称..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
            {filteredGroups.length > 0 ? (
                <div className="">
                    {filteredGroups.map(group => (
                        <SelectorNode 
                            key={group.id}
                            node={group}
                            level={0}
                            checkedIds={tempSelected}
                            onToggle={handleToggle}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                    <Server className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">未找到匹配的设备</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-500">
                已选择 {tempSelected.size} 项
            </span>
            <div className="flex space-x-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    取消
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center shadow-sm transition-all hover:shadow-md"
                >
                    <Save className="w-4 h-4 mr-1.5" />
                    确认关联
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceGroupSelector;
