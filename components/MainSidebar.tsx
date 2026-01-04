
import React, { useState } from 'react';
import { 
  Activity, 
  Shield, 
  Box, 
  Globe, 
  Settings, 
  LayoutGrid, 
  ChevronDown, 
  ChevronRight, 
  Hexagon,
  Home,
  FileText,
  ShieldCheck,
  Globe2,
  Server,
  Wrench,
  Users,
  Monitor,
  Folder,
  UserCog
} from 'lucide-react';

interface MenuItemProps { 
  itemKey: string; 
  label: string; 
  icon: React.ElementType; 
  indent?: boolean;
  isActive?: boolean;
  onSelect: (key: string) => void;
}

const MenuItem = ({ 
  itemKey, 
  label, 
  icon: Icon, 
  indent = false,
  isActive = false,
  onSelect
}: MenuItemProps) => (
  <button
    onClick={() => onSelect(itemKey)}
    className={`
      w-full flex items-center px-4 py-2 text-sm transition-all duration-200 relative
      ${isActive 
        ? 'text-white bg-gradient-to-r from-blue-600/90 to-blue-600/0 border-l-4 border-blue-500' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-l-4 border-transparent'
      }
    `}
  >
    <div className={`flex items-center ${indent ? 'pl-4' : ''}`}>
       <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
       <span>{label}</span>
    </div>
  </button>
);

interface ExpandableMenuItemProps { 
  sectionKey: string; 
  label: string; 
  icon: React.ElementType; 
  children?: React.ReactNode;
  isExpanded: boolean;
  onToggle: (key: string) => void;
}

const ExpandableMenuItem = ({ 
  sectionKey, 
  label, 
  icon: Icon,
  children,
  isExpanded,
  onToggle
}: ExpandableMenuItemProps) => {
    return (
      <div>
          <button 
              className={`
                  w-full flex items-center justify-between px-4 py-2 text-sm transition-all duration-200
                  text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-l-4 border-transparent
              `}
              onClick={() => onToggle(sectionKey)}
          >
              <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3 text-slate-500" />
                  <span>{label}</span>
              </div>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          
          {isExpanded && (
              <div className="bg-slate-900/30 py-1">
                  {children}
              </div>
          )}
      </div>
    );
};

const SectionLabel = ({ label }: { label: string }) => {
    return (
      <div className="px-4 py-2 mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
      </div>
    );
};

interface MainSidebarProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeKey, onSelect }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'fw_mgmt': true,
    'platform_identity': false,
    'platform_endpoint': false,
    'platform_object': false,
    'platform_system': false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-56 bg-[#1e293b] flex flex-col h-full shrink-0 z-50 overflow-y-auto custom-scrollbar transition-all duration-300">
       {/* Brand Header - Compact Height */}
       <div className="h-12 flex items-center px-4 bg-[#0f172a] shadow-sm shrink-0 border-b border-slate-700/50">
           <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white mr-2.5 shadow-lg shadow-blue-500/20">
               <Hexagon className="w-4 h-4 fill-current" />
           </div>
           <span className="text-sm font-bold text-slate-100 tracking-tight leading-tight">
               云安全访问服务
           </span>
       </div>

       <div className="flex-1 py-3 space-y-0.5">
           {/* General Section */}
           <MenuItem itemKey="overview" label="概览" icon={Home} onSelect={onSelect} isActive={activeKey === 'overview'} />
           <MenuItem itemKey="logs" label="日志中心" icon={FileText} onSelect={onSelect} isActive={activeKey === 'logs'} />

           {/* Core Features */}
           <SectionLabel label="核心功能" />
           <MenuItem itemKey="zero_trust" label="零信任网络访问" icon={ShieldCheck} onSelect={onSelect} isActive={activeKey === 'zero_trust'} />
           <MenuItem itemKey="global_acc" label="全球加速服务" icon={Globe2} onSelect={onSelect} isActive={activeKey === 'global_acc'} />

           {/* Firewall Central Management */}
           <ExpandableMenuItem 
                sectionKey="fw_mgmt" 
                label="防火墙集中管理" 
                icon={Server}
                isExpanded={expandedSections['fw_mgmt']}
                onToggle={toggleSection}
           >
               <MenuItem 
                    itemKey="topn" 
                    label="Top N" 
                    icon={Activity} 
                    indent
                    isActive={activeKey === 'topn'}
                    onSelect={onSelect}
               />
               <MenuItem 
                    itemKey="policy" 
                    label="策略" 
                    icon={Shield} 
                    indent
                    isActive={activeKey === 'policy'}
                    onSelect={onSelect}
               />
               <MenuItem 
                    itemKey="network" 
                    label="网络" 
                    icon={Globe} 
                    indent
                    isActive={activeKey === 'network'}
                    onSelect={onSelect}
               />
               <MenuItem 
                    itemKey="orchestration" 
                    label="组网编排" 
                    icon={LayoutGrid} 
                    indent
                    isActive={activeKey === 'orchestration'}
                    onSelect={onSelect}
               />
               <MenuItem 
                    itemKey="operations" 
                    label="防火墙运维" 
                    icon={Wrench} 
                    indent
                    isActive={activeKey === 'operations'}
                    onSelect={onSelect}
               />
           </ExpandableMenuItem>

           {/* Platform Management */}
           <SectionLabel label="平台管理" />
           
           <ExpandableMenuItem 
                sectionKey="platform_identity" 
                label="身份管理" 
                icon={UserCog}
                isExpanded={expandedSections['platform_identity']}
                onToggle={toggleSection}
           >
               <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">用户目录</div>
               <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">认证源</div>
           </ExpandableMenuItem>

           <ExpandableMenuItem 
                sectionKey="platform_endpoint" 
                label="终端管理" 
                icon={Monitor}
                isExpanded={expandedSections['platform_endpoint']}
                onToggle={toggleSection}
           >
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">设备列表</div>
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">合规检查</div>
           </ExpandableMenuItem>

           <ExpandableMenuItem 
                sectionKey="platform_object" 
                label="对象管理" 
                icon={Folder}
                isExpanded={expandedSections['platform_object']}
                onToggle={toggleSection}
           >
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">资源组</div>
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">标签管理</div>
           </ExpandableMenuItem>

           <ExpandableMenuItem 
                sectionKey="platform_system" 
                label="系统管理" 
                icon={Hexagon}
                isExpanded={expandedSections['platform_system']}
                onToggle={toggleSection}
           >
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">系统设置</div>
                <div className="px-4 py-2 text-xs text-slate-600 pl-11 hover:text-slate-400 cursor-pointer">管理员</div>
           </ExpandableMenuItem>
       </div>

       {/* Bottom Actions */}
       <div className="p-3 border-t border-slate-700/50 bg-[#0f172a]">
            <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-[10px] text-white font-bold mr-2.5 border border-slate-500">
                    AD
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-medium text-slate-200 truncate">Admin User</div>
                    <div className="text-[10px] text-slate-500 truncate">System Administrator</div>
                </div>
                <Settings className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-pointer" />
            </div>
       </div>
    </div>
  );
};

export default MainSidebar;
