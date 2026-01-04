
import React, { useState } from 'react';
import { StaticRoute, BgpGlobalConfig, BgpNetwork, NetworkInterface } from '../types';
import { RefreshCw, Plus, Trash2, Edit2, Play, Ban, Info, X, Variable } from 'lucide-react';

interface NetworkRoutesProps {
  staticRoutes: StaticRoute[];
  bgpGlobal: BgpGlobalConfig;
  bgpNetworks: BgpNetwork[];
  interfaces: NetworkInterface[];
  isEditable: boolean;
  onAddStaticRoute: () => void;
  onEditStaticRoute: (route: StaticRoute) => void;
  onDeleteStaticRoute: (id: string) => void;
  onSaveBgpGlobal: (config: BgpGlobalConfig) => void;
  onAddBgpNetwork: (network: string) => void;
  onDeleteBgpNetwork: (id: string) => void;
}

const NetworkRoutes: React.FC<NetworkRoutesProps> = ({ 
  staticRoutes, 
  bgpGlobal, 
  bgpNetworks, 
  isEditable,
  onAddStaticRoute,
  onEditStaticRoute,
  onDeleteStaticRoute,
  onSaveBgpGlobal,
  onAddBgpNetwork,
  onDeleteBgpNetwork
}) => {
  const [activeTab, setActiveTab] = useState<'static' | 'bgp'>('static');
  const [localBgpGlobal, setLocalBgpGlobal] = useState<BgpGlobalConfig>(bgpGlobal);
  const [isBgpNetworkModalOpen, setIsBgpNetworkModalOpen] = useState(false);
  const [newBgpNetwork, setNewBgpNetwork] = useState('');

  // Sync BGP Global props to state
  React.useEffect(() => {
      setLocalBgpGlobal(bgpGlobal);
  }, [bgpGlobal]);

  const handleBgpGlobalChange = (key: keyof BgpGlobalConfig, value: any) => {
      setLocalBgpGlobal(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyBgpGlobal = () => {
      onSaveBgpGlobal(localBgpGlobal);
  };

  const handleSaveBgpNetwork = () => {
      if (!newBgpNetwork.trim()) return;
      onAddBgpNetwork(newBgpNetwork);
      setNewBgpNetwork('');
      setIsBgpNetworkModalOpen(false);
  };

  const VariableInput = ({ 
      value, 
      onChange, 
      placeholder 
  }: { 
      value: string, 
      onChange: (val: string) => void, 
      placeholder?: string
  }) => {
      const isVariable = value.startsWith('$');
      const displayValue = isVariable ? value.substring(1) : value;

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value;
          if (isVariable) onChange(`$${newValue}`);
          else if (newValue.startsWith('$')) onChange(newValue);
          else onChange(newValue);
      };

      const toggleVariable = () => {
          if (isVariable) onChange(value.substring(1));
          else onChange(`$${value}`);
      };

      return (
          <div className="relative group w-full">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center pointer-events-none transition-opacity duration-200 ${isVariable ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-purple-600 font-bold text-lg">$</span>
              </div>
              <input 
                type="text" 
                value={displayValue}
                onChange={handleInputChange}
                className={`w-full ${isVariable ? 'pl-7 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' : 'pl-3 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'} pr-10 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all font-mono`}
                placeholder={placeholder}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {!isVariable && (
                      <button onClick={toggleVariable} className="text-gray-300 hover:text-purple-500 transition-colors p-1" title="设为模版变量">
                          <Variable className="w-4 h-4" />
                      </button>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-0 h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4 pt-2 space-x-6 shrink-0 bg-white">
        <button
            onClick={() => setActiveTab('static')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'static' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            静态路由
        </button>
        <button
            onClick={() => setActiveTab('bgp')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bgp' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            BGP
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white relative">
          
          {/* Static Route Tab */}
          {activeTab === 'static' && (
              <div className="flex flex-col h-full">
                  {/* Toolbar */}
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center space-x-4 text-sm justify-between shrink-0">
                      <div className="flex items-center space-x-4">
                          <div className="flex space-x-3">
                              {isEditable ? (
                                  <>
                                      <button onClick={onAddStaticRoute} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Plus className="w-3.5 h-3.5 mr-1.5" /> 新增
                                      </button>
                                      <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
                                      </button>
                                      <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Play className="w-3.5 h-3.5 mr-1.5" /> 启用
                                      </button>
                                      <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Ban className="w-3.5 h-3.5 mr-1.5" /> 禁用
                                      </button>
                                  </>
                              ) : (
                                  <div className="text-xs text-gray-400 flex items-center">
                                      <Info className="w-3.5 h-3.5 mr-1.5" /> 只读模式
                                  </div>
                              )}
                          </div>
                      </div>
                      <button className="flex items-center text-gray-600 hover:text-blue-600 text-xs">
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> 刷新
                      </button>
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-auto">
                      <table className="w-full text-left text-sm text-gray-600">
                          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
                              <tr>
                                  <th className="px-4 py-3 font-semibold border-b w-10"><input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} /></th>
                                  <th className="px-4 py-3 font-semibold border-b">启用状态</th>
                                  <th className="px-4 py-3 font-semibold border-b">目的地址/掩码</th>
                                  <th className="px-4 py-3 font-semibold border-b">接口</th>
                                  <th className="px-4 py-3 font-semibold border-b">下一跳</th>
                                  <th className="px-4 py-3 font-semibold border-b">管理距离/度量值</th>
                                  <th className="px-4 py-3 font-semibold border-b">描述</th>
                                  {isEditable && <th className="px-4 py-3 font-semibold border-b text-right">操作</th>}
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {staticRoutes.length > 0 ? staticRoutes.map((route) => (
                                  <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} /></td>
                                      <td className="px-4 py-3">
                                          {route.status === 'enabled' ? (
                                              <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100">启用</span>
                                          ) : (
                                              <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">禁用</span>
                                          )}
                                      </td>
                                      <td className="px-4 py-3 font-medium text-gray-800">
                                          {route.destination.startsWith('$') ? <span className="text-purple-600">{route.destination}</span> : route.destination}
                                      </td>
                                      <td className="px-4 py-3">{route.interface}</td>
                                      <td className="px-4 py-3">
                                          {route.nextHop?.startsWith('$') ? <span className="text-purple-600">{route.nextHop}</span> : (route.nextHop || '-')}
                                      </td>
                                      <td className="px-4 py-3">{route.distance}/{route.metric}</td>
                                      <td className="px-4 py-3 text-xs text-gray-500">{route.description || '-'}</td>
                                      {isEditable && (
                                          <td className="px-4 py-3 text-right">
                                              <div className="flex items-center justify-end space-x-2">
                                                  <button onClick={() => onEditStaticRoute(route)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                                  <button onClick={() => onDeleteStaticRoute(route.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                              </div>
                                          </td>
                                      )}
                                  </tr>
                              )) : (
                                  <tr>
                                      <td colSpan={8} className="py-12 text-center text-gray-400 bg-gray-50/30">
                                          <div className="flex flex-col items-center justify-center">
                                              <Info className="w-8 h-8 mb-2 opacity-20" />
                                              <span className="text-xs">暂无静态路由</span>
                                          </div>
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* BGP Tab */}
          {activeTab === 'bgp' && (
              <div className="flex flex-col h-full bg-gray-50 p-6 overflow-auto">
                  
                  {/* Global Config Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                          <h4 className="text-base font-bold text-gray-800">BGP 全局配置</h4>
                          {isEditable && (
                              <div className="flex space-x-3">
                                  <button onClick={handleApplyBgpGlobal} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded text-xs font-medium transition-colors">
                                      应用
                                  </button>
                                  <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded text-xs font-medium transition-colors">
                                      设置定时器
                                  </button>
                              </div>
                          )}
                      </div>
                      
                      <div className="space-y-5 max-w-2xl">
                          <div className="flex items-center">
                              <label className="w-32 text-sm font-medium text-gray-600 text-right mr-4">启/禁用BGP：</label>
                              <label className="flex items-center cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      checked={localBgpGlobal.enabled} 
                                      onChange={e => handleBgpGlobalChange('enabled', e.target.checked)}
                                      disabled={!isEditable}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                  />
                                  <span className="ml-2 text-sm text-gray-700">启用</span>
                              </label>
                          </div>
                          
                          <div className="flex items-center">
                              <label className="w-32 text-sm font-medium text-gray-600 text-right mr-4">AS号：</label>
                              <div className="w-64">
                                  <input 
                                      type="text" 
                                      value={localBgpGlobal.asNumber || ''}
                                      onChange={e => handleBgpGlobalChange('asNumber', e.target.value)}
                                      disabled={!isEditable}
                                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  />
                              </div>
                          </div>

                          <div className="flex items-center">
                              <label className="w-32 text-sm font-medium text-gray-600 text-right mr-4">路由ID：</label>
                              <div className="w-64">
                                  <input 
                                      type="text" 
                                      value={localBgpGlobal.routerId || ''}
                                      onChange={e => handleBgpGlobalChange('routerId', e.target.value)}
                                      disabled={!isEditable}
                                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                      placeholder="请输入路由ID (选填)"
                                  />
                                  <span className="text-xs text-gray-400 mt-1 block">如果不填，则自动选择设备接口IP作为Router ID</span>
                              </div>
                              <Info className="w-4 h-4 text-blue-500 ml-2 mb-6" />
                          </div>
                      </div>
                  </div>

                  {/* Network Config Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[300px]">
                      <div className="px-6 py-4 border-b border-gray-200">
                          <h4 className="text-base font-bold text-gray-800">网络配置 (Network)</h4>
                      </div>
                      
                      {/* Toolbar */}
                      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between shrink-0">
                          <div className="flex space-x-3">
                              {isEditable && (
                                  <>
                                      <button onClick={() => setIsBgpNetworkModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Plus className="w-3.5 h-3.5 mr-1.5" /> 新增
                                      </button>
                                      <button className="bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium">
                                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
                                      </button>
                                  </>
                              )}
                          </div>
                          <button className="flex items-center text-gray-600 hover:text-blue-600 text-xs">
                              <RefreshCw className="w-3.5 h-3.5 mr-1" /> 刷新
                          </button>
                      </div>

                      {/* Table */}
                      <div className="flex-1 overflow-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
                                  <tr>
                                      <th className="px-6 py-3 font-semibold border-b w-10"><input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} /></th>
                                      <th className="px-6 py-3 font-semibold border-b w-20">序号</th>
                                      <th className="px-6 py-3 font-semibold border-b">运行网段</th>
                                      {isEditable && <th className="px-6 py-3 font-semibold border-b text-right">操作</th>}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {bgpNetworks.length > 0 ? bgpNetworks.map((net, idx) => (
                                      <tr key={net.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-6 py-3"><input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} /></td>
                                          <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                                          <td className="px-6 py-3 font-medium text-gray-800">
                                              {net.network.startsWith('$') ? <span className="text-purple-600">{net.network}</span> : net.network}
                                          </td>
                                          {isEditable && (
                                              <td className="px-6 py-3 text-right">
                                                  <button onClick={() => onDeleteBgpNetwork(net.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                              </td>
                                          )}
                                      </tr>
                                  )) : (
                                      <tr>
                                          <td colSpan={isEditable ? 4 : 3} className="py-12 text-center text-gray-400 bg-gray-50/30">
                                              <div className="flex flex-col items-center justify-center">
                                                  <Info className="w-10 h-10 mb-2 opacity-20" />
                                                  <span className="text-xs">暂无数据</span>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* BGP Network Modal */}
          {isBgpNetworkModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                          <h3 className="text-lg font-bold text-gray-800">新增网络配置</h3>
                          <button onClick={() => setIsBgpNetworkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                              <X className="w-5 h-5" />
                          </button>
                      </div>
                      <div className="p-8 space-y-6">
                          <div className="flex items-center">
                              <label className="w-24 text-sm font-medium text-gray-700 text-right mr-4">运行网段：</label>
                              <div className="flex-1">
                                  <VariableInput value={newBgpNetwork} onChange={setNewBgpNetwork} placeholder="请输入IPv4地址/掩码" />
                              </div>
                          </div>
                      </div>
                      <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center space-x-3">
                          <button onClick={handleSaveBgpNetwork} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">确定</button>
                          <button onClick={() => setIsBgpNetworkModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors">取消</button>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default NetworkRoutes;
