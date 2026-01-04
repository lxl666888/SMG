
import React, { useState, useEffect } from 'react';
import { X, Info, Variable, Search, Monitor, Check, AlertCircle } from 'lucide-react';
import { NetworkInterface } from '../types';

interface InterfaceFormModalProps {
  initialData?: NetworkInterface | null;
  category?: NetworkInterface['category'];
  availableInterfaces?: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<NetworkInterface>) => void;
}

const InterfaceFormModal: React.FC<InterfaceFormModalProps> = ({ 
    initialData, 
    category = 'physical', 
    availableInterfaces = [], 
    onClose, 
    onSave 
}) => {
  // Form States
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'up' | 'down'>('up');
  const [description, setDescription] = useState('');
  const [virtualSystem, setVirtualSystem] = useState('public');
  const [type, setType] = useState('L3');
  const [zone, setZone] = useState('');
  const [isWan, setIsWan] = useState(false);
  const [sourceInOut, setSourceInOut] = useState(false);
  
  // Specific for Sub/VLAN
  const [parentInterface, setParentInterface] = useState('');
  const [vlanId, setVlanId] = useState('');

  // Specific for Aggregate
  const [aggrId, setAggrId] = useState('');
  const [workMode, setWorkMode] = useState('load-balance');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [memberSearch, setMemberSearch] = useState('');

  // IP Configuration States
  const [connectionType, setConnectionType] = useState('Static');
  const [ipValue, setIpValue] = useState('');
  const [gatewayValue, setGatewayValue] = useState(''); // Changed to support variable logic
  
  // Initialize form if editing
  useEffect(() => {
      if (initialData) {
          setName(initialData.name);
          setStatus(initialData.status === 'down' ? 'down' : 'up');
          setDescription(''); 
          setVirtualSystem(initialData.virtualSystem || 'public');
          setType(initialData.type);
          setZone(initialData.zone);
          setIsWan(initialData.isWan);
          setSourceInOut(initialData.sourceInOut || false);
          
          setConnectionType(initialData.connectionType === 'DHCP' ? 'DHCP' : 'Static');
          
          const cleanIp = initialData.ip === '-' ? '' : initialData.ip;
          setIpValue(cleanIp.startsWith('$') ? cleanIp.substring(1) : cleanIp);

          // Handle Gateway Variable
          const cleanGateway = initialData.gateway || '';
          setGatewayValue(cleanGateway.startsWith('$') ? cleanGateway.substring(1) : cleanGateway);

          // Sub/VLAN specifics
          setVlanId(initialData.vlanId || '');
          setParentInterface(initialData.parentInterface || '');

          // Aggregate Specifics
          if (initialData.category === 'aggregate') {
              const idPart = initialData.name.replace('aggr.', '');
              setAggrId(idPart);
              setWorkMode(initialData.workMode || 'load-balance');
              if (initialData.memberInterfaces) {
                  setSelectedMembers(new Set(initialData.memberInterfaces));
              }
          }
      } else {
          // Defaults for new
          setName('');
          setIpValue('');
          setGatewayValue('');
          setVirtualSystem('public');
          setVlanId('');
          setParentInterface('');
          setAggrId('');
          setWorkMode('load-balance');
          setSelectedMembers(new Set());
      }
  }, [initialData]);

  // Auto-generate name logic
  useEffect(() => {
      if (!initialData) {
          if (category === 'sub' && parentInterface && vlanId) {
              setName(`${parentInterface}.${vlanId}`);
          } else if (category === 'vlan' && vlanId) {
              setName(`veth.${vlanId}`);
          } else if (category === 'aggregate' && aggrId) {
              setName(`aggr.${aggrId}`);
          }
      }
  }, [category, parentInterface, vlanId, aggrId, initialData]);

  const handleSave = () => {
      // Basic validation
      if (category === 'aggregate' && !aggrId) return alert('请输入聚合接口ID');
      if (!name) return alert('请输入接口名称');
      if (category === 'sub' && !parentInterface) return alert('请选择主接口');
      if ((category === 'sub' || category === 'vlan') && !vlanId) return alert('请输入VLAN ID');

      // Force variable format for Static IP
      const finalIp = connectionType === 'Static' && ipValue
        ? (ipValue.startsWith('$') ? ipValue : `$${ipValue}`) 
        : (connectionType === 'DHCP' ? 'DHCP' : '-');

      // Force variable format for Gateway
      const finalGateway = connectionType === 'Static' && gatewayValue
        ? (gatewayValue.startsWith('$') ? gatewayValue : `$${gatewayValue}`)
        : '';

      const payload: Partial<NetworkInterface> = {
          id: initialData?.id, 
          name,
          status,
          virtualSystem,
          type: category === 'aggregate' ? 'Aggregate' : type as any,
          zone: zone || '未区域选择',
          isWan,
          category: category as NetworkInterface['category'], 
          connectionType,
          ip: finalIp,
          gateway: finalGateway,
          mode: category === 'vlan' ? '-' : 'Auto', 
          mtu: '1500',
          vlanId: (category === 'sub' || category === 'vlan') ? vlanId : undefined,
          parentInterface: category === 'sub' ? parentInterface : undefined,
          sourceInOut,
          // Aggregate fields
          workMode: category === 'aggregate' ? workMode : undefined,
          memberInterfaces: category === 'aggregate' ? Array.from(selectedMembers) : undefined
      };
      
      onSave(payload);
  };

  const getTitle = () => {
      if (initialData) return '编辑接口';
      if (category === 'sub') return '新增子接口';
      if (category === 'vlan') return '新增VLAN接口';
      if (category === 'aggregate') return '新增聚合接口';
      return '新增物理接口';
  };

  const filteredMembers = availableInterfaces.filter(
      i => i.category === 'physical' && 
      i.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
              {getTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            {/* Section 1: Basic Info */}
            <div className="mb-6">
                <h4 className="text-base font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">基础信息</h4>
                
                <div className="space-y-5">
                    
                    {/* Name Logic */}
                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700">接口名称：</label>
                        {category === 'aggregate' ? (
                            <div className="flex items-center flex-1">
                                <span className="text-gray-500 mr-2">aggr.</span>
                                <input 
                                    type="text" 
                                    value={aggrId}
                                    onChange={e => setAggrId(e.target.value)}
                                    placeholder="1-16" 
                                    className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    autoFocus
                                />
                                <Info className="w-4 h-4 text-blue-500 ml-2" />
                            </div>
                        ) : category === 'physical' ? (
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="ethx" 
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        ) : (
                            <div className="flex-1 text-sm font-mono font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                {name || '(自动生成)'}
                            </div>
                        )}
                    </div>

                    {category === 'sub' && (
                        <div className="flex items-center">
                            <label className="w-24 text-sm font-medium text-gray-700">主接口：</label>
                            <select 
                                value={parentInterface}
                                onChange={e => setParentInterface(e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                disabled={!!initialData} 
                            >
                                <option value="">请选择主接口</option>
                                <option value="eth1">eth1</option>
                                <option value="eth2">eth2</option>
                                <option value="eth3">eth3</option>
                            </select>
                        </div>
                    )}

                    {(category === 'sub' || category === 'vlan') && (
                        <div className="flex items-center">
                            <label className="w-24 text-sm font-medium text-gray-700">VLAN ID：</label>
                            <input 
                                type="text" 
                                value={vlanId}
                                onChange={e => setVlanId(e.target.value)}
                                placeholder="1-4094" 
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    )}

                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700">描述：</label>
                        <input 
                            type="text" 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="请输入描述（选填）" 
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {category !== 'vlan' && (
                        <div className="flex items-center">
                            <label className="w-24 text-sm font-medium text-gray-700">类型：</label>
                            {category === 'aggregate' ? (
                                <select 
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="L3">路由</option>
                                    <option value="L2">二层</option>
                                </select>
                            ) : (
                                <select 
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                >
                                    <option value="L3">路由</option>
                                    <option value="L2">二层</option>
                                    <option value="VirtualWire">虚拟网线</option>
                                </select>
                            )}
                        </div>
                    )}

                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700">所属区域：</label>
                        <select 
                            value={zone}
                            onChange={e => setZone(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                            <option value="">请选择区域</option>
                            <option value="Trust">Trust</option>
                            <option value="Untrust">Untrust</option>
                            <option value="DMZ">DMZ</option>
                            <option value="Mgmt">L3_manage</option>
                        </select>
                    </div>

                    {category === 'aggregate' && (
                        <div className="flex items-center">
                            <label className="w-24 text-sm font-medium text-gray-700">工作模式：</label>
                            <select 
                                value={workMode}
                                onChange={e => setWorkMode(e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                                <option value="load-balance">负载均衡-hash</option>
                                <option value="lacp">LACP (802.3ad)</option>
                                <option value="round-robin">轮询</option>
                                <option value="active-backup">主备</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700">基本属性：</label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isWan}
                                onChange={e => setIsWan(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            />
                            <span className="ml-2 text-sm text-gray-700">WAN口</span>
                        </label>
                    </div>

                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700 flex items-center">
                            源进源出
                            <Info className="w-3.5 h-3.5 ml-1 text-blue-500 cursor-pointer" />
                            ：
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={sourceInOut}
                                onChange={e => setSourceInOut(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            />
                            <span className="ml-2 text-sm text-gray-700">启用</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Aggregate Member Selection */}
            {category === 'aggregate' && (
                <div className="mb-6">
                    <h4 className="text-base font-bold text-gray-800 mb-2">选择聚合接口</h4>
                    <div className="bg-orange-50 border border-orange-100 rounded p-2 mb-4 flex items-start text-xs text-orange-700">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                        选择的接口巨帧开启禁用状态不一致时可能导致丢包，请检查成员口配置。
                    </div>

                    <div className="flex border border-gray-300 rounded-lg h-[250px]">
                        {/* Left: Available */}
                        <div className="flex-1 flex flex-col border-r border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">待选 ({filteredMembers.filter(i => !selectedMembers.has(i.name)).length})</span>
                            </div>
                            <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        placeholder="搜索关键字"
                                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {filteredMembers.map(iface => {
                                    if (selectedMembers.has(iface.name)) return null;
                                    return (
                                        <div 
                                            key={iface.id}
                                            onClick={() => {
                                                const newSet = new Set(selectedMembers);
                                                newSet.add(iface.name);
                                                setSelectedMembers(newSet);
                                            }}
                                            className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer group"
                                        >
                                            <div className="w-4 h-4 border border-gray-300 rounded mr-2 bg-white group-hover:border-blue-400"></div>
                                            <Monitor className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">{iface.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Selected */}
                        <div className="flex-1 flex flex-col bg-blue-50/20">
                            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">已选 ({selectedMembers.size})</span>
                                <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedMembers(new Set())}>清空</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {Array.from(selectedMembers).map(name => (
                                    <div 
                                        key={name}
                                        onClick={() => {
                                            const newSet = new Set(selectedMembers);
                                            newSet.delete(name);
                                            setSelectedMembers(newSet);
                                        }}
                                        className="flex items-center px-2 py-1.5 hover:bg-red-50 rounded cursor-pointer group border border-transparent hover:border-red-100"
                                    >
                                        <div className="w-4 h-4 bg-blue-600 border border-blue-600 rounded mr-2 flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 transition-colors">
                                            <Check className="w-3 h-3 text-white group-hover:hidden" />
                                            <X className="w-3 h-3 text-white hidden group-hover:block" />
                                        </div>
                                        <Monitor className="w-3.5 h-3.5 mr-2 text-blue-600 group-hover:text-red-500" />
                                        <span className="text-sm text-gray-800 group-hover:text-red-700">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-gray-200 my-6"></div>

            {/* Section 2: IP Config (Shared) */}
            <div className="mb-6">
                 <div className="border-b border-gray-200 flex space-x-6 mb-4">
                     <button className="pb-2 text-sm font-bold text-blue-600 border-b-2 border-blue-600">IPv4</button>
                     <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">IPv6</button>
                     <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">高级设置</button>
                 </div>

                 <div className="py-2 space-y-5">
                    <div className="flex items-center">
                        <label className="w-24 text-sm font-medium text-gray-700">连接类型：</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="connType" 
                                    checked={connectionType === 'Static'}
                                    onChange={() => setConnectionType('Static')}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                />
                                <span className="ml-2 text-sm text-gray-700 font-bold">静态IP</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="connType" 
                                    checked={connectionType === 'DHCP'}
                                    onChange={() => setConnectionType('DHCP')}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                />
                                <span className="ml-2 text-sm text-gray-700">DHCP</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="connType" disabled className="text-gray-300 w-4 h-4" />
                                <span className="ml-2 text-sm text-gray-400">PPPoE</span>
                            </label>
                        </div>
                    </div>
                    
                    {connectionType === 'Static' && (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 ml-10 relative animate-in fade-in slide-in-from-top-2 duration-200">
                             
                             <div className="flex items-start mb-6">
                                 <label className="w-20 text-sm font-bold text-gray-700 mt-2">IP地址：</label>
                                 <div className="flex-1">
                                     <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <span className="text-purple-500 font-bold text-lg">$</span>
                                         </div>
                                         <input 
                                            type="text" 
                                            value={ipValue} 
                                            onChange={e => setIpValue(e.target.value)}
                                            className="w-full pl-7 pr-28 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-sm shadow-sm"
                                            placeholder="例如: interface_ip"
                                         />
                                         <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none">
                                             <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs text-gray-500 border border-gray-200 mr-1">
                                                 <Variable className="w-3 h-3 mr-1 text-purple-500" />
                                                 模版变量
                                             </div>
                                         </div>
                                     </div>
                                     <p className="mt-2 text-xs text-gray-500">
                                         请输入模版变量名（如 interface_ip），下发时将替换为设备实际IP。
                                     </p>
                                 </div>
                             </div>

                             <div className="flex items-center">
                                 <label className="w-20 text-sm font-bold text-gray-700 mt-2">网关：</label>
                                 <div className="flex-1">
                                     <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <span className="text-purple-500 font-bold text-lg">$</span>
                                         </div>
                                         <input 
                                            type="text" 
                                            value={gatewayValue} 
                                            onChange={e => setGatewayValue(e.target.value)}
                                            className="w-full pl-7 pr-28 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-sm shadow-sm"
                                            placeholder="选填"
                                         />
                                         <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none">
                                             <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs text-gray-500 border border-gray-200 mr-1">
                                                 <Variable className="w-3 h-3 mr-1 text-purple-500" />
                                                 模版变量
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}
                 </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Section 3: Bandwidth (Shared) */}
            <div className="mb-6 flex items-center">
                <label className="w-24 text-sm font-medium text-gray-700">线路带宽：</label>
                <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">上行</span>
                        <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                            <input type="text" defaultValue="0" className="w-20 px-2 py-1.5 text-sm focus:outline-none text-right" />
                            <div className="border-l border-gray-300 bg-gray-50 px-2 py-1.5 flex items-center justify-center min-w-[70px]">
                                <span className="text-xs text-gray-600">Kbps</span>
                                <svg className="w-3 h-3 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">下行</span>
                        <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                            <input type="text" defaultValue="0" className="w-20 px-2 py-1.5 text-sm focus:outline-none text-right" />
                            <div className="border-l border-gray-300 bg-gray-50 px-2 py-1.5 flex items-center justify-center min-w-[70px]">
                                <span className="text-xs text-gray-600">Kbps</span>
                                <svg className="w-3 h-3 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                    <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
                </div>
            </div>

            {/* Section 4: Management (Shared) */}
            <div>
                 <h4 className="text-base font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">管理设备方式</h4>
                 <div className="flex items-center">
                     <label className="w-24 text-sm font-medium text-gray-700">允许：</label>
                     <div className="flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">WEBUI</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">PING</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">SNMP</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">SSH</span>
                        </label>
                     </div>
                 </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center space-x-3">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded transition-colors"
            >
                取消
            </button>
            <button 
                onClick={handleSave}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors flex items-center"
            >
                {initialData ? '保存修改' : '确定'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default InterfaceFormModal;
