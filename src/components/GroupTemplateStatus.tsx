
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TemplateStack, NetworkInterface, Template, DeviceGroup, NetworkZone, VirtualWire, VirtualLine, DnsConfig, DdnsPolicy, DhcpConfig, StaticRoute, BgpGlobalConfig, BgpNetwork } from '../types';
import { Layers, AlertCircle, Monitor, Filter, Settings, Box, CheckCircle2, ChevronDown, Server, LayoutGrid, ArrowRight, Share2, Check, SquarePen, ExternalLink, Settings2, Cable, TrendingUp, Globe, Route, Sliders } from 'lucide-react';
import TemplateSidebar from './TemplateSidebar';
import NetworkTable from './NetworkTable';
import ZoneTable from './ZoneTable';
import VirtualWireTable from './VirtualWireTable';
import VirtualLineTable from './VirtualLineTable';
import NetworkDns from './NetworkDns';
import NetworkRoutes from './NetworkRoutes';
import DhcpTable from './DhcpTable';
import SystemConfigForm from './SystemConfigForm';
import { MOCK_DEVICE_GROUPS } from '../constants';

interface GroupTemplateStatusProps {
  groupName: string;
  appliedStacks?: TemplateStack[];
  configData?: NetworkInterface[];
  zoneData?: NetworkZone[]; 
  vWireData?: VirtualWire[]; 
  vLineData?: VirtualLine[]; 
  dnsConfigData?: DnsConfig; 
  ddnsPolicyData?: DdnsPolicy[]; 
  dhcpData?: DhcpConfig[];
  staticRoutes?: StaticRoute[];
  bgpGlobal?: BgpGlobalConfig;
  bgpNetworks?: BgpNetwork[];
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  showNetworkConfig?: boolean;
  showSystemConfig?: boolean;
  onEditContext?: (type: 'stack' | 'template', id: string) => void;
  onAddInterface?: (category: 'physical' | 'sub' | 'vlan' | 'aggregate', templateId?: string) => void;
  onEditInterface?: (iface: NetworkInterface, templateId?: string) => void;
  onAddZone?: () => void; 
  onEditZone?: (zone: NetworkZone) => void;
  onDeleteZone?: (id: string) => void;
  onAddVWire?: () => void; 
  onEditVWire?: (vw: VirtualWire) => void; 
  onDeleteVWire?: (id: string) => void; 
  onAddVLine?: () => void; 
  onEditVLine?: (vl: VirtualLine) => void; 
  onDeleteVLine?: (id: string) => void; 
  // DNS Handlers
  onSaveDns?: (config: DnsConfig) => void;
  onAddDdns?: () => void;
  onEditDdns?: (policy: DdnsPolicy) => void;
  onDeleteDdns?: (id: string) => void;
  // DHCP Handlers
  onAddDhcp?: () => void;
  onEditDhcp?: (config: DhcpConfig) => void;
  onDeleteDhcp?: (id: string) => void;
  // Routes Handlers
  onAddStaticRoute?: () => void;
  onEditStaticRoute?: (route: StaticRoute) => void;
  onDeleteStaticRoute?: (id: string) => void;
  onSaveBgpGlobal?: (config: BgpGlobalConfig) => void;
  onAddBgpNetwork?: (network: string) => void;
  onDeleteBgpNetwork?: (id: string) => void;
  
  onManageVariables?: (templateId: string) => void; 
  onManageStackVariables?: (stackId: string) => void;
  onManageVariableMappings?: (stackId: string) => void;
}

// Helper type for the unified dropdown
type ViewSelection = 
  | { type: 'stack'; stackId: string }
  | { type: 'template'; stackId: string; templateId: string };

