
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Network, 
  Users, 
  Activity, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Search,
  Info,
  MoreHorizontal,
  FolderOpen,
  Folder,
  Box,
  Globe,
  Zap,
  Clock,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Monitor,
  Ban,
  ArrowUpDown,
  Crosshair,
  Wrench,
  Download,
  Upload,
  Eraser,
  ListFilter
} from 'lucide-react';
import { PolicyRule } from '../types';
import { MOCK_PRE_RULES, MOCK_POST_RULES, MOCK_NETWORK_OBJECTS } from '../constants';

interface PolicyManagerProps {
  selectedNodeId: string;
  selectedNodeName: string;
  initialGroup?: 'policy' | 'object';
}

// Menu Items Configuration
interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface MenuGroup {
    id: string;
    label: string;
    items: MenuItem[];
}

const PolicyManager: React.FC<PolicyManagerProps> = ({ selectedNodeId, selectedNodeName, initialGroup }) => {
  // State for Sidebar Module Selection
  const [activeModule, setActiveModule] = useState('policy_security');
  // State for Sidebar Expansion
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['policy', 'object']);
  
  // Effect to handle external navigation (e.g. from MainSidebar)
  useEffect(() => {
    if (initialGroup === 'object') {
        setActiveModule('object_address');
        if (!expandedGroups.includes('object')) setExpandedGroups(prev => [...prev, 'object']);
    } else if (initialGroup === 'policy') {
        setActiveModule('policy_security');
        if (!expandedGroups.includes('policy')) setExpandedGroups(prev => [...prev, 'policy']);
    }
  }, [initialGroup]);
  
  // State for Policy Views
  const [activePolicyTab, setActivePolicyTab] = useState<'pre' | 'post'>('pre');
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  // Menu Definition
  const menuGroups: MenuGroup[] = [
      {
          id: 'policy',
          label: '策略管理',
          items: [
              { id: 'policy_security', label: '应用控制策略', icon: <Shield className="w-3.5 h-3.5" /> },
              { id: 'policy_nat', label: 'NAT策略', icon: <Network className="w-3.5 h-3.5" /> },
              { id: 'policy_auth', label: '认证策略', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'policy_qos', label: '带宽策略', icon: <Activity className="w-3.5 h-3.5" /> },
          ]
      },
      {
          id: 'object',
          label: '对象管理',
          items: [
              { id: 'object_address', label: '网络对象', icon: <Globe className="w-3.5 h-3.5" /> },
              { id: 'object_service', label: '服务', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'object_app', label: '应用识别库', icon: <Box className="w-3.5 h-3.5" /> },
              { id: 'object_schedule', label: '时间计划', icon: <Clock className="w-3.5 h-3.5" /> },
          ]
      }
  ];

  const toggleGroup = (groupId: string) => {
      setExpandedGroups(prev => 
          prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
      );
  };

  // Determine if we are showing Object Manager content
  const isObjectView = activeModule.startsWith('object_');
  const currentRules = activePolicyTab === 'pre' ? MOCK_PRE_RULES : MOCK_POST_RULES;

  // -- Render Content Logic --
  const renderContent = () => {
      if (isObjectView) {
          // --- Object Manager Content ---
          const objectTypeLabel = menuGroups.find(g => g.id === 'object')?.items.find(i => i.id === activeModule)?.label || '对象';
          
          return (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h1 className="text-lg font-bold text-gray-800">{objectTypeLabel}</h1>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="搜索关键字" 
                            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                        />
                    </div>
                </div>

                {/* Tabs for Objects */}
                <div className="px-5 pt-2 flex space-x-4 border-b border-gray-200 shrink-0">
                    <button className="pb-2 text-xs font-bold border-b-2 border-blue-600 text-blue-600 transition-colors">
                        全部对象
                    </button>
                    <button className="pb-2 text-xs font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
                        排除对象
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-5 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus className="w-3.5 h-3.5 mr-1" /> 新增
                        </button>
                        <button className="flex items-center px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> 删除
                        </button>
                        <button className="flex items-center px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> 刷新
                        </button>
                    </div>
                </div>

                {/* Object Table */}
                <div className="flex-1 overflow-auto p-4 bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                                <th className="px-3 py-2 w-8">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </th>
                                <th className="px-3 py-2">名称</th>
                                <th className="px-3 py-2">配置来源</th>
                                <th className="px-3 py-2">类型</th>
                                <th className="px-3 py-2">内容</th>
                                <th className="px-3 py-2 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-gray-100">
                            {MOCK_NETWORK_OBJECTS.map((obj) => {
                                const isShared = obj.sourceType === 'shared';
                                const isLocal = obj.sourceType === 'local';
                                
                                let sourceTypeBadge;
                                if (isShared) {
                                    sourceTypeBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                            <FolderOpen className="w-3 h-3 mr-1" /> 共享
                                        </span>
                                    );
                                } else if (isLocal) {
                                    sourceTypeBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            <Monitor className="w-3 h-3 mr-1" /> 本机
                                        </span>
                                    );
                                } else {
                                    sourceTypeBadge = (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            <Folder className="w-3 h-3 mr-1" /> 当前组
                                        </span>
                                    );
                                }

                                let typeLabel = 'IP地址';
                                if (obj.type === 'range') typeLabel = 'IP网段';
                                if (obj.type === 'fqdn') typeLabel = '域名';

                                return (
                                    <tr key={obj.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-3 py-1.5">
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </td>
                                        <td className="px-3 py-1.5 font-medium text-gray-800">{obj.name}</td>
                                        <td className="px-3 py-1.5">{sourceTypeBadge}</td>
                                        <td className="px-3 py-1.5 text-gray-600">{typeLabel}</td>
                                        <td className="px-3 py-1.5 font-mono text-gray-600">{obj.content}</td>
                                        <td className="px-3 py-1.5 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">编辑</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          );
      } 
      
      // --- Policy Manager Content ---
      const policyTypeLabel = menuGroups.find(g => g.id === 'policy')?.items.find(i => i.id === activeModule)?.label || '安全策略';

      return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {/* Header - Compact */}
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between shrink-0 h-12">
                <div className="flex items-center space-x-3">
                     <h1 className="text-base font-bold text-gray-800 flex items-center">
                        {policyTypeLabel}
                     </h1>
                     <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                         当前范围: {selectedNodeName}
                     </span>
                     <div className="h-3 w-px bg-gray-300"></div>
                     <button className="text-xs text-blue-600 font-medium hover:underline">
                         新增组
                     </button>
                </div>
            </div>

            {/* Policy Tabs - Compact */}
            <div className="px-4 pt-1 flex space-x-6 border-b border-gray-200 shrink-0">
                <button 
                    onClick={() => setActivePolicyTab('pre')}
                    className={`pb-2 text-xs font-bold border-b-2 transition-colors ${activePolicyTab === 'pre' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    前置策略
                </button>
                <button 
                    onClick={() => setActivePolicyTab('post')}
                    className={`pb-2 text-xs font-medium border-b-2 transition-colors ${activePolicyTab === 'post' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    后置策略
                </button>
            </div>

            {/* Toolbar - Optimized Design & Compact */}
            <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
                {/* Left: Actions Group */}
                <div className="flex items-center gap-2">
                    {/* Primary Action */}
                    <button className="flex items-center px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs font-semibold shadow-sm shadow-blue-200">
                        <Plus className="w-3.5 h-3.5 mr-1" /> 新增
                    </button>
                    
                    {/* Divider */}
                    <div className="h-5 w-px bg-gray-200 mx-1"></div>

                    {/* Secondary Management Actions - Grouped Visually */}
                    <div className="flex items-center bg-gray-50 rounded p-0.5 border border-gray-200">
                         <button className="flex items-center px-2 py-1 text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm rounded transition-all text-xs font-medium" title="删除选中">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> 删除
                        </button>
                        <div className="w-px h-3 bg-gray-300 mx-0.5"></div>
                        <button className="flex items-center px-2 py-1 text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-sm rounded transition-all text-xs font-medium" title="启用">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 启用
                        </button>
                         <div className="w-px h-3 bg-gray-300 mx-0.5"></div>
                        <button className="flex items-center px-2 py-1 text-gray-700 hover:bg-white hover:text-orange-600 hover:shadow-sm rounded transition-all text-xs font-medium" title="禁用">
                            <Ban className="w-3.5 h-3.5 mr-1" /> 禁用
                        </button>
                    </div>

                    <button className="flex items-center px-2 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors text-xs font-medium border border-transparent hover:border-gray-200">
                        <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> 移动 <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                </div>
                
                {/* Right: Tools & Search */}
                <div className="flex items-center gap-2">
                    
                    {/* Tool Actions */}
                    <div className="flex items-center text-gray-500">
                         <button className="flex items-center px-2 py-1 hover:bg-gray-100 rounded transition-colors text-xs font-medium border border-transparent text-gray-600" title="模拟策略匹配">
                            <Crosshair className="w-3.5 h-3.5 mr-1" /> 模拟匹配
                        </button>
                        
                         {/* More Actions Dropdown */}
                         <div className="relative">
                            <button 
                                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                                className={`px-2 py-1 hover:bg-gray-100 rounded transition-colors flex items-center text-xs font-medium border border-transparent text-gray-600 ${isMoreActionsOpen ? 'bg-gray-100 text-gray-800' : ''}`}
                            >
                                <MoreHorizontal className="w-3.5 h-3.5 mr-1" /> 更多 <ChevronDown className="w-3 h-3 ml-1" />
                            </button>
                            
                            {isMoreActionsOpen && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">工具</div>
                                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center">
                                        <Wrench className="w-3 h-3 mr-2 text-gray-400" /> 辅助工具
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center">
                                        <Eraser className="w-3 h-3 mr-2 text-gray-400" /> 清除匹配数
                                    </button>
                                    
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">数据</div>
                                    
                                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center">
                                        <Download className="w-3 h-3 mr-2 text-gray-400" /> 导入策略
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center">
                                        <Upload className="w-3 h-3 mr-2 text-gray-400" /> 导出配置
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500" title="刷新列表">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-gray-200"></div>

                    {/* Search & Filter Group */}
                     <div className="flex bg-white border border-gray-300 rounded overflow-hidden shadow-sm transition-all focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 h-[28px]">
                         <button className="flex items-center px-2 border-r border-gray-100 bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors" title="添加过滤条件">
                             <Plus className="w-3 h-3 mr-1" />
                             <span className="text-[10px] font-medium">过滤</span>
                         </button>
                         <div className="relative flex-1">
                             <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="h-3 w-3 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="搜索关键字" 
                                className="block w-32 pl-7 pr-2 py-0.5 text-xs border-none focus:ring-0 placeholder-gray-400 h-full"
                            />
                         </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            {activePolicyTab === 'pre' && (
                <div className="px-4 py-1.5 bg-blue-50/50 border-b border-blue-100 flex items-center text-[10px] text-blue-700 shrink-0">
                    <Info className="w-3 h-3 mr-1.5" />
                    前置策略将优先于子组和设备的本地策略执行。
                </div>
            )}

            {/* Policy Table - Optimized for density */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
                        <tr className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <th className="px-2 py-2 w-8 text-center">
                                <input type="checkbox" className="rounded border-gray-300 h-3 w-3" />
                            </th>
                            <th className="px-2 py-2 w-12 text-center">优先级</th>
                            <th className="px-2 py-2 min-w-[120px]">名称</th>
                            <th className="px-2 py-2 w-20">标签</th>
                            <th className="px-2 py-2 w-24">源区域</th>
                            <th className="px-2 py-2 w-32">源地址</th>
                            <th className="px-2 py-2 w-24">用户/组</th>
                            <th className="px-2 py-2 w-24">目的区域</th>
                            <th className="px-2 py-2 w-32">目的地址</th>
                            <th className="px-2 py-2 w-20">服务</th>
                            <th className="px-2 py-2 w-24">应用</th>
                            <th className="px-2 py-2 w-20">生效时间</th>
                            <th className="px-2 py-2 w-20 text-center">动作</th>
                            <th className="px-2 py-2 w-16 text-center">匹配数</th>
                            <th className="px-2 py-2 w-12 text-center sticky right-0 bg-gray-100 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">操作</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100">
                        {currentRules.map((rule) => {
                             const isShared = rule.sourceType === 'shared';
                             return (
                                <tr key={rule.id} className="hover:bg-gray-50 transition-colors group h-9">
                                    <td className="px-2 py-1.5 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 h-3 w-3" />
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-gray-500 font-mono text-[11px]">{rule.priority}</td>
                                    <td className="px-2 py-1.5">
                                        <div className="flex flex-col justify-center h-full">
                                            <span className="font-medium text-gray-800 truncate" title={rule.name}>{rule.name}</span>
                                            <div className="flex items-center mt-0.5">
                                                 {isShared ? (
                                                    <span className="inline-flex items-center px-1 py-0 rounded text-[9px] font-medium bg-purple-50 text-purple-700 border border-purple-100 mr-1 leading-none">
                                                        共享
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1 py-0 rounded text-[9px] font-medium bg-gray-100 text-gray-600 border border-gray-200 mr-1 leading-none">
                                                        本地
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <div className="flex flex-wrap gap-1">
                                            {rule.tags?.map(tag => (
                                                <span key={tag} className="inline-block bg-gray-100 text-gray-600 px-1 py-0 rounded text-[9px] border border-gray-200 whitespace-nowrap">
                                                    {tag}
                                                </span>
                                            ))}
                                            {!rule.tags?.length && <span className="text-gray-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 text-gray-600 truncate">{rule.sourceZone}</td>
                                    <td className="px-2 py-1.5 text-blue-600 font-mono text-[11px] truncate" title={rule.sourceAddress}>{rule.sourceAddress}</td>
                                    <td className="px-2 py-1.5 text-gray-600 truncate">{rule.user || 'Any'}</td>
                                    <td className="px-2 py-1.5 text-gray-600 truncate">{rule.destinationZone}</td>
                                    <td className="px-2 py-1.5 text-blue-600 font-mono text-[11px] truncate" title={rule.destinationAddress}>{rule.destinationAddress}</td>
                                    <td className="px-2 py-1.5 text-gray-600 truncate">{rule.service}</td>
                                    <td className="px-2 py-1.5 text-gray-600 truncate">{rule.application}</td>
                                    <td className="px-2 py-1.5 text-gray-500 text-[11px]">{rule.effectiveTime || 'Always'}</td>
                                    
                                    <td className="px-2 py-1.5 text-center">
                                        {rule.action === 'allow' ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-green-700 bg-green-50 border border-green-200 font-medium text-[10px]">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> 允许
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-red-700 bg-red-50 border border-red-200 font-medium text-[10px]">
                                                <Ban className="w-3 h-3 mr-1" /> 拒绝
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-2 py-1.5 text-center font-mono text-gray-500 text-[11px]">
                                        {rule.hitCount !== undefined ? rule.hitCount : '-'}
                                    </td>

                                    <td className="px-2 py-1.5 text-center sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                        <button className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600 transition-colors">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      );
  };

  return (
    <div className="flex h-full bg-white font-sans">
      {/* 1. Unified Sidebar - Compact Width (w-48 instead of w-56) */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto">
          <div className="p-2 space-y-3">
              {menuGroups.map((group) => (
                  <div key={group.id}>
                      {/* Group Header */}
                      <div 
                        className="flex items-center justify-between px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 cursor-pointer hover:text-gray-600"
                        onClick={() => toggleGroup(group.id)}
                      >
                          <span>{group.label}</span>
                          {expandedGroups.includes(group.id) ? (
                              <ChevronDown className="w-3 h-3" />
                          ) : (
                              <ChevronRight className="w-3 h-3" />
                          )}
                      </div>

                      {/* Items */}
                      {expandedGroups.includes(group.id) && (
                          <div className="space-y-0.5">
                              {group.items.map((item) => {
                                  const isActive = activeModule === item.id;
                                  return (
                                      <button
                                          key={item.id}
                                          onClick={() => setActiveModule(item.id)}
                                          className={`
                                            w-full flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                                            ${isActive 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'text-gray-700 hover:bg-gray-200'
                                            }
                                          `}
                                      >
                                          <span className={`mr-2.5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                                              {item.icon}
                                          </span>
                                          {item.label}
                                      </button>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* 2. Content Area (Switchable) */}
      {renderContent()}

    </div>
  );
};

export default PolicyManager;
