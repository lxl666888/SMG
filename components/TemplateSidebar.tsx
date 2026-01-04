
import React, { useState } from 'react';
import { 
  Network, 
  Globe, 
  Route, 
  Server, 
  Settings, 
  FileText, 
  List, 
  Activity,
  Box,
  ChevronDown, 
  ChevronRight,
  LayoutGrid,
  Cable,
  TrendingUp
} from 'lucide-react';

interface TemplateSidebarProps {
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  showSystemConfig?: boolean;
  showNetworkConfig?: boolean;
  className?: string;
}

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

const TemplateSidebar: React.FC<TemplateSidebarProps> = ({ 
  activeModule, 
  onSelectModule, 
  showSystemConfig = true,
  showNetworkConfig = true,
  className = "w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto"
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['network', 'system']);

  const menuGroups: MenuGroup[] = [
    {
      id: 'network',
      label: '网络配置',
      items: [
        { id: 'network_interfaces', label: '接口', icon: <Network className="w-4 h-4" /> },
        { id: 'network_zones', label: '区域', icon: <LayoutGrid className="w-4 h-4" /> },
        { id: 'network_vwire', label: '虚拟网线', icon: <Cable className="w-4 h-4" /> },
        { id: 'network_vlist', label: '虚拟线路列表', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'network_routes', label: '路由', icon: <Route className="w-4 h-4" /> },
        { id: 'network_dhcp', label: 'DHCP', icon: <Server className="w-4 h-4" /> },
        { id: 'network_dns', label: 'DNS', icon: <Globe className="w-4 h-4" /> },
      ]
    },
    {
      id: 'system',
      label: '系统配置',
      items: [
        { id: 'system_general', label: '通用设置', icon: <Settings className="w-4 h-4" /> },
        { id: 'system_logs', label: '日志设置', icon: <Settings className="w-4 h-4" /> },
        { id: 'system_log_hosts', label: '日志主机列表', icon: <List className="w-4 h-4" /> },
        { id: 'system_snmp', label: 'SNMP', icon: <Activity className="w-4 h-4" /> },
        { id: 'system_modules', label: '模块功能设置', icon: <Box className="w-4 h-4" /> },
      ]
    }
  ];

  const filteredGroups = menuGroups.filter(g => {
    if (g.id === 'network' && !showNetworkConfig) return false;
    if (g.id === 'system' && !showSystemConfig) return false;
    return true;
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  return (
    <div className={className}>
      <div className="p-4">
        {filteredGroups.map((group) => (
          <div key={group.id} className="mb-4">
            <div 
              className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 cursor-pointer hover:text-gray-700"
              onClick={() => toggleGroup(group.id)}
            >
              <span>{group.label}</span>
              {expandedGroups.includes(group.id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
            
            {expandedGroups.includes(group.id) && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectModule(item.id)}
                      className={`
                        w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
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
  );
};

export default TemplateSidebar;
