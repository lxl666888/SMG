
import React, { useState } from 'react';
import { DnsConfig, DdnsPolicy } from '../types';
import { Save, Info, Plus, Trash2, RefreshCw, Edit2, Play, Ban, Upload, Variable, X } from 'lucide-react';

interface NetworkDnsProps {
  dnsConfig: DnsConfig;
  ddnsPolicies: DdnsPolicy[];
  isEditable?: boolean;
  onSaveDns: (config: DnsConfig) => void;
  onAddDdns: () => void;
  onEditDdns: (policy: DdnsPolicy) => void;
  onDeleteDdns: (id: string) => void;
}

const NetworkDns: React.FC<NetworkDnsProps> = ({ 
  dnsConfig, 
  ddnsPolicies, 
  isEditable = false,
  onSaveDns,
  onAddDdns,
  onEditDdns,
  onDeleteDdns
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'proxy' | 'ddns'>('config');
  
  // Local state for DNS forms
  const [localDnsConfig, setLocalDnsConfig] = useState<DnsConfig>(dnsConfig);

  // Sync props to state when config changes
  React.useEffect(() => {
      setLocalDnsConfig(dnsConfig);
  }, [dnsConfig]);

  const handleDnsChange = (key: keyof DnsConfig, value: any) => {
      const newConfig = { ...localDnsConfig, [key]: value };
      setLocalDnsConfig(newConfig);
      onSaveDns(newConfig);
  };

  // Helper Component for Variable Inputs
  const VariableInput = ({ 
      value, 
      onChange, 
      placeholder, 
      disabled = false,
      forceVariable = false
  }: { 
      value: string, 
      onChange: (val: string) => void, 
      placeholder?: string,
      disabled?: boolean,
      forceVariable?: boolean
  }) => {
      const isVariable = value.startsWith('$') || forceVariable;
      const displayValue = value.startsWith('$') ? value.substring(1) : value;

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value;
          if (isVariable) {
              onChange(`$${newValue}`);
          } else {
              if (newValue.startsWith('$')) {
                  onChange(newValue);
              } else {
                  onChange(newValue);
              }
          }
      };

      const toggleVariableMode = () => {
          if (disabled || forceVariable) return;
          if (value.startsWith('$')) {
              onChange(value.substring(1));
          } else {
              onChange(`$${value}`);
          }
      };

      return (
          <div className="relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center pointer-events-none transition-opacity duration-200 ${isVariable ? 'opacity-100' : 'opacity-0'}`}>
                    <span className={`font-bold text-lg ${disabled ? 'text-purple-300' : 'text-purple-600'}`}>$</span>
              </div>

              <input 
                type="text" 
                value={displayValue}
                onChange={handleInputChange}
                disabled={disabled}
                className={`w-full ${isVariable ? 'pl-7 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' : 'pl-3 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'} pr-32 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all font-mono ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
              />

              <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center`}>
                  {isVariable ? (
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border select-none ${disabled ? 'bg-purple-50 text-purple-300 border-purple-100' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                          <Variable className="w-3 h-3" />
                          <span>模版变量</span>
                          {!disabled && !forceVariable && <button onClick={toggleVariableMode} className="ml-1 hover:text-purple-900"><X className="w-3 h-3" /></button>}
                      </div>
                  ) : (
                      !disabled && (
                        <button 
                            onClick={toggleVariableMode}
                            className="text-gray-300 hover:text-purple-500 transition-colors p-1"
                            title="设为模版变量"
                        >
                            <Variable className="w-4 h-4" />
                        </button>
                      )
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-0 h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4 pt-2 space-x-1 shrink-0 bg-white">
        {[
            { id: 'config', label: 'DNS配置' },
            { id: 'proxy', label: 'DNS透明代理' },
            { id: 'ddns', label: 'DDNS' },
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

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white relative">
          
          {/* Tab 1: DNS Configuration */}
          {activeTab === 'config' && (
              <div className="p-6">
                  <div className="space-y-10 max-w-4xl">
                      {/* 1. DNS Server */}
                      <div>
                          <h4 className="text-base font-bold text-gray-800 mb-2">DNS服务器</h4>
                          <p className="text-xs text-gray-500 mb-6">系统自动更新及DNS代理功能均需要配置正确的DNS服务器</p>
                          <div className="space-y-5 pl-2">
                              <div className="flex items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 w-28 text-right">首选DNS服务器：</label>
                                  <div className="w-[400px]">
                                      <VariableInput 
                                          value={localDnsConfig.primaryDns || ''}
                                          onChange={val => handleDnsChange('primaryDns', val)}
                                          disabled={!isEditable}
                                          placeholder="8.8.8.8"
                                          forceVariable={true}
                                      />
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 w-28 text-right">备选DNS服务器：</label>
                                  <div className="w-[400px]">
                                      <VariableInput 
                                          value={localDnsConfig.secondaryDns || ''}
                                          onChange={val => handleDnsChange('secondaryDns', val)}
                                          disabled={!isEditable}
                                          placeholder="114.114.114.114"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 2. DNS Proxy */}
                      <div>
                          <h4 className="text-base font-bold text-gray-800 mb-4">DNS代理</h4>
                          <div className="text-xs text-gray-500 mb-6 leading-relaxed max-w-3xl">
                              启用后，内网计算机的DNS可以指向本设备，由设备来代理解析DNS请求，请确保设备本身能正常解析DNS请求
                          </div>
                          
                          <div className="flex items-center gap-4 pl-2">
                              <label className="text-sm font-medium text-gray-600 w-28 text-right flex items-center justify-end">
                                  DNS代理
                                  <Info className="w-3.5 h-3.5 text-blue-500 ml-1 cursor-pointer" />
                                  ：
                              </label>
                              <div className="flex items-center space-x-6">
                                  <label className="flex items-center cursor-pointer">
                                      <input 
                                          type="radio" 
                                          checked={localDnsConfig.enableProxy}
                                          onChange={() => handleDnsChange('enableProxy', true)}
                                          disabled={!isEditable}
                                          className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                      />
                                      <span className="ml-2 text-sm text-gray-700">启用</span>
                                  </label>
                                  <label className="flex items-center cursor-pointer">
                                      <input 
                                          type="radio" 
                                          checked={!localDnsConfig.enableProxy}
                                          onChange={() => handleDnsChange('enableProxy', false)}
                                          disabled={!isEditable}
                                          className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                      />
                                      <span className="ml-2 text-sm text-gray-700">禁用</span>
                                  </label>
                              </div>
                          </div>
                      </div>

                      {/* 3. DNS64 */}
                      <div>
                          <h4 className="text-base font-bold text-gray-800 mb-4">DNS64</h4>
                          <div className="text-xs text-gray-500 mb-6">
                              需在启用dns代理的情况下启用DNS64
                          </div>
                          
                          <div className="space-y-5 pl-2">
                              <div className="flex items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 w-28 text-right">DNS64：</label>
                                  <div className="flex items-center space-x-6">
                                      <label className="flex items-center cursor-pointer">
                                          <input 
                                              type="radio" 
                                              checked={localDnsConfig.enableDns64}
                                              onChange={() => handleDnsChange('enableDns64', true)}
                                              disabled={!isEditable || !localDnsConfig.enableProxy}
                                              className={`text-blue-600 focus:ring-blue-500 w-4 h-4 ${!localDnsConfig.enableProxy ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          />
                                          <span className={`ml-2 text-sm ${!localDnsConfig.enableProxy ? 'text-gray-400' : 'text-gray-700'}`}>启用</span>
                                      </label>
                                      <label className="flex items-center cursor-pointer">
                                          <input 
                                              type="radio" 
                                              checked={!localDnsConfig.enableDns64}
                                              onChange={() => handleDnsChange('enableDns64', false)}
                                              disabled={!isEditable || !localDnsConfig.enableProxy}
                                              className={`text-blue-600 focus:ring-blue-500 w-4 h-4 ${!localDnsConfig.enableProxy ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          />
                                          <span className={`ml-2 text-sm ${!localDnsConfig.enableProxy ? 'text-gray-400' : 'text-gray-700'}`}>禁用</span>
                                      </label>
                                  </div>
                              </div>

                              <div className="flex items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 w-28 text-right">IPv6前缀：</label>
                                  <div className="flex items-center w-[400px]">
                                      <VariableInput 
                                          value={localDnsConfig.dns64Prefix || ''}
                                          onChange={val => handleDnsChange('dns64Prefix', val)}
                                          disabled={!isEditable || !localDnsConfig.enableDns64}
                                          placeholder="64:ff9b::/96"
                                      />
                                      <Info className="w-4 h-4 text-blue-500 ml-3 cursor-pointer" />
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>
          )}

          {/* Tab 2: DNS Transparent Proxy (Advanced Lists) */}
          {activeTab === 'proxy' && (
              <div className="p-6">
                  <div className="space-y-10 max-w-4xl">
                      
                      {/* External DNS */}
                      <div>
                          <h4 className="text-base font-bold text-gray-800 mb-4">外网DNS服务器地址</h4>
                          <p className="text-xs text-gray-500 mb-6">配置上游外网DNS服务器，用于解析外网域名</p>
                          
                          <div className="space-y-5">
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 text-right">首选DNS服务器：</label>
                                  <div className="col-span-2">
                                      <VariableInput 
                                          value={localDnsConfig.proxyExternalPrimary || ''}
                                          onChange={val => handleDnsChange('proxyExternalPrimary', val)}
                                          disabled={!isEditable}
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 text-right">备选DNS服务器：</label>
                                  <div className="col-span-2">
                                      <VariableInput 
                                          value={localDnsConfig.proxyExternalSecondary || ''}
                                          onChange={val => handleDnsChange('proxyExternalSecondary', val)}
                                          disabled={!isEditable}
                                          placeholder="请输入备选DNS服务器（选填）"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Internal DNS */}
                      <div>
                          <h4 className="text-base font-bold text-gray-800 mb-4">内网DNS服务器地址</h4>
                          <p className="text-xs text-gray-500 mb-6">配置内网DNS服务器，优先解析内部域名</p>
                          
                          <div className="space-y-5">
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 text-right">首选DNS服务器：</label>
                                  <div className="col-span-2">
                                      <VariableInput 
                                          value={localDnsConfig.proxyInternalPrimary || ''}
                                          onChange={val => handleDnsChange('proxyInternalPrimary', val)}
                                          disabled={!isEditable}
                                          placeholder="请输入首选DNS服务器（选填）"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-sm font-medium text-gray-600 text-right">备选DNS服务器：</label>
                                  <div className="col-span-2">
                                      <VariableInput 
                                          value={localDnsConfig.proxyInternalSecondary || ''}
                                          onChange={val => handleDnsChange('proxyInternalSecondary', val)}
                                          disabled={!isEditable}
                                          placeholder="请输入首选DNS服务器（选填）"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* File Upload */}
                      <div>
                          <div className="grid grid-cols-4 items-center gap-4">
                              <label className="text-sm font-medium text-gray-600 text-right">上传域名文件列表：</label>
                              <div className="col-span-2 flex">
                                  <input 
                                      type="text" 
                                      readOnly
                                      className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm bg-gray-50 text-gray-500"
                                      placeholder="请上传域名文件列表"
                                      value={localDnsConfig.domainFileList || ''}
                                  />
                                  <button disabled={!isEditable} className={`bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-r hover:bg-blue-700 transition-colors ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                      选择
                                  </button>
                                  <Info className="w-4 h-4 text-blue-500 ml-3 mt-2.5 cursor-pointer" />
                              </div>
                          </div>
                          <div className="grid grid-cols-4 mt-2">
                              <div className="col-start-2 col-span-3">
                                  <p className="text-xs text-red-400 bg-red-50 inline-block px-2 py-1 rounded">
                                      <Info className="w-3 h-3 inline mr-1" />
                                      上传域名列表仅支持合法域名
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Tab 3: DDNS */}
          {activeTab === 'ddns' && (
              <div className="flex flex-col h-full">
                  {/* Toolbar */}
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center space-x-4 text-sm justify-between shrink-0">
                      <div className="flex items-center space-x-4">
                          <div className="flex space-x-3">
                              {isEditable ? (
                                  <>
                                      <button 
                                          onClick={onAddDdns}
                                          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                                      >
                                          <Plus className="w-3.5 h-3.5 mr-1.5" /> 新增
                                      </button>
                                      <button 
                                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                                      >
                                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
                                      </button>
                                      <button 
                                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                                      >
                                          <Play className="w-3.5 h-3.5 mr-1.5" /> 启用
                                      </button>
                                      <button 
                                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                                      >
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
                                  <th className="px-4 py-3 font-semibold border-b w-10">
                                      <input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} />
                                  </th>
                                  <th className="px-4 py-3 font-semibold border-b w-16">序号</th>
                                  <th className="px-4 py-3 font-semibold border-b">名称</th>
                                  <th className="px-4 py-3 font-semibold border-b">描述</th>
                                  <th className="px-4 py-3 font-semibold border-b">DDNS服务商</th>
                                  <th className="px-4 py-3 font-semibold border-b">域名</th>
                                  <th className="px-4 py-3 font-semibold border-b">用户名</th>
                                  <th className="px-4 py-3 font-semibold border-b">绑定接口</th>
                                  <th className="px-4 py-3 font-semibold border-b">上次更新结果</th>
                                  <th className="px-4 py-3 font-semibold border-b">更新时间</th>
                                  {isEditable && <th className="px-4 py-3 font-semibold border-b text-right">操作</th>}
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {ddnsPolicies.length > 0 ? ddnsPolicies.map((policy, index) => (
                                  <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                          <input type="checkbox" className="rounded border-gray-300" disabled={!isEditable} />
                                      </td>
                                      <td className="px-4 py-3 text-xs">{index + 1}</td>
                                      <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer" onClick={() => isEditable && onEditDdns(policy)}>
                                          {policy.name}
                                          {policy.status === 'disabled' && <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">禁用</span>}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500">{policy.description || '-'}</td>
                                      <td className="px-4 py-3">{policy.provider}</td>
                                      <td className="px-4 py-3 text-gray-800">{policy.domain}</td>
                                      <td className="px-4 py-3">{policy.username || '-'}</td>
                                      <td className="px-4 py-3">{policy.interface}</td>
                                      <td className="px-4 py-3">
                                          {policy.lastUpdateResult === '更新成功' ? (
                                              <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded border border-green-100">更新成功</span>
                                          ) : (
                                              <span className="text-gray-500 text-xs">{policy.lastUpdateResult || '-'}</span>
                                          )}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500">{policy.lastUpdateTime || '-'}</td>
                                      {isEditable && (
                                          <td className="px-4 py-3 text-right">
                                              <div className="flex items-center justify-end space-x-2">
                                                  <button 
                                                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                                                      onClick={() => onEditDdns(policy)}
                                                  >
                                                      <Edit2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button 
                                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                                      onClick={() => onDeleteDdns(policy.id)}
                                                  >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                              </div>
                                          </td>
                                      )}
                                  </tr>
                              )) : (
                                  <tr>
                                      <td colSpan={isEditable ? 11 : 10} className="py-12 text-center text-gray-400 bg-gray-50/30">
                                          <div className="flex flex-col items-center justify-center">
                                              <Info className="w-8 h-8 mb-2 opacity-20" />
                                              <span className="text-xs">暂无DDNS策略</span>
                                          </div>
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default NetworkDns;
