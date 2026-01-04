
import React, { useState } from 'react';
import { 
  Box, 
  Globe, 
  Zap, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search,
  FolderOpen,
  Folder,
  Monitor
} from 'lucide-react';
import { MOCK_NETWORK_OBJECTS } from '../constants';

interface ObjectManagerProps {
  selectedNodeId: string;
  selectedNodeName: string;
}

const ObjectManager: React.FC<ObjectManagerProps> = ({ selectedNodeId, selectedNodeName }) => {
  const [activeCategory, setActiveCategory] = useState('address');

  const categories = [
    { id: 'address', label: '网络对象', icon: <Globe className="w-4 h-4" /> },
    { id: 'service', label: '服务', icon: <Zap className="w-4 h-4" /> },
    { id: 'application', label: '应用识别库', icon: <Box className="w-4 h-4" /> },
    { id: 'schedule', label: '时间计划', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-full bg-white">
      {/* 1. Sidebar */}
      <div className="w-48 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
           <h2 className="text-sm font-bold text-gray-700 flex items-center">
              <Box className="w-4 h-4 mr-2 text-blue-600" />
              对象管理
           </h2>
        </div>
        <div className="flex-1 py-2 space-y-0.5 px-2">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                        w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                        ${activeCategory === cat.id 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }
                    `}
                >
                    <span className={`mr-3 ${activeCategory === cat.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        {cat.icon}
                    </span>
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">网络对象</h1>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="搜索关键字" 
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                />
            </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex space-x-6 border-b border-gray-200">
            <button 
                className="pb-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600 transition-colors"
            >
                全部对象
            </button>
            <button 
                className="pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
            >
                排除对象
            </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> 新增
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                    <Trash2 className="w-4 h-4 mr-1.5" /> 删除
                </button>
                <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4 mr-1.5" /> 刷新
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6 bg-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <th className="p-3 w-10">
                            <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="p-3">名称</th>
                        <th className="p-3">配置来源</th>
                        <th className="p-3">类型</th>
                        <th className="p-3">内容</th>
                        <th className="p-3 text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                    {MOCK_NETWORK_OBJECTS.map((obj) => {
                         const isShared = obj.sourceType === 'shared';
                         const isLocal = obj.sourceType === 'local';
                         
                         let sourceTypeBadge;
                         if (isShared) {
                             sourceTypeBadge = (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                    <FolderOpen className="w-3 h-3 mr-1" /> 共享
                                </span>
                             );
                         } else if (isLocal) {
                             sourceTypeBadge = (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    <Monitor className="w-3 h-3 mr-1" /> 本机
                                </span>
                             );
                         } else {
                             sourceTypeBadge = (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    <Folder className="w-3 h-3 mr-1" /> 当前组
                                </span>
                             );
                         }

                         let typeLabel = 'IP地址';
                         if (obj.type === 'range') typeLabel = 'IP网段';
                         if (obj.type === 'fqdn') typeLabel = '域名';

                         return (
                            <tr key={obj.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-3">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </td>
                                <td className="p-3 font-medium text-gray-800">{obj.name}</td>
                                <td className="p-3">
                                    {sourceTypeBadge}
                                </td>
                                <td className="p-3 text-gray-600">{typeLabel}</td>
                                <td className="p-3 font-mono text-gray-600">{obj.content}</td>
                                <td className="p-3 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                        编辑
                                    </button>
                                </td>
                            </tr>
                         );
                    })}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default ObjectManager;
