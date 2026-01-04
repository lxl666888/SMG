
import React, { useState, useMemo, useEffect } from 'react';
import TopNav from './components/TopNav'; // Now acts as Header
import Sidebar from './components/Sidebar';
import MainSidebar from './components/MainSidebar'; // New Vertical Sidebar
import TemplateStackBuilder from './components/TemplateStackBuilder';
import NetworkTable from './components/NetworkTable';
import TemplateSidebar from './components/TemplateSidebar';
import SystemConfigForm from './components/SystemConfigForm';
import DeviceGroupSelector from './components/DeviceGroupSelector';
import AddTemplateModal from './components/AddTemplateModal';
import SubTemplateForm from './components/SubTemplateForm';
import GroupTemplateStatus from './components/GroupTemplateStatus'; 
import PolicyManager from './components/PolicyManager';
import NetworkInitialization from './components/NetworkInitialization'; // Import New Component
import InterfaceFormModal from './components/InterfaceFormModal'; // Import Interface Modal
import ZoneFormModal from './components/ZoneFormModal'; // Import Zone Modal
import CreateStackModal from './components/CreateStackModal'; // Import Create Stack Modal
import ZoneTable from './components/ZoneTable'; // Import Zone Table
import VariableManager from './components/VariableManager'; // Import Variable Manager
import TemplateVariableModal from './components/TemplateVariableModal'; // Import Template Variable Modal
import VirtualWireModal from './components/VirtualWireModal'; // Import VWire Modal
import VirtualLineModal from './components/VirtualLineModal'; // Import VLine Modal
import DdnsModal from './components/DdnsModal'; // Import DDNS Modal
import DhcpModal from './components/DhcpModal'; // Import DHCP Modal
import StaticRouteModal from './components/StaticRouteModal'; // Import Static Route Modal
import VirtualWireTable from './components/VirtualWireTable'; // Import VWire Table
import VirtualLineTable from './components/VirtualLineTable'; // Import VLine Table
import NetworkDns from './components/NetworkDns'; // Import NetworkDns
import NetworkRoutes from './components/NetworkRoutes'; // Import NetworkRoutes
import DhcpTable from './components/DhcpTable'; // Import DhcpTable
import { 
  MOCK_DEVICE_GROUPS, 
  MOCK_STACKS, 
  MOCK_TEMPLATES, 
  MOCK_INTERFACES, 
  MOCK_ZONES, 
  MOCK_VIRTUAL_WIRES, 
  MOCK_VIRTUAL_LINES, 
  MOCK_DNS_CONFIG, 
  MOCK_DDNS_POLICIES, 
  MOCK_DHCP_CONFIGS,
  MOCK_STATIC_ROUTES,
  MOCK_BGP_CONFIG,
  MOCK_BGP_NETWORKS
} from './constants';
import { TemplateStack, Template, DeviceGroup, NetworkInterface, NetworkZone, VariableMapping, TemplateVariable, VirtualWire, VirtualLine, DnsConfig, DdnsPolicy, DhcpConfig, StaticRoute, BgpGlobalConfig, BgpNetwork } from './types';
import { Layers, FileCode, ArrowLeft, Server, Share2, Monitor, Edit3, Settings, LayoutGrid, Settings2 } from 'lucide-react';

interface TabItem {
  key: string;
  title: string;
  type: 'module' | 'stack_editor' | 'template_editor';
  data?: any;
  closable?: boolean;
}

