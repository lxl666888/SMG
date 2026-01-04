
import React, { useState, useEffect } from 'react';
import { X, Info, Variable, Check } from 'lucide-react';
import { DhcpConfig, NetworkInterface } from '../types';

interface DhcpModalProps {
  initialData?: DhcpConfig | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<DhcpConfig>) => void;
}

const DhcpModal: React.FC<DhcpModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'advanced' | 'binding'>('network');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'enabled' | 'disabled'>('enabled');
  const [description, setDescription] = useState('');
  const [protocol, setProtocol] = useState<'IPv4' | 'IPv6'>('IPv4');
  const [type, setType] = useState<'Server' | 'Relay'>('Server');
  const [iface, setIface] = useState('');
  
  // Network Info
  const [ipRange, setIpRange] = useState('');
  const [netmask, setNetmask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('');
  const [dnsType, setDnsType] = useState<'system' | 'custom'>('system');
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setIface(initialData.interface);
      setType(initialData.type);
      setIpRange(initialData.ipRange || '');
      setNetmask(initialData.netmask || '255.255.255.0');
      setGateway(initialData.gateway || '');
      setDnsType(initialData.dnsType);
      setPrimaryDns(initialData.primaryDns || '');
      setSecondaryDns(initialData.secondaryDns || '');
    }
  }, [initialData]);

  const handleSave = () => {
    if (!name.trim()) return alert('请输入名称');
    if (!iface) return alert('请选择接口');

    // Basic format handling for variables
    const formatValue = (val: string) => {
        if (!val) return '';
        // If user typed '$' explicitly or it was set as variable, ensure it's treated as one
        if (val.startsWith('$')) return val; 
        return val;
    };

    onSave({
      id: initialData?.id,
      name,
      status,
      description,
      interface: iface,
      type,
      ipRange: formatValue(ipRange),
      netmask: formatValue(netmask),
      gateway: formatValue(gateway),
      dnsType,
      primaryDns: formatValue(primaryDns),
      secondaryDns: formatValue(secondaryDns),
    });
  };

  // Enhanced Variable Input Component
  const VariableInput = ({ 
      value, 
      onChange, 
      placeholder, 
      multiline = false 
  }: { 
      value: string, 
      onChange: (val: string) => void, 
      placeholder?: string,
      multiline?: boolean
  }) => {
      const isVariable = value.startsWith('$');
      const displayValue = isVariable ? value.substring(1) : value;

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const newValue = e.target.value;
          // If in variable mode, keep the $ prefix internally
          if (isVariable) {
              onChange(`$${newValue}`);
          } else {
              // If user types $, switch to variable mode immediately
              if (newValue.startsWith('$')) {
                  onChange(newValue);
              } else {
                  onChange(newValue);
              }
          }
      };

      const toggleVariableMode = () => {
          if (isVariable) {
              onChange(value.substring(1)); // Remove $
          } else {
              onChange(`$${value}`); // Add $
          }
      };

      return (
          <div className="relative group">
              {/* Left Icon (Variable Indicator) */}
              <div className={`absolute left-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} z-10 flex items-center pointer-events-none transition-opacity duration-200 ${isVariable ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-purple-600 font-bold text-lg">$</span>
              </div>

              {/* Input Element */}
              {multiline ? (
                  <textarea
                    value={displayValue}
                    onChange={handleInputChange}
                    className={`w-full ${isVariable ? 'pl-7 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' : 'pl-3 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'} pr-32 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all h-20 resize-none font-mono`}
                    placeholder={placeholder}
                  />
              ) : (
                  <input 
                    type="text" 
                    value={displayValue}
                    onChange={handleInputChange}
                    className={`w-full ${isVariable ? 'pl-7 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' : 'pl-3 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'} pr-32 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all font-mono`}
                    placeholder={placeholder}
                  />
              )}

              {/* Right Badge (Template Variable) */}
              <div className={`absolute right-2 ${multiline ? 'top-2' : 'top-1/2 -translate-y-1/2'} flex items-center`}>
                  {isVariable ? (
                      <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs border border-purple-200 select-none">
                          <Variable className="w-3 h-3" />
                          <span>模版变量</span>
                          <button onClick={toggleVariableMode} className="ml-1 hover:text-purple-900"><X className="w-3 h-3" /></button>
                      </div>
                  ) : (
                      // Hidden trigger area or simple button to enable variable mode manually if needed
                      <button 
                        onClick={toggleVariableMode}
                        className="text-gray-300 hover:text-purple-500 transition-colors p-1"
                        title="设为模版变量"
                      >
                          <Variable className="w-4 h-4" />
                      </button>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[750px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? '编辑DHCP服务' : '新增DHCP服务'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6">
                
                {/* Protocol & Type */}
                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">协议类型：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={protocol === 'IPv4'} onChange={() => setProtocol('IPv4')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">IPv4</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={protocol === 'IPv6'} onChange={() => setProtocol('IPv6')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">IPv6</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">服务类型：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={type === 'Server'} onChange={() => setType('Server')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">服务器</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={type === 'Relay'} onChange={() => setType('Relay')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">中继</span>
                        </label>
                    </div>
                </div>

                {/* Basic Info Header */}
                <h4 className="text-sm font-bold text-gray-800 pt-2 pb-1 border-b border-gray-100 mb-2">基本信息</h4>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">名称：</label>
                    <div className="col-span-5">
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="请输入名称"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">启用状态：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={status === 'enabled'} onChange={() => setStatus('enabled')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">启用</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={status === 'disabled'} onChange={() => setStatus('disabled')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">禁用</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">描述：</label>
                    <div className="col-span-5">
                        <input 
                            type="text" 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="请输入描述（选填）"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mt-6 mb-4">
                    <div className="flex space-x-6">
                        <button 
                            onClick={() => setActiveTab('network')}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'network' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            网络信息
                        </button>
                        <button 
                            onClick={() => setActiveTab('advanced')}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            高级设置
                        </button>
                        <button 
                            onClick={() => setActiveTab('binding')}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'binding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            地址绑定
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'network' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-6 items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 text-right">接口：</label>
                            <div className="col-span-5">
                                <select 
                                    value={iface}
                                    onChange={e => setIface(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">请选择接口</option>
                                    {interfaces.map(i => (
                                        <option key={i.id} value={i.name}>{i.name} ({i.ip})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-start gap-4">
                            <label className="text-sm font-medium text-gray-700 text-right pt-2">可分配IP地址范围：</label>
                            <div className="col-span-5 relative">
                                <VariableInput 
                                    value={ipRange} 
                                    onChange={setIpRange} 
                                    placeholder="请输入IP地址范围（选填），支持变量" 
                                    multiline 
                                />
                                {!ipRange.startsWith('$') && (
                                    <div className="absolute right-2 bottom-2 pointer-events-none">
                                        <Info className="w-4 h-4 text-blue-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 text-right">子网掩码：</label>
                            <div className="col-span-5">
                                <VariableInput 
                                    value={netmask} 
                                    onChange={setNetmask} 
                                    placeholder="255.255.255.0" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 text-right">DHCP网关：</label>
                            <div className="col-span-5">
                                <VariableInput 
                                    value={gateway} 
                                    onChange={setGateway} 
                                    placeholder="请输入DHCP网关（选填）" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 text-right">DNS服务器：</label>
                            <div className="col-span-5 flex space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" checked={dnsType === 'system'} onChange={() => setDnsType('system')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="ml-2 text-sm text-gray-700">使用系统DNS设置</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" checked={dnsType === 'custom'} onChange={() => setDnsType('custom')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    <span className="ml-2 text-sm text-gray-700">自定义</span>
                                </label>
                            </div>
                        </div>

                        {dnsType === 'custom' && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4 col-start-2 col-span-5 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <label className="text-xs font-medium text-gray-600 text-right col-span-1">首选DNS：</label>
                                    <div className="col-span-5">
                                        <VariableInput value={primaryDns} onChange={setPrimaryDns} placeholder="请输入首选DNS（选填）" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 items-center gap-4">
                                    <label className="text-xs font-medium text-gray-600 text-right col-span-1">备用DNS：</label>
                                    <div className="col-span-5">
                                        <VariableInput value={secondaryDns} onChange={setSecondaryDns} placeholder="请输入备用DNS（选填）" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="py-10 text-center text-gray-400">高级设置内容...</div>
                )}
                
                {activeTab === 'binding' && (
                    <div className="py-10 text-center text-gray-400">地址绑定内容...</div>
                )}

            </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center space-x-3">
            <button 
                onClick={handleSave} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
            >
                确定并新增
            </button>
            <button 
                onClick={onClose} 
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors"
            >
                取消
            </button>
        </div>
      </div>
    </div>
  );
};

export default DhcpModal;
