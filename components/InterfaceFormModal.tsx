
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
  const [gatewayValue, setGatewayValue] = useState('');
  
  // DHCP Configuration States
  const [dhcpDefaultRoute, setDhcpDefaultRoute] = useState(false);
  const [dhcpCommunicationMode, setDhcpCommunicationMode] = useState<'unicast' | 'broadcast'>('broadcast');
  const [dhcpSystemDns, setDhcpSystemDns] = useState(true);

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
          setIpValue(cleanIp);

          const cleanGateway = initialData.gateway || '';
          setGatewayValue(cleanGateway);

          // DHCP Specifics
          setDhcpDefaultRoute(initialData.dhcpDefaultRoute || false);
          setDhcpCommunicationMode(initialData.dhcpCommunicationMode || 'broadcast');
          setDhcpSystemDns(initialData.dhcpSystemDns !== undefined ? initialData.dhcpSystemDns : true);

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
          
          setDhcpDefaultRoute(false);
          setDhcpCommunicationMode('broadcast');
          setDhcpSystemDns(true);
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

      const finalIp = connectionType === 'Static' && ipValue
        ? ipValue
        : (connectionType === 'DHCP' ? 'DHCP' : '-');

      const finalGateway = connectionType === 'Static' && gatewayValue
        ? gatewayValue
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
          // DHCP fields
          dhcpDefaultRoute: connectionType === 'DHCP' ? dhcpDefaultRoute : undefined,
          dhcpCommunicationMode: connectionType === 'DHCP' ? dhcpCommunicationMode : undefined,
          dhcpSystemDns: connectionType === 'DHCP' ? dhcpSystemDns : undefined,
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

  // Hybrid Variable Input Component
  const HybridInput = ({ 
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
          if (isVariable) {
              onChange(`$${newValue}`);
          } else {
              // Auto-detect variable start
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
          <div className="relative group w-full">
              {/* Prefix Icon */}
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center pointer-events-none transition-opacity duration-200 ${isVariable ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-purple-600 font-bold text-lg">$</span>
              </div>
              
              {/* Actual Input */}
              <input 
                type="text" 
                value={displayValue}
                onChange={handleInputChange}
                className={`
                    w-full py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all font-mono
                    ${isVariable 
                        ? 'pl-7 pr-10 text-purple-700 bg-purple-50/10 border-purple-300 focus:ring-purple-200' 
                        : 'pl-3 pr-10 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800'
                    }
                `}
                placeholder={placeholder}
              />
              
              {/* Right Action Button */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <button 
                    type="button"
                    onClick={toggleVariableMode}
                    className={`p-1.5 rounded transition-colors ${isVariable ? 'text-purple-600 hover:bg-purple-100' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                    title={isVariable ? "切换为固定值" : "设为模版变量"}
                  >
                      <Variable className="w-4 h-4" />
                  </button>
              </div>
          </div>
      );
  };

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
                </div>
            </div>

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
                                <span className={`ml-2 text-sm ${connectionType === 'Static' ? 'text-gray-800 font-bold' : 'text-gray-600'}`}>静态IP</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="connType" 
                                    checked={connectionType === 'DHCP'}
                                    onChange={() => setConnectionType('DHCP')}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                />
                                <span className={`ml-2 text-sm ${connectionType === 'DHCP' ? 'text-gray-800 font-bold' : 'text-gray-600'}`}>DHCP</span>
                            </label>
                        </div>
                    </div>
                    
                    {connectionType === 'DHCP' && (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 ml-10 relative mt-2">
                            <div className="absolute -top-1.5 left-10 w-3 h-3 bg-gray-50 border-t border-l border-gray-200 transform rotate-45"></div>
                            <div className="space-y-5">
                                <div className="flex items-center">
                                    <label className="w-28 text-sm font-medium text-gray-600 text-right mr-3">默认路由：</label>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={dhcpDefaultRoute} onChange={e => setDhcpDefaultRoute(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2 text-sm text-gray-700">获取</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {connectionType === 'Static' && (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 ml-10 relative animate-in fade-in slide-in-from-top-2 duration-200">
                             <div className="flex items-start mb-6">
                                 <label className="w-20 text-sm font-bold text-gray-700 mt-2">IP地址：</label>
                                 <div className="flex-1">
                                     <HybridInput 
                                        value={ipValue}
                                        onChange={setIpValue}
                                        placeholder="例如: 192.168.1.1/24"
                                     />
                                     <p className="mt-2 text-xs text-gray-500">
                                         既支持输入固定IP（如 192.168.1.1/24），也支持变量下发（如 $interface_ip）
                                     </p>
                                 </div>
                             </div>

                             <div className="flex items-center">
                                 <label className="w-20 text-sm font-bold text-gray-700 mt-2">网关：</label>
                                 <div className="flex-1">
                                     <HybridInput 
                                        value={gatewayValue}
                                        onChange={setGatewayValue}
                                        placeholder="选填"
                                     />
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
                        <span className="text-sm text-gray-600 mr-2">上下行</span>
                        <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                            <input type="text" defaultValue="0" className="w-20 px-2 py-1.5 text-sm focus:outline-none text-right" />
                            <div className="border-l border-gray-300 bg-gray-50 px-2 py-1.5 flex items-center justify-center min-w-[70px]">
                                <span className="text-xs text-gray-600">Kbps</span>
                            </div>
                        </div>
                    </div>
                    <Info className="w-4 h-4 text-blue-500 cursor-pointer" />
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