const App: React.FC = () => {
  
  // -- Unified Tabs State --
  // Updated initial state to match the new flattened sidebar structure
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: 'topn', title: 'Top N', type: 'module', closable: false },
    { key: 'policy', title: '策略', type: 'module', closable: false },
    { key: 'network', title: '网络', type: 'module', closable: false },
    { key: 'orchestration', title: '组网编排', type: 'module', closable: false },
    { key: 'operations', title: '防火墙运维', type: 'module', closable: false },
  ]);
  
  const [activeTabKey, setActiveTabKey] = useState<string>('topn');

  // -- Sidebar Selection State (Generic) --
  const [sidebarSelection, setSidebarSelection] = useState<{
      id: string;
      type: 'group' | 'device' | 'stack' | 'template_param';
  }>({ id: 'guangzhou', type: 'group' });
  
  // -- Data State --
  const [allTemplates, setAllTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [allStacks, setAllStacks] = useState<TemplateStack[]>(MOCK_STACKS);
  const [allInterfaces, setAllInterfaces] = useState<NetworkInterface[]>(MOCK_INTERFACES);
  const [allZones, setAllZones] = useState<NetworkZone[]>(MOCK_ZONES);
  const [allVWires, setAllVWires] = useState<VirtualWire[]>(MOCK_VIRTUAL_WIRES);
  const [allVLines, setAllVLines] = useState<VirtualLine[]>(MOCK_VIRTUAL_LINES);
  const [dnsConfig, setDnsConfig] = useState<DnsConfig>(MOCK_DNS_CONFIG);
  const [ddnsPolicies, setDdnsPolicies] = useState<DdnsPolicy[]>(MOCK_DDNS_POLICIES);
  const [dhcpConfigs, setDhcpConfigs] = useState<DhcpConfig[]>(MOCK_DHCP_CONFIGS);
  const [staticRoutes, setStaticRoutes] = useState<StaticRoute[]>(MOCK_STATIC_ROUTES);
  const [bgpGlobal, setBgpGlobal] = useState<BgpGlobalConfig>(MOCK_BGP_CONFIG);
  const [bgpNetworks, setBgpNetworks] = useState<BgpNetwork[]>(MOCK_BGP_NETWORKS);
  
  // Shared Active Module State (e.g. Sidebar selection in Network/System/Editors)
  const [activeModule, setActiveModule] = useState<string>('network_interfaces');
  
  // Stack Editor View State
  const [stackEditorView, setStackEditorView] = useState<'composition' | 'variables'>('composition');

  // -- State for Modals --
  const [isScopeSelectorOpen, setIsScopeSelectorOpen] = useState(false);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  const [isInterfaceModalOpen, setIsInterfaceModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isCreateStackModalOpen, setIsCreateStackModalOpen] = useState(false);
  const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] = useState(false);
  const [isVWireModalOpen, setIsVWireModalOpen] = useState(false);
  const [isVLineModalOpen, setIsVLineModalOpen] = useState(false);
  const [isDdnsModalOpen, setIsDdnsModalOpen] = useState(false);
  const [isDhcpModalOpen, setIsDhcpModalOpen] = useState(false);
  const [isStaticRouteModalOpen, setIsStaticRouteModalOpen] = useState(false);

  // -- Editing State --
  const [editingStackId, setEditingStackId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null); 
  
  // New: Interface Editing State
  const [editingInterface, setEditingInterface] = useState<NetworkInterface | null>(null);
  const [interfaceCategoryToAdd, setInterfaceCategoryToAdd] = useState<'physical' | 'sub' | 'vlan' | 'aggregate' | 'loopback' | 'tunnel'>('physical');
  const [interfaceTargetTemplateId, setInterfaceTargetTemplateId] = useState<string | null>(null);

  // New: Zone Editing State
  const [editingZone, setEditingZone] = useState<NetworkZone | null>(null);

  // New: VWire/VLine Editing State
  const [editingVWire, setEditingVWire] = useState<VirtualWire | null>(null);
  const [editingVLine, setEditingVLine] = useState<VirtualLine | null>(null);

  // New: DDNS Editing State
  const [editingDdnsPolicy, setEditingDdnsPolicy] = useState<DdnsPolicy | null>(null);

  // New: DHCP Editing State
  const [editingDhcpConfig, setEditingDhcpConfig] = useState<DhcpConfig | null>(null);

  // New: Static Route Editing State
  const [editingStaticRoute, setEditingStaticRoute] = useState<StaticRoute | null>(null);

  // -- Initialization / Onboarding State --
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [hasSkippedOnboarding, setHasSkippedOnboarding] = useState<boolean>(false);

  // -- Effects --
  useEffect(() => {
     if (activeTabKey === 'network' || activeTabKey.startsWith('stack-') || activeTabKey.startsWith('tmpl-')) {
          if (activeModule.startsWith('system_')) setActiveModule('network_interfaces');
      }
      
      // Auto-trigger onboarding if no stacks exist and we are in network tab, AND user hasn't skipped it
      if (activeTabKey === 'network' && allStacks.length === 0 && onboardingStep === 0 && !hasSkippedOnboarding) {
          setOnboardingStep(1);
      }
  }, [activeTabKey, allStacks.length, onboardingStep, activeModule, hasSkippedOnboarding]);

  // Reset preview selection when switching stacks
  useEffect(() => {
      if (sidebarSelection.type === 'stack') {
          setPreviewTemplateId(null);
          setStackEditorView('composition'); // Reset view mode
      }
  }, [sidebarSelection.id, sidebarSelection.type]);


  // -- Helpers --
  const getSelectedNodeName = () => {
      if (sidebarSelection.type === 'stack') {
          return allStacks.find(s => s.id === sidebarSelection.id)?.name || sidebarSelection.id;
      }
      if (sidebarSelection.type === 'template_param') {
          return allTemplates.find(t => t.id === sidebarSelection.id)?.name || sidebarSelection.id;
      }

      const queue = [...MOCK_DEVICE_GROUPS];
      while(queue.length > 0) {
          const node = queue.shift();
          if (node?.id === sidebarSelection.id) return node.name;
          if (node?.children) queue.push(...node.children);
      }
      return sidebarSelection.id;
  };

  const getSubtreeGroupNames = (rootId: string): string[] => {
        const result: string[] = [];
        const findNode = (nodes: DeviceGroup[]): DeviceGroup | null => {
            for(const node of nodes) {
                if (node.id === rootId) return node;
                if (node.children) {
                    const found = findNode(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const rootNode = findNode(MOCK_DEVICE_GROUPS);
        if (!rootNode) return [];
        const traverse = (node: DeviceGroup) => {
             if (node.type === 'group') result.push(node.name);
             if (node.children) node.children.forEach(traverse);
        };
        traverse(rootNode);
        return result;
  };

  const currentContextStacks = useMemo(() => {
    if (sidebarSelection.type === 'stack' || sidebarSelection.type === 'template_param') return [];

    const findParentGroupName = (targetId: string, groups: DeviceGroup[]): string | null => {
        for (const group of groups) {
            if (group.children) {
                if (group.children.some(c => c.id === targetId)) return group.name;
                const found = findParentGroupName(targetId, group.children);
                if (found) return found;
            }
        }
        return null;
    };

    let targetGroupNames: string[] = [];
    if (sidebarSelection.type === 'group') {
        targetGroupNames = getSubtreeGroupNames(sidebarSelection.id);
    } else {
        const p = findParentGroupName(sidebarSelection.id, MOCK_DEVICE_GROUPS);
        if (p) targetGroupNames = [p];
    }

    return allStacks.filter(stack => 
        stack.assignedDeviceGroups.some(g => targetGroupNames.includes(g))
    );
  }, [sidebarSelection, allStacks]);


  // -- Handlers --

  const handleSidebarSelect = (id: string, type: 'group' | 'device' | 'stack' | 'template_param') => {
      setSidebarSelection({ id, type });
      if (activeTabKey === 'operations') setActiveModule('system_general'); // Reset module if needed
      else setActiveModule('network_interfaces');
  };

  const handleCreateTemplate = () => setIsCreatingNewTemplate(true);
  
  const handleCreateStackLogic = (name: string, templateToAutoAdd?: Template) => {
      const newStack: TemplateStack = {
          id: `stack-${Date.now()}`,
          name: name,
          description: 'Created via Initialization Wizard',
          templates: templateToAutoAdd ? [templateToAutoAdd] : [],
          assignedDeviceGroups: [],
          variableMappings: [] // Initialize mappings
      };
      setAllStacks(prev => [...prev, newStack]);
      return newStack;
  };

  const handleCreateStack = () => {
      // Manual creation from sidebar (not wizard)
      setIsCreateStackModalOpen(true);
  };

  const handleSaveNewStack = (name: string, description: string, selectedTemplateIds: string[], selectedDeviceIds: string[]) => {
      const templates = allTemplates.filter(t => selectedTemplateIds.includes(t.id));
      const newStack: TemplateStack = {
          id: `stack-${Date.now()}`,
          name,
          description,
          templates,
          assignedDeviceGroups: selectedDeviceIds,
          variableMappings: []
      };
      setAllStacks(prev => [...prev, newStack]);
      setIsCreateStackModalOpen(false);
      setSidebarSelection({ id: newStack.id, type: 'stack' });
  };

  // Interface Handlers
  const handleAddInterface = (category: 'physical' | 'sub' | 'vlan' | 'aggregate' | 'loopback' | 'tunnel' = 'physical', templateId?: string) => {
      setEditingInterface(null); 
      setInterfaceCategoryToAdd(category);
      setInterfaceTargetTemplateId(templateId || null);
      setIsInterfaceModalOpen(true);
  };

  const handleEditInterface = (iface: NetworkInterface, templateId?: string) => {
      setEditingInterface(iface);
      setInterfaceCategoryToAdd(iface.category);
      setInterfaceTargetTemplateId(templateId || null);
      setIsInterfaceModalOpen(true);
  };

  // Improved handleSaveInterface with Variable Syncing
  const handleSaveInterface = (data: Partial<NetworkInterface>) => {
      // Determine the context ID: Explicit target > Current Param selection > Existing Interface Source > Local
      let targetId = 'local';
      
      if (interfaceTargetTemplateId) {
          targetId = interfaceTargetTemplateId;
      } else if (sidebarSelection.type === 'template_param') {
          targetId = sidebarSelection.id;
      } else if (editingInterface && editingInterface.sourceTemplateId && editingInterface.sourceTemplateId !== 'local') {
          // Fallback: Use the interface's original template if we are editing and context is missing
          targetId = editingInterface.sourceTemplateId;
      }

      let finalInterface: NetworkInterface;

      if (editingInterface) {
          // Edit Mode
          finalInterface = { 
              ...editingInterface, 
              ...data,
              // Ensure source is correct if we are in a template context
              sourceTemplateId: targetId
          } as NetworkInterface;
          setAllInterfaces(prev => prev.map(i => i.id === editingInterface.id ? finalInterface : i));
      } else {
          // Add Mode
          finalInterface = {
            id: `eth-${Date.now()}`,
            name: data.name || `eth-new`,
            status: data.status || 'down',
            isWan: data.isWan || false,
            category: interfaceCategoryToAdd,
            type: (data.type as any) || 'L3',
            zone: data.zone || 'Untrust',
            virtualSystem: data.virtualSystem || 'public',
            connectionType: data.connectionType || 'Static',
            ip: data.ip || '-',
            gateway: data.gateway || '', // Add gateway
            mode: data.mode || 'Auto',
            mtu: '1500',
            sourceTemplateId: targetId,
            ...data
        } as NetworkInterface;
        setAllInterfaces(prev => [...prev, finalInterface]);
      }

      // --- Logic to Sync Variables to Template Definition ---
      // If we are editing ANY template (either via param view or stack view), sync variables
      if (targetId !== 'local') {
          const varsFound: Set<string> = new Set();
          
          const checkAndAdd = (val?: string) => {
              if (val) {
                  // Remove all spaces to handle cases like "$ 1" -> "$1"
                  const cleanedVal = val.replace(/\s/g, '');
                  if (cleanedVal.startsWith('$')) {
                      varsFound.add(cleanedVal);
                  }
              }
          };

          checkAndAdd(finalInterface.ip);
          checkAndAdd(finalInterface.gateway);

          if (varsFound.size > 0) {
              setAllTemplates(prevTemplates => prevTemplates.map(tmpl => {
                  if (tmpl.id === targetId) {
                      const existingVars = tmpl.variables || [];
                      const newVars = [...existingVars];
                      let hasChanges = false;

                      varsFound.forEach(vName => {
                          // Only add if it doesn't exist
                          if (!existingVars.some(ev => ev.name === vName)) {
                              newVars.push({
                                  name: vName,
                                  type: 'IP Netmask', // Default type guess
                                  description: `自动关联自接口: ${finalInterface.name}`,
                                  defaultValue: ''
                              });
                              hasChanges = true;
                          }
                      });

                      if (hasChanges) {
                          return { ...tmpl, variables: newVars };
                      }
                  }
                  return tmpl;
              }));
          }
      }
      // ----------------------------------------------------

      setIsInterfaceModalOpen(false);
      setEditingInterface(null);
      setInterfaceTargetTemplateId(null);
  };

  // Zone Handlers
  const handleAddZone = () => {
      setEditingZone(null);
      setIsZoneModalOpen(true);
  };

  const handleEditZone = (zone: NetworkZone) => {
      setEditingZone(zone);
      setIsZoneModalOpen(true);
  };

  const handleSaveZone = (data: Partial<NetworkZone>) => {
      if (editingZone) {
          setAllZones(prev => prev.map(z => z.id === editingZone.id ? { ...z, ...data } as NetworkZone : z));
      } else {
          const newZone: NetworkZone = {
              id: `zone-${Date.now()}`,
              name: data.name || 'New_Zone',
              type: data.type || 'L3',
              interfaces: data.interfaces || []
          };
          setAllZones(prev => [...prev, newZone]);
      }
      setIsZoneModalOpen(false);
      setEditingZone(null);
  };

  const handleDeleteZone = (id: string) => {
      if (window.confirm('确定要删除该区域吗？')) {
          setAllZones(prev => prev.filter(z => z.id !== id));
      }
  };

  // VWire Handlers
  const handleAddVWire = () => {
      setEditingVWire(null);
      setIsVWireModalOpen(true);
  };
  const handleEditVWire = (vw: VirtualWire) => {
      setEditingVWire(vw);
      setIsVWireModalOpen(true);
  };
  const handleSaveVWire = (data: Partial<VirtualWire>) => {
      if (editingVWire) {
          setAllVWires(prev => prev.map(vw => vw.id === editingVWire.id ? { ...vw, ...data } as VirtualWire : vw));
      } else {
          const newVWire: VirtualWire = {
              id: `vw-${Date.now()}`,
              name: data.name || 'VW_New',
              interface1: data.interface1 || '',
              interface2: data.interface2 || '',
              description: data.description
          };
          setAllVWires(prev => [...prev, newVWire]);
      }
      setIsVWireModalOpen(false);
      setEditingVWire(null);
  };
  const handleDeleteVWire = (id: string) => {
      if (window.confirm('确定要删除该虚拟网线吗？')) {
          setAllVWires(prev => prev.filter(vw => vw.id !== id));
      }
  };

  // VLine Handlers
  const handleAddVLine = () => {
      setEditingVLine(null);
      setIsVLineModalOpen(true);
  };
  const handleEditVLine = (vl: VirtualLine) => {
      setEditingVLine(vl);
      setIsVLineModalOpen(true);
  };
  const handleSaveVLine = (data: Partial<VirtualLine>) => {
      if (editingVLine) {
          setAllVLines(prev => prev.map(vl => vl.id === editingVLine.id ? { ...vl, ...data } as VirtualLine : vl));
      } else {
          const newVLine: VirtualLine = {
              id: `vl-${Date.now()}`,
              name: data.name || 'VL_New',
              outboundInterface: data.outboundInterface || '',
              uplink: data.uplink || '0 Kbps',
              downlink: data.downlink || '0 Kbps'
          };
          setAllVLines(prev => [...prev, newVLine]);
      }
      setIsVLineModalOpen(false);
      setEditingVLine(null);
  };
  const handleDeleteVLine = (id: string) => {
      if (window.confirm('确定要删除该虚拟线路吗？')) {
          setAllVLines(prev => prev.filter(vl => vl.id !== id));
      }
  };

  // DDNS Handlers
  const handleSaveDns = (config: DnsConfig) => {
      setDnsConfig(config);
      // Removed alert as per refined requirements to avoid interruption or just keep UI clean
  };

  const handleAddDdns = () => {
      setEditingDdnsPolicy(null);
      setIsDdnsModalOpen(true);
  };

  const handleEditDdns = (policy: DdnsPolicy) => {
      setEditingDdnsPolicy(policy);
      setIsDdnsModalOpen(true);
  };

  const handleSaveDdns = (data: Partial<DdnsPolicy>) => {
      if (editingDdnsPolicy) {
          setDdnsPolicies(prev => prev.map(p => p.id === editingDdnsPolicy.id ? { ...p, ...data } as DdnsPolicy : p));
      } else {
          const newPolicy: DdnsPolicy = {
              id: `ddns-${Date.now()}`,
              name: data.name || 'New Policy',
              status: data.status || 'enabled',
              description: data.description,
              provider: data.provider || 'DynDNS',
              domain: data.domain || '',
              username: data.username,
              password: data.password,
              interface: data.interface || '',
              updateInterval: data.updateInterval || 24,
              retryInterval: data.retryInterval || 10,
              lastUpdateResult: '未更新',
              lastUpdateTime: '-'
          };
          setDdnsPolicies(prev => [...prev, newPolicy]);
      }
      setIsDdnsModalOpen(false);
      setEditingDdnsPolicy(null);
  };

  const handleDeleteDdns = (id: string) => {
      if (window.confirm('确定要删除该DDNS策略吗？')) {
          setDdnsPolicies(prev => prev.filter(p => p.id !== id));
      }
  };

  // DHCP Handlers
  const handleAddDhcp = () => {
      setEditingDhcpConfig(null);
      setIsDhcpModalOpen(true);
  };

  const handleEditDhcp = (config: DhcpConfig) => {
      setEditingDhcpConfig(config);
      setIsDhcpModalOpen(true);
  };

  const handleSaveDhcp = (data: Partial<DhcpConfig>) => {
      if (editingDhcpConfig) {
          setDhcpConfigs(prev => prev.map(c => c.id === editingDhcpConfig.id ? { ...c, ...data } as DhcpConfig : c));
      } else {
          const newConfig: DhcpConfig = {
              id: `dhcp-${Date.now()}`,
              name: data.name || 'New DHCP',
              status: data.status || 'enabled',
              interface: data.interface || '',
              type: data.type || 'Server',
              ipRange: data.ipRange,
              netmask: data.netmask,
              gateway: data.gateway,
              dnsType: data.dnsType || 'system',
              primaryDns: data.primaryDns,
              secondaryDns: data.secondaryDns,
              leaseTime: data.leaseTime
          };
          setDhcpConfigs(prev => [...prev, newConfig]);
      }
      setIsDhcpModalOpen(false);
      setEditingDhcpConfig(null);
  };

  const handleDeleteDhcp = (id: string) => {
      if (window.confirm('确定要删除该DHCP服务吗？')) {
          setDhcpConfigs(prev => prev.filter(c => c.id !== id));
      }
  };

  // Static Route Handlers
  const handleAddStaticRoute = () => {
      setEditingStaticRoute(null);
      setIsStaticRouteModalOpen(true);
  };

  const handleEditStaticRoute = (route: StaticRoute) => {
      setEditingStaticRoute(route);
      setIsStaticRouteModalOpen(true);
  };

  const handleSaveStaticRoute = (data: Partial<StaticRoute>) => {
      if (editingStaticRoute) {
          setStaticRoutes(prev => prev.map(r => r.id === editingStaticRoute.id ? { ...r, ...data } as StaticRoute : r));
      } else {
          const newRoute: StaticRoute = {
              id: `route-${Date.now()}`,
              ipVersion: data.ipVersion || 'IPv4',
              destination: data.destination || '',
              interface: data.interface || '',
              nextHop: data.nextHop,
              distance: data.distance || 1,
              metric: data.metric || 0,
              status: data.status || 'enabled',
              description: data.description,
              reliabilityDetection: data.reliabilityDetection || false,
              sourceTemplateId: sidebarSelection.type === 'template_param' ? sidebarSelection.id : 'local'
          };
          setStaticRoutes(prev => [...prev, newRoute]);
      }
      setIsStaticRouteModalOpen(false);
      setEditingStaticRoute(null);
  };

  const handleDeleteStaticRoute = (id: string) => {
      if (window.confirm('确定要删除该静态路由吗？')) {
          setStaticRoutes(prev => prev.filter(r => r.id !== id));
      }
  };

  // BGP Handlers
  const handleSaveBgpGlobal = (config: BgpGlobalConfig) => {
      setBgpGlobal(config);
  };

  const handleAddBgpNetwork = (network: string) => {
      const newNet: BgpNetwork = {
          id: `bgp-net-${Date.now()}`,
          network,
          sourceTemplateId: sidebarSelection.type === 'template_param' ? sidebarSelection.id : 'local'
      };
      setBgpNetworks(prev => [...prev, newNet]);
  };

  const handleDeleteBgpNetwork = (id: string) => {
      if (window.confirm('确定要删除该网段吗？')) {
          setBgpNetworks(prev => prev.filter(n => n.id !== id));
      }
  };

  const handleSaveVariableMappings = (stackId: string, newMappings: VariableMapping[]) => {
      setAllStacks(prev => prev.map(s => 
          s.id === stackId ? { ...s, variableMappings: newMappings } : s
      ));
  };

  const handleManageVariables = (templateId: string) => {
      setEditingTemplateId(templateId);
      setIsTemplateVariableModalOpen(true);
  };

  const handleSaveTemplateVariables = (variables: TemplateVariable[]) => {
      if (editingTemplateId) {
          setAllTemplates(prev => prev.map(t => 
              t.id === editingTemplateId ? { ...t, variables } : t
          ));
          setIsTemplateVariableModalOpen(false);
          setEditingTemplateId(null);
      }
  };

  // -- Tab Management --
  const closeTab = (key: string) => {
      const newTabs = tabs.filter(t => t.key !== key);
      setTabs(newTabs);
      if (activeTabKey === key) {
          const idx = tabs.findIndex(t => t.key === key);
          const nextTab = newTabs[Math.max(0, idx - 1)];
          setActiveTabKey(nextTab ? nextTab.key : 'network');
      }
  };

  const activateTab = (key: string) => setActiveTabKey(key);

  const handleEditFromPreview = (type: 'stack' | 'template', id: string) => {
      let title = '编辑';
      let key = '';
      let tabType: TabItem['type'] = 'stack_editor';
      let data: any = {};

      if (type === 'stack') {
          const stack = allStacks.find(s => s.id === id);
          if (!stack) return;
          title = `${stack.name}`;
          key = `stack-${id}`;
          tabType = 'stack_editor';
          data = { stackId: id };
      } else {
          const tmpl = allTemplates.find(t => t.id === id);
          if (!tmpl) return;
          title = `${tmpl.name}`;
          key = `tmpl-${id}`;
          tabType = 'template_editor';
          data = { templateId: id };
      }

      const existing = tabs.find(t => t.key === key);
      if (existing) {
          setActiveTabKey(key);
      } else {
          setTabs(prev => [...prev, { key, title, type: tabType, data, closable: true }]);
          setActiveTabKey(key);
      }
  };
  
  const handleAddTemplateToStack = (template: Template) => {
      if (!editingStackId) return;
      
      setAllStacks(prev => prev.map(stack => {
          if (stack.id === editingStackId) {
              return {
                  ...stack,
                  templates: [template, ...stack.templates]
              };
          }
          return stack;
      }));
      setIsAddTemplateModalOpen(false);
      setEditingStackId(null);
  };

  // -- Render Logic --

  // Special Renderer for Template Parameter View
  const renderTemplateParameterDetail = (templateId: string) => {
      const tmpl = allTemplates.find(t => t.id === templateId);
      if (!tmpl) return <div className="p-10 text-gray-400 text-center">模版参数不存在</div>;

      const referencedStacks = allStacks.filter(s => s.templates.some(t => t.id === tmpl.id));
      const associatedDevices = Array.from(new Set(referencedStacks.flatMap(s => s.assignedDeviceGroups)));

      const filteredInterfaces = allInterfaces.filter(i => i.sourceTemplateId === tmpl.id);
      const filteredRoutes = staticRoutes.filter(r => r.sourceTemplateId === tmpl.id);
      const filteredBgpNetworks = bgpNetworks.filter(n => n.sourceTemplateId === tmpl.id);

      return (
          <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
             <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 flex items-start gap-8 min-h-[90px]">
                 <div className="w-[300px]">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                          <FileCode className="w-3.5 h-3.5 mr-1.5" />
                          模版参数 (Template Parameter)
                      </label>
                      <div className="flex items-center">
                          <h2 className="text-lg font-bold text-gray-800 mr-3">{tmpl.name}</h2>
                          <div className="flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <FileCode className="w-3 h-3 mr-1" /> 参数
                          </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tmpl.description}</p>
                 </div>
                 <div className="w-px bg-gray-200 self-stretch my-1"></div>
                 <div className="flex-1 flex items-start gap-8">
                      <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                 <Share2 className="w-3.5 h-3.5 mr-1.5" />
                                 被哪些模版引用 (Referenced By)
                          </label>
                          <div className="flex flex-wrap gap-2">
                                {referencedStacks.length > 0 ? referencedStacks.map(s => (
                                    <div key={s.id} className="flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 font-medium">
                                        <Layers className="w-3 h-3 mr-1.5" />
                                        {s.name}
                                    </div>
                                )) : <span className="text-xs text-gray-400 italic">暂无引用</span>}
                          </div>
                      </div>
                      <div className="w-[260px] border-l border-gray-100 pl-6">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                 <Monitor className="w-3.5 h-3.5 mr-1.5" />
                                 关联设备 (Devices)
                           </label>
                           <div className="flex flex-wrap gap-1.5">
                                 {associatedDevices.length > 0 ? associatedDevices.map(d => (
                                     <span key={d} className="inline-flex items-center text-[11px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                         <Server className="w-3 h-3 mr-1 opacity-50" />
                                         {d}
                                     </span>
                                 )) : <span className="text-xs text-gray-400 italic">无</span>}
                           </div>
                      </div>
                 </div>
             </div>

             <div className="flex-1 flex overflow-hidden">
                 <TemplateSidebar activeModule={activeModule} onSelectModule={setActiveModule} />
                 <div className="flex-1 flex flex-col overflow-hidden relative">
                       <div className="px-6 py-2 border-b border-gray-100 bg-indigo-50/30 flex items-center justify-between text-xs text-indigo-800">
                           <div className="flex items-center font-medium">
                               <Edit3 className="w-3.5 h-3.5 mr-2" />
                               正在编辑模版参数: {tmpl.name}
                           </div>
                           
                           <div className="flex items-center space-x-3">
                               <button 
                                    onClick={() => handleManageVariables(tmpl.id)}
                                    className="flex items-center text-[10px] text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 px-3 py-1 rounded transition-colors shadow-sm"
                               >
                                    <Settings2 className="w-3 h-3 mr-1.5" />
                                    管理变量定义
                               </button>
                               <span className="opacity-70 border-l border-indigo-200 pl-3">修改此参数将影响所有引用</span>
                           </div>
                       </div>

                       {activeModule === 'network_interfaces' ? (
                           <NetworkTable 
                                data={filteredInterfaces} 
                                activeTemplateId={tmpl.id} 
                                showAssociatedDevices={false} 
                                isEditable={true}
                                onAdd={handleAddInterface}
                                onEdit={handleEditInterface}
                                onDelete={(id) => setAllInterfaces(prev => prev.filter(i => i.id !== id))}
                            />
                       ) : activeModule === 'network_zones' ? (
                           <div className="h-full flex flex-col bg-white">
                                <ZoneTable
                                    data={allZones}
                                    onAdd={() => handleAddZone()}
                                    onEdit={(zone) => handleEditZone(zone)}
                                    onDelete={(id) => handleDeleteZone(id)}
                                />
                           </div>
                       ) : activeModule === 'network_vwire' ? (
                           <div className="h-full flex flex-col bg-white">
                                <VirtualWireTable
                                    data={allVWires}
                                    onAdd={() => handleAddVWire()}
                                    onEdit={(vw) => handleEditVWire(vw)}
                                    onDelete={(id) => handleDeleteVWire(id)}
                                />
                           </div>
                       ) : activeModule === 'network_vlist' ? (
                           <div className="h-full flex flex-col bg-white">
                                <VirtualLineTable
                                    data={allVLines}
                                    onAdd={() => handleAddVLine()}
                                    onEdit={(vl) => handleEditVLine(vl)}
                                    onDelete={(id) => handleDeleteVLine(id)}
                                />
                           </div>
                       ) : activeModule === 'network_routes' ? (
                           <div className="h-full flex flex-col bg-white">
                                <NetworkRoutes 
                                    staticRoutes={filteredRoutes}
                                    bgpGlobal={bgpGlobal}
                                    bgpNetworks={filteredBgpNetworks}
                                    interfaces={allInterfaces}
                                    isEditable={true}
                                    onAddStaticRoute={handleAddStaticRoute}
                                    onEditStaticRoute={handleEditStaticRoute}
                                    onDeleteStaticRoute={handleDeleteStaticRoute}
                                    onSaveBgpGlobal={handleSaveBgpGlobal}
                                    onAddBgpNetwork={handleAddBgpNetwork}
                                    onDeleteBgpNetwork={handleDeleteBgpNetwork}
                                />
                           </div>
                       ) : activeModule === 'network_dns' ? (
                           <div className="h-full flex flex-col bg-white">
                                <NetworkDns 
                                    dnsConfig={dnsConfig}
                                    ddnsPolicies={ddnsPolicies}
                                    isEditable={true}
                                    onSaveDns={(cfg) => setDnsConfig(cfg)}
                                    onAddDdns={() => {
                                        setEditingDdnsPolicy(null);
                                        setIsDdnsModalOpen(true);
                                    }}
                                    onEditDdns={(policy) => {
                                        setEditingDdnsPolicy(policy);
                                        setIsDdnsModalOpen(true);
                                    }}
                                    onDeleteDdns={(id) => {
                                        if (window.confirm('确定要删除该DDNS策略吗？')) {
                                            setDdnsPolicies(prev => prev.filter(p => p.id !== id));
                                        }
                                    }}
                                />
                           </div>
                       ) : activeModule === 'network_dhcp' ? (
                           <div className="h-full flex flex-col bg-white">
                                <DhcpTable
                                    data={dhcpConfigs}
                                    onAdd={handleAddDhcp}
                                    onEdit={handleEditDhcp}
                                    onDelete={handleDeleteDhcp}
                                />
                           </div>
                       ) : activeModule === 'system_general' ? (
                           <SystemConfigForm />
                       ) : (
                           <div className="flex items-center justify-center h-full text-gray-400">Module: {activeModule}</div>
                       )}
                 </div>
             </div>
          </div>
      );
  };

  // Stack View in Sidebar (Interactive)
  const renderStackView = (stackId: string) => {
      const stack = allStacks.find(s => s.id === stackId);
      if (!stack) return <div className="p-10 text-gray-400 text-center">模版不存在</div>;

      return (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
              <div className="flex-shrink-0 z-10 shadow-sm relative border-b border-gray-200">
                  <TemplateStackBuilder 
                      stack={stack}
                      selectedTemplateId={previewTemplateId} 
                      activeView={stackEditorView}
                      onViewChange={setStackEditorView}
                      onSelectTemplate={(id) => setPreviewTemplateId(id)} 
                      onAddTemplate={() => {
                          setEditingStackId(stack.id);
                          setIsAddTemplateModalOpen(true);
                      }} 
                      onRemoveTemplate={(id) => {
                           setAllStacks(prev => prev.map(s => 
                               s.id === stack.id ? { ...s, templates: s.templates.filter(t => t.id !== id) } : s
                           ));
                           if (previewTemplateId === id) setPreviewTemplateId(null);
                      }}
                      onUpdateName={(name) => {
                           setAllStacks(prev => prev.map(s => 
                               s.id === stack.id ? { ...s, name: name } : s
                           ));
                      }}
                      onBack={() => {}} 
                      onOpenScopeSelector={() => {
                          setSidebarSelection({id: stack.id, type: 'stack'});
                          setIsScopeSelectorOpen(true);
                      }}
                      onReorderTemplates={(newTemplates) => {
                           setAllStacks(prev => prev.map(s => 
                               s.id === stack.id ? { ...s, templates: newTemplates } : s
                           ));
                      }}
                      readOnly={false} 
                  />
              </div>
              
              <div className="flex-1 flex min-h-0 bg-white">
                   {stackEditorView === 'variables' ? (
                       <div className="w-full h-full">
                           <VariableManager 
                                stack={stack}
                                allTemplates={allTemplates}
                                onSave={(newMappings) => handleSaveVariableMappings(stack.id, newMappings)}
                           />
                       </div>
                   ) : (
                       <>
                           <TemplateSidebar activeModule={activeModule} onSelectModule={setActiveModule} />
                           <div className="flex-1 flex flex-col overflow-hidden">
                               <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                                   <span>预览模式 (实时预览生效结果)</span>
                               </div>
                               {activeModule === 'network_interfaces' ? (
                                   <NetworkTable 
                                        data={allInterfaces} 
                                        activeTemplateId={previewTemplateId} 
                                        showAssociatedDevices={false} 
                                        stacks={[stack]}
                                        stackTemplates={stack.templates}
                                   />
                               ) : activeModule === 'system_general' ? (
                                   <SystemConfigForm isPreview={true} />
                               ) : activeModule === 'network_dns' ? (
                                   <div className="h-full w-full">
                                       <NetworkDns 
                                            dnsConfig={dnsConfig}
                                            ddnsPolicies={ddnsPolicies}
                                            isEditable={false} // Stack view is preview only
                                            onSaveDns={() => {}}
                                            onAddDdns={() => {}}
                                            onEditDdns={() => {}}
                                            onDeleteDdns={() => {}}
                                       />
                                   </div>
                               ) : activeModule === 'network_dhcp' ? (
                                   <div className="h-full w-full">
                                       <DhcpTable 
                                            data={dhcpConfigs}
                                            onAdd={() => {}}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                       />
                                   </div>
                               ) : activeModule === 'network_routes' ? (
                                   <div className="h-full w-full">
                                       <NetworkRoutes 
                                            staticRoutes={staticRoutes}
                                            bgpGlobal={bgpGlobal}
                                            bgpNetworks={bgpNetworks}
                                            interfaces={allInterfaces}
                                            isEditable={false}
                                            onAddStaticRoute={() => {}}
                                            onEditStaticRoute={() => {}}
                                            onDeleteStaticRoute={() => {}}
                                            onSaveBgpGlobal={() => {}}
                                            onAddBgpNetwork={() => {}}
                                            onDeleteBgpNetwork={() => {}}
                                       />
                                   </div>
                               ) : (
                                   <div className="flex items-center justify-center h-full text-gray-400">Module: {activeModule}</div>
                               )}
                           </div>
                       </>
                   )}
              </div>
          </div>
      );
  };

  // 1. Module Renderer
  const renderModule = (moduleKey: string) => {
      // Determine if this module should show the secondary sidebar
      const showSidebar = moduleKey === 'network' || moduleKey === 'policy' || moduleKey === 'objects';

      if (!showSidebar) {
           if (moduleKey === 'topn') return <div className="p-10 text-center text-gray-500">Top N 流量监控视图</div>;
           
           if (moduleKey === 'central_mgmt' || moduleKey === 'orchestration') return (
               <div className="flex flex-col items-center justify-center h-full text-gray-500">
                   <LayoutGrid className="w-16 h-16 mb-4 text-gray-300" />
                   <h3 className="text-lg font-medium">组网编排中心</h3>
                   <p className="text-sm text-gray-400 mt-2">可视化编排全网拓扑与连接策略</p>
               </div>
           );
           
           if (moduleKey === 'system' || moduleKey === 'operations') return (
               <div className="flex flex-col items-center justify-center h-full text-gray-500">
                   <Settings className="w-16 h-16 mb-4 text-gray-300" />
                   <h3 className="text-lg font-medium">防火墙运维中心</h3>
                   <p className="text-sm text-gray-400 mt-2">设备升级、日志审计、状态监控与系统设置</p>
                   
                   {/* Hidden Debug Button to Reset Stacks for Demo */}
                   <button 
                      onClick={() => { setAllStacks([]); setOnboardingStep(0); setHasSkippedOnboarding(false); setActiveTabKey('network'); }}
                      className="mt-8 px-4 py-2 bg-gray-200 text-gray-500 rounded text-xs hover:bg-red-50 hover:text-red-500"
                   >
                       [DEBUG] 清空堆栈并触发引导
                   </button>
               </div>
           );
           
           return <div className="flex items-center justify-center h-full text-gray-400">功能模块: {moduleKey}</div>;
      }

      // Check for Initialization State (Onboarding)
      if (moduleKey === 'network' && onboardingStep > 0) {
          return (
             <NetworkInitialization 
                 step={onboardingStep}
                 onCreateTemplate={() => {
                     // Open Modal
                     setIsCreatingNewTemplate(true);
                 }}
                 onCreateStack={(name) => {
                     // Create stack and auto-assign the latest template if available
                     const latestTemplate = allTemplates.length > 0 ? allTemplates[allTemplates.length - 1] : undefined;
                     const newStack = handleCreateStackLogic(name, latestTemplate);
                     setOnboardingStep(3);
                     setSidebarSelection({ id: newStack.id, type: 'stack' });
                 }}
                 onAssignDevices={() => {
                     // Open Device Selector for the newly created stack
                     if (sidebarSelection.type === 'stack') {
                         setIsScopeSelectorOpen(true);
                     }
                 }}
                 onSkip={() => {
                     setHasSkippedOnboarding(true);
                     setOnboardingStep(0);
                 }}
             />
          );
      }

      return (
        <div className="flex-1 flex overflow-hidden h-full">
             <Sidebar 
                key={moduleKey}
                groups={MOCK_DEVICE_GROUPS} 
                stacks={allStacks}
                templates={allTemplates}
                selectedId={sidebarSelection.id}
                onSelect={handleSidebarSelect}
                onCreateStack={handleCreateStack}
                onCreateTemplate={handleCreateTemplate}
                initialViewMode={moduleKey === 'policy' ? 'devices' : 'templates'}
                disableViewSwitcher={moduleKey === 'policy'}
             />
             
             <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
                 {moduleKey === 'policy' ? (
                     <PolicyManager selectedNodeId={sidebarSelection.id} selectedNodeName={getSelectedNodeName()} initialGroup="policy" />
                 ) : moduleKey === 'objects' ? (
                     <PolicyManager selectedNodeId={sidebarSelection.id} selectedNodeName={getSelectedNodeName()} initialGroup="object" />
                 ) : (
                     /* Network View Content */
                     <>
                        {((sidebarSelection.type === 'group' && currentContextStacks.length > 0) || sidebarSelection.type === 'device') && (
                            <div className="bg-white px-6 py-2 border-b border-gray-200 text-xs text-gray-500 flex items-center shrink-0">
                                <span>全部</span>
                                <span className="mx-2">/</span>
                                <span>广东省区域</span>
                                <span className="mx-2">/</span>
                                <span className="text-blue-600 font-medium">
                                    {getSelectedNodeName()}
                                </span>
                            </div>
                        )}

                        {sidebarSelection.type === 'group' ? (
                            <GroupTemplateStatus 
                                groupName={getSelectedNodeName()}
                                appliedStacks={currentContextStacks}
                                configData={allInterfaces}
                                zoneData={allZones}
                                vWireData={allVWires}
                                vLineData={allVLines}
                                dnsConfigData={dnsConfig}
                                ddnsPolicyData={ddnsPolicies}
                                dhcpData={dhcpConfigs}
                                staticRoutes={staticRoutes}
                                bgpGlobal={bgpGlobal}
                                bgpNetworks={bgpNetworks}
                                activeModule={activeModule}
                                onSelectModule={setActiveModule}
                                showNetworkConfig={true}
                                showSystemConfig={false}
                                onEditContext={handleEditFromPreview}
                                onAddInterface={handleAddInterface}
                                onEditInterface={handleEditInterface}
                                onAddZone={handleAddZone}
                                onEditZone={handleEditZone}
                                onDeleteZone={handleDeleteZone}
                                onAddVWire={handleAddVWire}
                                onEditVWire={handleEditVWire}
                                onDeleteVWire={handleDeleteVWire}
                                onAddVLine={handleAddVLine}
                                onEditVLine={handleEditVLine}
                                onDeleteVLine={handleDeleteVLine}
                                onSaveDns={handleSaveDns}
                                onAddDdns={handleAddDdns}
                                onEditDdns={handleEditDdns}
                                onDeleteDdns={handleDeleteDdns}
                                onAddDhcp={handleAddDhcp}
                                onEditDhcp={handleEditDhcp}
                                onDeleteDhcp={handleDeleteDhcp}
                                onAddStaticRoute={handleAddStaticRoute}
                                onEditStaticRoute={handleEditStaticRoute}
                                onDeleteStaticRoute={handleDeleteStaticRoute}
                                onSaveBgpGlobal={handleSaveBgpGlobal}
                                onAddBgpNetwork={handleAddBgpNetwork}
                                onDeleteBgpNetwork={handleDeleteBgpNetwork}
                                onManageVariables={handleManageVariables}
                            />
                        ) : sidebarSelection.type === 'device' ? (
                            <div className="flex flex-col h-full">
                                <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-sm">
                                    <div className="flex items-center text-blue-800">
                                        <Server className="w-4 h-4 mr-2" />
                                        <span className="font-semibold">当前设备：{getSelectedNodeName()}</span>
                                    </div>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                        正在查看生效配置（本地+模版）
                                    </span>
                                </div>
                                <NetworkTable 
                                    data={allInterfaces} 
                                    activeTemplateId={null} 
                                    isDeviceView={true} 
                                    stackTemplates={[]}
                                />
                            </div>
                        ) : null}

                        {/* Template Parameter View */}
                        {sidebarSelection.type === 'template_param' && renderTemplateParameterDetail(sidebarSelection.id)}

                        {/* Stack View (Interactive) */}
                        {sidebarSelection.type === 'stack' && renderStackView(sidebarSelection.id)}
                     </>
                 )}
             </div>
        </div>
      );
  };

  return (
    <div className="flex flex-row h-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
      
      {/* 1. Main Vertical Navigation (Leftmost) */}
      <MainSidebar 
          activeKey={activeTabKey}
          onSelect={activateTab}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header (Replaces TopNav) */}
          <TopNav 
            tabs={tabs}
            activeTabKey={activeTabKey}
            onTabClick={activateTab}
            onTabClose={closeTab}
          />

          {/* Module Content */}
          <div className="flex-1 overflow-hidden relative bg-white">
              {tabs.map(tab => {
                  if (tab.key !== activeTabKey) return null;
                  if (tab.type === 'module') return renderModule(tab.key);
                  // Render Editors
                  if (tab.type === 'stack_editor') return renderStackView(tab.data.stackId);
                  if (tab.type === 'template_editor') return renderTemplateParameterDetail(tab.data.templateId);
                  return null;
              })}
          </div>
      </div>

      {/* Global Modals */}
      <DeviceGroupSelector 
        isOpen={isScopeSelectorOpen}
        onClose={() => setIsScopeSelectorOpen(false)}
        groups={MOCK_DEVICE_GROUPS}
        selectedGroupIds={(sidebarSelection.type === 'stack' && allStacks.find(s => s.id === sidebarSelection.id)) 
            ? allStacks.find(s => s.id === sidebarSelection.id)!.assignedDeviceGroups 
            : []}
        onSave={(selectedIds) => {
            // Update the stack with selected devices
            if (sidebarSelection.type === 'stack') {
                setAllStacks(prev => prev.map(s => 
                    s.id === sidebarSelection.id ? { ...s, assignedDeviceGroups: selectedIds } : s
                ));
            }
            
            setIsScopeSelectorOpen(false);
            if (onboardingStep === 3) {
                // Finish onboarding
                setOnboardingStep(0);
            }
        }}
      />

      <AddTemplateModal 
            isOpen={isAddTemplateModalOpen}
            onClose={() => setIsAddTemplateModalOpen(false)}
            availableTemplates={allTemplates}
            onSelectTemplate={handleAddTemplateToStack}
            onCreateNew={() => {
                setIsAddTemplateModalOpen(false);
                setIsCreatingNewTemplate(true);
            }}
      />
      
      {isCreatingNewTemplate && (
          <div className="fixed inset-0 z-50 bg-white">
             <SubTemplateForm 
                onSave={(n,d,m) => {
                    const newT: Template = { id: `new-${Date.now()}`, name: n, description: d, type: 'custom', modules: m };
                    setAllTemplates(p => [...p, newT]);
                    setIsCreatingNewTemplate(false);
                    if (onboardingStep === 1) {
                        setOnboardingStep(2);
                    }
                    if(activeTabKey === 'network' && onboardingStep === 0) {
                        setSidebarSelection({ id: newT.id, type: 'template_param' });
                    }
                }}
                onCancel={() => setIsCreatingNewTemplate(false)}
             />
          </div>
      )}

      {/* Interface Modal */}
      {isInterfaceModalOpen && (
          <InterfaceFormModal 
              initialData={editingInterface}
              category={interfaceCategoryToAdd}
              availableInterfaces={allInterfaces}
              onClose={() => {
                  setIsInterfaceModalOpen(false);
                  setEditingInterface(null);
                  setInterfaceTargetTemplateId(null);
              }}
              onSave={handleSaveInterface}
          />
      )}

      {/* Zone Modal */}
      {isZoneModalOpen && (
          <ZoneFormModal 
              initialData={editingZone}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsZoneModalOpen(false);
                  setEditingZone(null);
              }}
              onSave={handleSaveZone}
          />
      )}

      {/* VWire Modal */}
      {isVWireModalOpen && (
          <VirtualWireModal 
              initialData={editingVWire}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsVWireModalOpen(false);
                  setEditingVWire(null);
              }}
              onSave={handleSaveVWire}
          />
      )}

      {/* VLine Modal */}
      {isVLineModalOpen && (
          <VirtualLineModal
              initialData={editingVLine}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsVLineModalOpen(false);
                  setEditingVLine(null);
              }}
              onSave={handleSaveVLine}
          />
      )}

      {/* DDNS Modal */}
      {isDdnsModalOpen && (
          <DdnsModal
              initialData={editingDdnsPolicy}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsDdnsModalOpen(false);
                  setEditingDdnsPolicy(null);
              }}
              onSave={handleSaveDdns}
          />
      )}

      {/* DHCP Modal */}
      {isDhcpModalOpen && (
          <DhcpModal
              initialData={editingDhcpConfig}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsDhcpModalOpen(false);
                  setEditingDhcpConfig(null);
              }}
              onSave={handleSaveDhcp}
          />
      )}

      {/* Static Route Modal */}
      {isStaticRouteModalOpen && (
          <StaticRouteModal
              initialData={editingStaticRoute}
              interfaces={allInterfaces}
              onClose={() => {
                  setIsStaticRouteModalOpen(false);
                  setEditingStaticRoute(null);
              }}
              onSave={handleSaveStaticRoute}
          />
      )}

      {/* Create Stack Modal */}
      {isCreateStackModalOpen && (
          <CreateStackModal 
              onClose={() => setIsCreateStackModalOpen(false)}
              onSave={handleSaveNewStack}
              availableTemplates={allTemplates}
              availableGroups={MOCK_DEVICE_GROUPS}
          />
      )}

      {/* Template Variable Modal */}
      {isTemplateVariableModalOpen && editingTemplateId && (
          <TemplateVariableModal
              template={allTemplates.find(t => t.id === editingTemplateId)!}
              onClose={() => {
                  setIsTemplateVariableModalOpen(false);
                  setEditingTemplateId(null);
              }}
              onSave={handleSaveTemplateVariables}
          />
      )}

    </div>
  );
};

export default App;