const GroupTemplateStatus: React.FC<GroupTemplateStatusProps> = ({ 
    groupName, 
    appliedStacks = [], 
    configData = [], 
    zoneData = [],
    vWireData = [],
    vLineData = [],
    dnsConfigData,
    ddnsPolicyData = [],
    dhcpData = [],
    staticRoutes = [],
    bgpGlobal,
    bgpNetworks = [],
    activeModule,
    onSelectModule,
    showNetworkConfig = true,
    showSystemConfig = false,
    onEditContext,
    onAddInterface,
    onEditInterface,
    onAddZone,
    onEditZone,
    onDeleteZone,
    onAddVWire,
    onEditVWire,
    onDeleteVWire,
    onAddVLine,
    onEditVLine,
    onDeleteVLine,
    onSaveDns,
    onAddDdns,
    onEditDdns,
    onDeleteDdns,
    onAddDhcp,
    onEditDhcp,
    onDeleteDhcp,
    onAddStaticRoute,
    onEditStaticRoute,
    onDeleteStaticRoute,
    onSaveBgpGlobal,
    onAddBgpNetwork,
    onDeleteBgpNetwork,
    onManageVariables,
    onManageStackVariables,
    onManageVariableMappings
}) => {
  // Single State for the Unified View
  const [selection, setSelection] = useState<ViewSelection | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selection to the first stack
  useEffect(() => {
    if (appliedStacks && appliedStacks.length > 0 && !selection) {
        setSelection({ type: 'stack', stackId: appliedStacks[0].id });
    }
  }, [appliedStacks, selection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derived Data based on Selection
  const activeStackId = selection?.stackId;
  const activeStack = appliedStacks.find(s => s.id === activeStackId);
  
  const activeTemplateId = selection?.type === 'template' ? selection.templateId : undefined;
  const activeTemplate = activeStack?.templates.find(t => t.id === activeTemplateId);

  // Resolve devices for the ACTIVE STACK (Shared logic)
  const resolvedDevices = useMemo(() => {
      if (!activeStack || !activeStack.assignedDeviceGroups) return [];

      const devices: string[] = [];
      
      const findNode = (nodes: DeviceGroup[], name: string): DeviceGroup | null => {
          for (const node of nodes) {
              if (node.name === name) return node;
              if (node.children) {
                  const res = findNode(node.children, name);
                  if (res) return res;
              }
          }
          return null;
      };

      const extractDevices = (node: DeviceGroup) => {
          if (node.type === 'device') {
              devices.push(node.name);
          } else if (node.children) {
              node.children.forEach(extractDevices);
          }
      };

      activeStack.assignedDeviceGroups.forEach(name => {
          const node = findNode(MOCK_DEVICE_GROUPS, name);
          if (node) {
              extractDevices(node);
          } else {
              devices.push(name);
          }
      });
      
      return Array.from(new Set(devices));
  }, [activeStack]);

  // Handle cases with no stacks
  if (!appliedStacks || appliedStacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
         <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
         <h3 className="text-lg font-medium text-gray-500">当前未创建模版参数/模版对设备进行关联</h3>
         <p className="text-sm mt-1">请先通过“+”创建模版参数/模版</p>
      </div>
    );
  }
  
  // Filter config data
  const stackConfigData = configData.filter(item => {
        if (!activeStack) return false;
        // If viewing specific template, only show its items
        if (activeTemplateId) {
            return item.sourceTemplateId === activeTemplateId;
        }
        // If viewing stack, show all items from stack templates + local
        const activeStackTemplateIds = activeStack.templates.map(t => t.id);
        return activeStackTemplateIds.includes(item.sourceTemplateId) || item.sourceTemplateId === 'local';
  });

  const handleSelectStack = (stackId: string) => {
      setSelection({ type: 'stack', stackId });
      setIsDropdownOpen(false);
  };

  const handleSelectTemplate = (stackId: string, templateId: string) => {
      setSelection({ type: 'template', stackId, templateId });
      setIsDropdownOpen(false);
  };

  const renderModuleContent = () => {
    // Determine if we are in editable mode (Single Template View)
    const isTemplateView = selection?.type === 'template';

    switch (activeModule) {
        case 'network_interfaces':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         <NetworkTable 
                            data={stackConfigData} 
                            activeTemplateId={activeTemplateId || null} 
                            isDeviceView={false} 
                            // Enable editing if viewing a specific template
                            isEditable={isTemplateView} 
                            stackTemplates={activeStack ? [...activeStack.templates].reverse() : []} 
                            stacks={appliedStacks} 
                            onAdd={(category) => onAddInterface && onAddInterface(category, activeTemplateId)}
                            onEdit={(iface) => onEditInterface && onEditInterface(iface, activeTemplateId)}
                            onDelete={(id) => alert(`功能演示：删除接口 ${id}`)}
                         />
                    </div>
                </div>
            );
        case 'network_zones':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         <ZoneTable
                            data={zoneData}
                            onAdd={() => onAddZone && onAddZone()}
                            onEdit={(zone) => onEditZone && onEditZone(zone)}
                            onDelete={(id) => onDeleteZone && onDeleteZone(id)}
                         />
                    </div>
                </div>
            );
        case 'network_vwire':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         <VirtualWireTable
                            data={vWireData}
                            onAdd={() => onAddVWire && onAddVWire()}
                            onEdit={(vw) => onEditVWire && onEditVWire(vw)}
                            onDelete={(id) => onDeleteVWire && onDeleteVWire(id)}
                         />
                    </div>
                </div>
            );
        case 'network_vlist':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         <VirtualLineTable
                            data={vLineData}
                            onAdd={() => onAddVLine && onAddVLine()}
                            onEdit={(vl) => onEditVLine && onEditVLine(vl)}
                            onDelete={(id) => onDeleteVLine && onDeleteVLine(id)}
                         />
                    </div>
                </div>
            );
        case 'network_routes':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         {bgpGlobal && (
                             <NetworkRoutes 
                                staticRoutes={staticRoutes}
                                bgpGlobal={bgpGlobal}
                                bgpNetworks={bgpNetworks}
                                interfaces={configData}
                                isEditable={isTemplateView}
                                onAddStaticRoute={() => onAddStaticRoute && onAddStaticRoute()}
                                onEditStaticRoute={(route) => onEditStaticRoute && onEditStaticRoute(route)}
                                onDeleteStaticRoute={(id) => onDeleteStaticRoute && onDeleteStaticRoute(id)}
                                onSaveBgpGlobal={(config) => onSaveBgpGlobal && onSaveBgpGlobal(config)}
                                onAddBgpNetwork={(network) => onAddBgpNetwork && onAddBgpNetwork(network)}
                                onDeleteBgpNetwork={(id) => onDeleteBgpNetwork && onDeleteBgpNetwork(id)}
                             />
                         )}
                    </div>
                </div>
            );
        case 'network_dns':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         {dnsConfigData && (
                             <NetworkDns 
                                dnsConfig={dnsConfigData}
                                ddnsPolicies={ddnsPolicyData}
                                isEditable={isTemplateView}
                                onSaveDns={(cfg) => onSaveDns && onSaveDns(cfg)}
                                onAddDdns={() => onAddDdns && onAddDdns()}
                                onEditDdns={(policy) => onEditDdns && onEditDdns(policy)}
                                onDeleteDdns={(id) => onDeleteDdns && onDeleteDdns(id)}
                             />
                         )}
                    </div>
                </div>
            );
        case 'network_dhcp':
            return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-white relative">
                         <DhcpTable
                            data={dhcpData}
                            onAdd={() => onAddDhcp && onAddDhcp()}
                            onEdit={(config) => onEditDhcp && onEditDhcp(config)}
                            onDelete={(id) => onDeleteDhcp && onDeleteDhcp(id)}
                         />
                    </div>
                </div>
            );
        case 'system_general':
             return (
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 relative">
                         <SystemConfigForm isPreview={!isTemplateView} />
                    </div>
                </div>
             );
        default:
            return (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
                    <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">模块: {activeModule}</h3>
                    <p className="text-sm">该配置模块暂无预览数据</p>
                </div>
            );
    }
  };

  // Determine label for the dropdown
  const getDropdownLabel = () => {
      if (!selection || !activeStack) return '请选择视图';
      if (selection.type === 'stack') {
          return `${activeStack.name} (完整模版堆栈)`;
      }
      if (selection.type === 'template' && activeTemplate) {
          return `${activeTemplate.name} (模版参数)`;
      }
      return 'Unknown';
  };

  const getModuleTitle = () => {
      switch(activeModule) {
          case 'network_interfaces': return '网络接口配置';
          case 'network_zones': return '安全区域配置';
          case 'network_vwire': return '虚拟网线配置';
          case 'network_vlist': return '虚拟线路列表';
          case 'network_routes': return '路由配置';
          case 'network_dns': return 'DNS配置';
          case 'network_dhcp': return 'DHCP服务';
          case 'system_general': return '系统通用配置';
          default: return '系统配置';
      }
  };

  const getModuleIcon = () => {
      switch(activeModule) {
          case 'network_vwire': return <Cable className="w-3.5 h-3.5 mr-2 text-blue-600" />;
          case 'network_vlist': return <TrendingUp className="w-3.5 h-3.5 mr-2 text-blue-600" />;
          case 'network_routes': return <Route className="w-3.5 h-3.5 mr-2 text-blue-600" />;
          case 'network_dns': return <Globe className="w-3.5 h-3.5 mr-2 text-blue-600" />;
          case 'network_dhcp': return <Server className="w-3.5 h-3.5 mr-2 text-blue-600" />;
          default: return <Monitor className="w-3.5 h-3.5 mr-2 text-blue-600" />;
      }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden font-sans">
        
        {/* Unified Top Control Bar - Compact */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-20 flex items-start gap-8 min-h-[70px]">
            {/* ... (Keep existing Header Logic) ... */}
            <div className="w-[340px] flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <Filter className="w-3 h-3 mr-1.5" />
                    配置视图选择
                </label>
                
                <div className="relative group" ref={dropdownRef}>
                    <div className={`flex items-center w-full border rounded-md shadow-sm bg-white transition-all h-9 ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-blue-400'}`}>
                        
                        {/* Dropdown Toggle Area */}
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex-1 flex items-center px-3 overflow-hidden text-left h-full"
                        >
                            <div className="flex items-center truncate">
                                {selection?.type === 'stack' ? (
                                    <Layers className="w-3.5 h-3.5 mr-2 text-blue-600 shrink-0" />
                                ) : (
                                    <Box className="w-3.5 h-3.5 mr-2 text-indigo-600 shrink-0" />
                                )}
                                <span className="font-bold text-sm text-gray-800 truncate">{getDropdownLabel()}</span>
                            </div>
                        </button>
                        
                        {/* Actions Area */}
                        <div className="flex items-center pr-2 bg-white h-full">
                            {/* Separator */}
                            <div className="h-4 w-px bg-gray-200 mx-1.5"></div>

                            {/* Edit Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEditContext && selection) {
                                        onEditContext(selection.type, selection.type === 'stack' ? selection.stackId : selection.templateId);
                                    }
                                }}
                                className="group/edit flex items-center px-2 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                                title={selection?.type === 'stack' ? '编辑模版堆栈' : '编辑模版参数'}
                            >
                                编辑
                                <SquarePen className="w-3 h-3 ml-1 group-hover/edit:scale-110 transition-transform" />
                            </button>

                             {/* Toggle Chevron */}
                             <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                             >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                             </button>
                        </div>
                    </div>
                    
                    {/* Dropdown Content */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-[500px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                             {appliedStacks.map(stack => (
                                 <div key={stack.id} className="mb-2 last:mb-0">
                                     {/* Stack Header (Selectable) */}
                                     <div className="px-2">
                                         <button 
                                            onClick={() => handleSelectStack(stack.id)}
                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between group transition-colors ${selection?.type === 'stack' && selection.stackId === stack.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'}`}
                                         >
                                             <div className="flex items-center">
                                                 <Layers className="w-4 h-4 mr-2 opacity-70" />
                                                 <span className="font-bold">{stack.name}</span>
                                                 <span className="ml-2 text-xs text-gray-400 font-normal border border-gray-200 px-1.5 rounded bg-gray-50">模版堆栈</span>
                                             </div>
                                             {selection?.type === 'stack' && selection.stackId === stack.id && <Check className="w-4 h-4" />}
                                         </button>
                                     </div>

                                     {/* Templates (Indented) */}
                                     <div className="mt-1 space-y-0.5 relative">
                                         <div className="absolute left-6 top-0 bottom-2 w-px bg-gray-200"></div>
                                         {stack.templates.map((tmpl, idx) => {
                                             const isSelected = selection?.type === 'template' && selection.templateId === tmpl.id;
                                             return (
                                                 <button
                                                    key={tmpl.id}
                                                    onClick={() => handleSelectTemplate(stack.id, tmpl.id)}
                                                    className={`w-[calc(100%-16px)] ml-4 text-left pl-6 pr-3 py-2 rounded-md flex items-center justify-between text-sm transition-colors relative ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                                                 >
                                                     <div className="absolute left-2 top-1/2 -mt-px w-3 h-px bg-gray-200"></div>
                                                     <div className="flex items-center truncate">
                                                         <span className={`text-[10px] font-mono mr-2 px-1 rounded ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500'}`}>P{idx+1}</span>
                                                         <span className="truncate">{tmpl.name}</span>
                                                     </div>
                                                     {isSelected && <Check className="w-3.5 h-3.5" />}
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Divider */}
            <div className="w-px bg-gray-200 self-stretch my-1"></div>

            {/* 3. Dynamic Context Information Panel (Keep existing logic) */}
            <div className="flex-1 flex flex-col justify-center">
                {selection?.type === 'stack' && activeStack && (
                    <div className="flex items-start gap-8 animate-in fade-in slide-in-from-left-2 duration-200">
                         <div className="flex-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                                 <Box className="w-3.5 h-3.5 mr-1.5" />
                                 模版构成
                             </label>
                             <div className="flex items-center overflow-x-auto scrollbar-hide space-x-2 pb-1">
                                {activeStack.templates.map((tmpl, idx) => (
                                    <React.Fragment key={tmpl.id}>
                                        <div 
                                            className="flex items-center px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 whitespace-nowrap"
                                            title={tmpl.description}
                                        >
                                            <span className="font-mono bg-gray-200 text-gray-600 px-1 rounded mr-2 text-[10px]">P{idx+1}</span>
                                            {tmpl.name}
                                        </div>
                                        {idx < activeStack.templates.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />}
                                    </React.Fragment>
                                ))}
                             </div>
                         </div>
                         <div className="w-[300px] border-l border-gray-100 pl-6">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                                 <Monitor className="w-3.5 h-3.5 mr-1.5" />
                                 生效设备
                             </label>
                             <div className="flex flex-wrap gap-1.5">
                                 {resolvedDevices.length > 0 ? resolvedDevices.map(d => (
                                     <span key={d} className="inline-flex items-center text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                                         <Server className="w-3 h-3 mr-1 opacity-50" />
                                         {d}
                                     </span>
                                 )) : <span className="text-xs text-gray-400 italic">无</span>}
                             </div>
                         </div>
                    </div>
                )}
                {selection?.type === 'template' && activeTemplate && activeStack && (
                    <div className="flex items-start gap-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
                         <div className="flex-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                                 <Share2 className="w-3.5 h-3.5 mr-1.5" />
                                 引用来源
                             </label>
                             <div className="flex items-center space-x-2">
                                 <div className="flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 font-medium">
                                     <Layers className="w-3.5 h-3.5 mr-2" />
                                     {activeStack.name}
                                 </div>
                                 <span className="text-xs text-gray-400">
                                     (作为 <strong>P{activeStack.templates.findIndex(t => t.id === activeTemplate.id) + 1}</strong> 参数引用)
                                 </span>
                             </div>
                         </div>
                         <div className="w-[300px] border-l border-gray-100 pl-6">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                                 <Monitor className="w-3.5 h-3.5 mr-1.5" />
                                 影响设备
                             </label>
                             <div className="flex flex-wrap gap-1.5">
                                 {resolvedDevices.length > 0 ? resolvedDevices.map(d => (
                                     <span key={d} className="inline-flex items-center text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                         <Server className="w-3 h-3 mr-1 opacity-50" />
                                         {d}
                                     </span>
                                 )) : <span className="text-xs text-gray-400 italic">无</span>}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Section: Sidebar + Content Split */}
        <div className="flex-1 flex overflow-hidden bg-white">
            {/* Internal Sidebar */}
            <TemplateSidebar 
                activeModule={activeModule}
                onSelectModule={onSelectModule}
                showSystemConfig={showSystemConfig}
                showNetworkConfig={showNetworkConfig}
                className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto pt-2"
            />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 h-full bg-white relative z-0 flex flex-col">
                {/* Module Header */}
                 <div className="px-5 py-2 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-bold text-gray-800 flex items-center">
                        {getModuleIcon()}
                        {getModuleTitle()}
                    </h2>
                    
                    {selection?.type === 'template' ? (
                         <div className="flex items-center space-x-3">
                             <div className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] border border-indigo-100">
                                 <Filter className="w-3 h-3 mr-1" /> 
                                 <span className="mr-1">当前展示:</span>
                                 <span className="font-bold">{activeTemplate?.name}</span>
                                 <span className="ml-2 pl-2 border-l border-indigo-200 text-indigo-500 font-normal">可编辑模式</span>
                             </div>
                             {/* Variable Button for Template View */}
                             <button 
                                onClick={() => onManageVariables && activeTemplate && onManageVariables(activeTemplate.id)}
                                className="flex items-center text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                             >
                                 <Settings2 className="w-3 h-3 mr-1" />
                                 管理变量
                             </button>
                         </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                             <div className="flex items-center text-gray-400 text-[10px] mr-2">
                                 <Layers className="w-3 h-3 mr-1.5" />
                                 <span>当前展示: 全量配置</span>
                             </div>
                             {/* Manage Stack Variables Button */}
                             {selection?.type === 'stack' && onManageStackVariables && (
                                <button 
                                    onClick={() => activeStack && onManageStackVariables(activeStack.id)}
                                    className="flex items-center text-[10px] text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 px-3 py-1 rounded transition-colors shadow-sm"
                                >
                                    <Settings2 className="w-3 h-3 mr-1.5" />
                                    管理变量定义
                                </button>
                             )}
                             {/* Manage Mappings Button */}
                             {selection?.type === 'stack' && onManageVariableMappings && (
                                <button 
                                    onClick={() => activeStack && onManageVariableMappings(activeStack.id)}
                                    className="flex items-center text-[10px] text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded transition-colors shadow-sm"
                                >
                                    <Sliders className="w-3 h-3 mr-1.5" />
                                    变量映射
                                </button>
                             )}
                        </div>
                    )}
                 </div>

                {renderModuleContent()}
            </div>
        </div>

    </div>
  );
};

export default GroupTemplateStatus;
