import React, { useState } from 'react';
import { NetworkInterface, Template, TemplateStack } from '../types';
import { RefreshCw, Monitor, ShieldAlert, Activity, Edit2, Lock, Save, ArrowDown, Users, Layers, Plus, Trash2, Network } from 'lucide-react';

interface NetworkTableProps {
  data: NetworkInterface[];
  activeTemplateId: string | null;
  isDeviceView?: boolean;
  isEditable?: boolean; // New prop for Template Editing Mode
  stackTemplates?: Template[]; 
  stacks?: TemplateStack[]; 
  showAssociatedDevices?: boolean;
  onAdd?: (category: 'physical' | 'sub' | 'vlan' | 'aggregate') => void;
  onDelete?: (id: string) => void;
  onEdit?: (iface: NetworkInterface) => void; // New prop for editing
}

const NetworkTable: React.FC<NetworkTableProps> = ({ 
  data, 
  activeTemplateId, 
  isDeviceView = false,
  isEditable = false,
  stackTemplates = [],
  stacks = [],
  showAssociatedDevices = true,
  onAdd,
  onDelete,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'physical' | 'sub' | 'vlan' | 'aggregate' | 'loopback'>('physical');

  // If activeTemplateId is null, we are in "Merged" mode (show everything).
  const isMergedView = activeTemplateId === null;

  // Filter data logic: 
  const filteredData = isDeviceView 
    ? data 
    : data.filter(d => d.sourceTemplateId !== 'local');

  // Filter by tab category
  const tabData = filteredData.filter(d => {
      if (activeTab === 'physical') return d.category === 'physical';
      if (activeTab === 'sub') return d.category === 'sub';
      if (activeTab === 'vlan') return d.category === 'vlan';
      if (activeTab === 'aggregate') return d.category === 'aggregate';
      if (activeTab === 'loopback') return d.category === 'loopback';
      return false;
  });

  // Sort data logic: Natural Sort by Name
  const displayedData = [...tabData].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Logic to hide "Source Template" column:
  const showSourceColumn = !isEditable;

  // Logic to show Associated Devices
  const shouldShowAssociatedDevices = !isDeviceView && showAssociatedDevices && !isEditable;

  // Helper to resolve Stack Name
  const getSourceLabelInfo = (sourceTemplateId: string, row: NetworkInterface) => {
      if (sourceTemplateId === 'local') {
          return { label: '本地配置', style: 'bg-purple-100 border-purple-200 text-purple-700' };
      }

      if (stacks.length > 0) {
          const candidateStacks = stacks.filter(s => s.templates.some(t => t.id === sourceTemplateId));
          
          if (candidateStacks.length === 1) {
              return { label: candidateStacks[0].name, style: 'bg-blue-50 border-blue-200 text-blue-700' };
          } else if (candidateStacks.length > 1) {
              const isEdge = row.associatedDevices?.some(d => d.includes('边界'));
              const isCore = row.associatedDevices?.some(d => d.includes('核心'));

              let targetStack;
              if (isEdge) {
                  targetStack = candidateStacks.find(s => s.name.includes('边界'));
              } else if (isCore) {
                  targetStack = candidateStacks.find(s => s.name.includes('核心'));
              }

              if (targetStack) {
                   return { label: targetStack.name, style: 'bg-blue-50 border-blue-200 text-blue-700' };
              }
              return { label: candidateStacks[0].name, style: 'bg-blue-50 border-blue-200 text-blue-700' };
          }
      }
      return { label: '核心防火墙网络模版', style: 'bg-gray-100 border-gray-200 text-gray-500' };
  };

  const getVariableTooltip = (variableName: string) => {
      let tooltip = `变量名: ${variableName}`;
      
      // 1. Find Definition in Templates
      let def: any = null;
      for (const tmpl of stackTemplates) {
          if (tmpl.variables) {
              def = tmpl.variables.find(v => v.name === variableName);
              if (def) break;
          }
      }

      // 2. Find Assigned Value in active Stack (if any)
      let val = null;
      if (stacks && stacks.length > 0) {
          const activeStack = stacks[0]; // Assume first stack context for now
          const mapping = activeStack.variableMappings?.find(m => m.variable === variableName);
          if (mapping && mapping.value) {
              val = mapping.value;
          }
      }

      if (val) tooltip += `\n当前值: ${val}`;
      
      if (def) {
          if (def.description) tooltip += `\n描述: ${def.description}`;
          if (def.defaultValue) tooltip += `\n默认值: ${def.defaultValue}`;
          // if (def.type) tooltip += `\n类型: ${def.type}`;
      }
      
      if (!val && !def) tooltip += `\n(未找到变量定义)`;

      return tooltip;
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-0">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4 pt-2 space-x-1 shrink-0 bg-white">
        {[
            { id: 'physical', label: '物理接口' },
            { id: 'sub', label: '子接口' },
            { id: 'vlan', label: 'VLAN接口' },
            { id: 'aggregate', label: '聚合接口' },
            { id: 'loopback', label: '本地环回接口' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center space-x-4 text-sm justify-between shrink-0">
        <div className="flex items-center space-x-4">
            <div className="flex space-x-3">
                {isEditable ? (
                    <>
                     <button 
                        onClick={() => onAdd && onAdd(activeTab as any)}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                     >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> 新增
                     </button>
                     <button 
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                     >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
                     </button>
                    </>
                ) : isDeviceView ? (
                     <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-colors text-xs">
                        <Save className="w-3.5 h-3.5 mr-1.5" /> 保存配置
                     </button>
                ) : (
                    <>
                    <button className="text-gray-400 cursor-not-allowed flex items-center px-2 py-1 text-xs"><span className="w-3 h-3 border rounded mr-1"></span> 启用</button>
                    <button className="text-gray-400 cursor-not-allowed flex items-center px-2 py-1 text-xs"><span className="w-3 h-3 border rounded mr-1"></span> 取消</button>
                    </>
                )}
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <button className="flex items-center text-gray-600 hover:text-blue-600 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> 刷新
            </button>
        </div>
        
        {isDeviceView && (
            <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span> 模版下发</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span> 本地配置</span>
            </div>
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white relative">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold border-b w-10">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 font-semibold border-b cursor-pointer hover:bg-gray-200 transition-colors group flex items-center gap-1">
                  接口名称
                  <ArrowDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
              </th>
              
              {isDeviceView && <th className="px-4 py-3 font-semibold border-b">网口状态</th>}

              {activeTab === 'sub' && <th className="px-4 py-3 font-semibold border-b">主接口</th>}
              {(activeTab === 'sub' || activeTab === 'vlan') && <th className="px-4 py-3 font-semibold border-b">VLAN ID</th>}
              {activeTab === 'aggregate' && <th className="px-4 py-3 font-semibold border-b">成员接口</th>}

              <th className="px-4 py-3 font-semibold border-b">接口类型</th>
              <th className="px-4 py-3 font-semibold border-b">区域</th>
              <th className="px-4 py-3 font-semibold border-b">虚拟系统</th>
              <th className="px-4 py-3 font-semibold border-b">连接类型</th>
              <th className="px-4 py-3 font-semibold border-b">IP地址</th>
              <th className="px-4 py-3 font-semibold border-b">工作模式</th>
              <th className="px-4 py-3 font-semibold border-b">MTU</th>
              
              {/* Conditional Column: Source Template */}
              {showSourceColumn && <th className="px-4 py-3 font-semibold border-b w-48">来源模版</th>}
              
              {shouldShowAssociatedDevices && <th className="px-4 py-3 font-semibold border-b">关联设备</th>}
              
              {(isDeviceView || isEditable) && <th className="px-4 py-3 font-semibold border-b text-right">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedData.length > 0 ? displayedData.map((row) => {
              const belongsToActiveTemplate = row.sourceTemplateId === activeTemplateId;
              const isDimmed = !isEditable && !isMergedView && !belongsToActiveTemplate;
              
              const { label: badgeLabel, style: badgeStyle } = getSourceLabelInfo(row.sourceTemplateId, row);
              const isVariable = row.ip && row.ip.startsWith('$');

              return (
                <tr 
                  key={row.id} 
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}
                    ${belongsToActiveTemplate && !isMergedView && !isEditable ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" disabled={isDimmed} />
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer">
                    <div className="flex items-center space-x-2">
                        {row.type !== 'Aggregate' && <Monitor className="w-4 h-4 text-gray-400" />}
                        {row.category === 'aggregate' && <Layers className="w-4 h-4 text-blue-500" />}
                        <span>{row.name}</span>
                        {row.name === 'eth0' && <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">带外管理</span>}
                    </div>
                  </td>
                  
                  {isDeviceView && (
                    <td className="px-4 py-3">
                        <div className="flex items-center">
                            <Activity className={`w-3.5 h-3.5 mr-1.5 ${row.status === 'up' ? 'text-green-500' : 'text-gray-300'}`} />
                            {row.status === 'up' ? '已连接' : row.status === 'down' ? '断开' : '未插入'}
                        </div>
                    </td>
                  )}

                  {activeTab === 'sub' && <td className="px-4 py-3">{row.parentInterface || '-'}</td>}
                  {(activeTab === 'sub' || activeTab === 'vlan') && <td className="px-4 py-3">{row.vlanId || '-'}</td>}
                  {activeTab === 'aggregate' && (
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate" title={row.memberInterfaces?.join(', ')}>
                          {row.memberInterfaces?.join(', ') || '-'}
                      </td>
                  )}

                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">
                    {row.zone === '未区域选择' ? (
                        <span className="text-red-500 flex items-center">
                            未区域选择 <ShieldAlert className="w-3 h-3 ml-1" />
                        </span>
                    ) : (
                        row.zone
                    )}
                  </td>
                  <td className="px-4 py-3">{row.virtualSystem}</td>
                  <td className="px-4 py-3">{row.connectionType}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">
                      {isVariable ? (
                          <span 
                            className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 text-xs font-bold cursor-help"
                            title={getVariableTooltip(row.ip)}
                          >
                              {row.ip}
                          </span>
                      ) : (
                          row.ip
                      )}
                  </td>
                  <td className="px-4 py-3">
                      <div className="flex flex-col">
                          <span>{row.category === 'aggregate' ? row.workMode : row.mode}</span>
                          {row.mode !== '-' && row.category !== 'aggregate' && <span className="text-xs text-gray-400">自动协商</span>}
                      </div>
                  </td>
                  <td className="px-4 py-3">{row.mtu}</td>
                  
                  {/* Source Template Column */}
                  {showSourceColumn && (
                      <td className="px-4 py-3">
                         <span 
                            className={`text-xs px-2.5 py-1 rounded-full border flex items-center w-fit font-medium truncate max-w-[180px] shadow-sm ${badgeStyle}`}
                            title={badgeLabel}
                         >
                            {badgeLabel !== '本地配置' && <Layers className="w-3 h-3 mr-1.5 opacity-60" />}
                            {badgeLabel}
                         </span>
                      </td>
                  )}
                  
                  {shouldShowAssociatedDevices && (
                      <td className="px-4 py-3">
                          {row.associatedDevices && row.associatedDevices.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                  {row.associatedDevices.map(dev => (
                                      <span key={dev} className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                          <Users className="w-3 h-3 mr-1 text-gray-400" />
                                          {dev}
                                      </span>
                                  ))}
                              </div>
                          ) : (
                              <span className="inline-flex items-center text-xs text-gray-400">
                                  <Users className="w-3 h-3 mr-1" />
                                  所有设备
                              </span>
                          )}
                      </td>
                  )}

                  {/* Actions Column: Device View OR Editable Template View */}
                  {(isDeviceView || isEditable) && (
                      <td className="px-4 py-3 text-right">
                          {isEditable ? (
                              <div className="flex items-center justify-end space-x-2">
                                  <button 
                                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors" 
                                      title="编辑"
                                      onClick={() => onEdit && onEdit(row)}
                                  >
                                      <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => onDelete && onDelete(row.id)}
                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors" 
                                    title="删除"
                                  >
                                      <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                              </div>
                          ) : row.sourceTemplateId === 'local' ? (
                              <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center justify-end w-full">
                                  <Edit2 className="w-3.5 h-3.5 mr-1" /> 编辑
                              </button>
                          ) : (
                              <button className="text-gray-400 cursor-not-allowed text-xs font-medium flex items-center justify-end w-full" title="模版下发配置不可编辑">
                                  <Lock className="w-3.5 h-3.5 mr-1" /> 只读
                              </button>
                          )}
                      </td>
                  )}
                </tr>
              );
            }) : (
                <tr>
                    <td colSpan={15} className="py-10 text-center text-gray-400 bg-gray-50/30">
                        <div className="flex flex-col items-center justify-center">
                            <Network className="w-8 h-8 mb-2 opacity-20" />
                            <span className="text-xs">
                                {activeTab === 'aggregate' 
                                    ? '暂无聚合接口数据' 
                                    : `暂无${activeTab === 'physical' ? '物理' : activeTab === 'sub' ? '子' : 'VLAN'}接口数据`
                                }
                            </span>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        
        {/* Empty State / Pagination Placeholder */}
        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
           <span>显示 1 到 {displayedData.length} 条，共 {displayedData.length} 条</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkTable;