
import React, { useState, useEffect } from 'react';
import { X, Info, Variable } from 'lucide-react';
import { StaticRoute, NetworkInterface } from '../types';

interface StaticRouteModalProps {
  initialData?: StaticRoute | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<StaticRoute>) => void;
}

const StaticRouteModal: React.FC<StaticRouteModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [ipVersion, setIpVersion] = useState<'IPv4' | 'IPv6'>('IPv4');
  const [destination, setDestination] = useState('');
  const [iface, setIface] = useState('');
  const [nextHop, setNextHop] = useState('');
  const [distance, setDistance] = useState(1);
  const [metric, setMetric] = useState(0);
  const [status, setStatus] = useState<'enabled' | 'disabled'>('enabled');
  const [description, setDescription] = useState('');
  const [reliabilityDetection, setReliabilityDetection] = useState(false);

  useEffect(() => {
    if (initialData) {
      setIpVersion(initialData.ipVersion);
      setDestination(initialData.destination);
      setIface(initialData.interface);
      setNextHop(initialData.nextHop || '');
      setDistance(initialData.distance);
      setMetric(initialData.metric);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setReliabilityDetection(initialData.reliabilityDetection || false);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!destination.trim()) return alert('请输入目的地址/掩码');
    
    // Format variables
    const formatValue = (val: string) => val.startsWith('$') ? val : val;

    onSave({
      id: initialData?.id,
      ipVersion,
      destination: formatValue(destination),
      interface: iface,
      nextHop: formatValue(nextHop),
      distance,
      metric,
      status,
      description,
      reliabilityDetection
    });
  };

  // Inline Variable Input Component for simplicity in this file
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
                className={`w-full ${isVariable ? 'pl-7 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' : 'pl-3 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'} pr-32 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all font-mono`}
                placeholder={placeholder}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {isVariable ? (
                      <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs border border-purple-200 select-none cursor-pointer" onClick={toggleVariable}>
                          <Variable className="w-3 h-3" />
                          <span>模版变量</span>
                          <X className="w-3 h-3 ml-1" />
                      </div>
                  ) : (
                      <button onClick={toggleVariable} className="text-gray-300 hover:text-purple-500 transition-colors p-1" title="设为模版变量">
                          <Variable className="w-4 h-4" />
                      </button>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? '编辑静态路由' : '新增静态路由'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6">
                
                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">新建路由数量：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked readOnly className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700 font-bold">单条</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" disabled className="text-gray-300 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-400">多条</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">协议类型：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={ipVersion === 'IPv4'} onChange={() => setIpVersion('IPv4')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">IPv4</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={ipVersion === 'IPv6'} onChange={() => setIpVersion('IPv6')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">IPv6</span>
                        </label>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-gray-800 pt-2 pb-1 border-b border-gray-100 mb-2">基础信息</h4>

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

                <h4 className="text-sm font-bold text-gray-800 pt-2 pb-1 border-b border-gray-100 mb-2">业务信息</h4>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">目的地址/掩码：</label>
                    <div className="col-span-5 flex items-center">
                        <VariableInput value={destination} onChange={setDestination} placeholder="请输入目的地址/掩码" />
                        <Info className="w-4 h-4 text-blue-500 ml-2" />
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">接口：</label>
                    <div className="col-span-5 flex items-center">
                        <select 
                            value={iface}
                            onChange={e => setIface(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                            <option value="">自动选择接口</option>
                            {interfaces.map(i => (
                                <option key={i.id} value={i.name}>{i.name}</option>
                            ))}
                        </select>
                        <Info className="w-4 h-4 text-blue-500 ml-2" />
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">下一跳地址：</label>
                    <div className="col-span-5 flex items-center">
                        <VariableInput value={nextHop} onChange={setNextHop} placeholder="请输入下一跳地址（选填）" />
                        <Info className="w-4 h-4 text-blue-500 ml-2" />
                    </div>
                </div>

                <h4 className="text-sm font-bold text-gray-800 pt-2 pb-1 border-b border-gray-100 mb-2">高级设置</h4>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">管理距离：</label>
                    <div className="col-span-5">
                        <input 
                            type="number" 
                            value={distance}
                            onChange={e => setDistance(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">度量值：</label>
                    <div className="col-span-5">
                        <input 
                            type="number" 
                            value={metric}
                            onChange={e => setMetric(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-6 items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 text-right">可靠性检测：</label>
                    <div className="col-span-5 flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={!reliabilityDetection} onChange={() => setReliabilityDetection(false)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">不检测</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" checked={reliabilityDetection} onChange={() => setReliabilityDetection(true)} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                            <span className="ml-2 text-sm text-gray-700">链路故障检测</span>
                        </label>
                    </div>
                </div>

            </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center space-x-3">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">确定</button>
            <button onClick={onSave.bind(null, { ...initialData } as any)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded transition-colors hidden">确定并新增</button>
            <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors">取消</button>
        </div>
      </div>
    </div>
  );
};

export default StaticRouteModal;
