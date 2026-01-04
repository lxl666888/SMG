
import React from 'react';
import { Bell, X } from 'lucide-react';

interface TabItem {
  key: string;
  title: string;
  type: 'module' | 'stack_editor' | 'template_editor';
  closable?: boolean;
}

interface TopNavProps {
  tabs: TabItem[];
  activeTabKey: string;
  onTabClick: (key: string) => void;
  onTabClose: (key: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ tabs, activeTabKey, onTabClick, onTabClose }) => {
  // Filter out the fixed modules as they are now in MainSidebar
  const dynamicTabs = tabs.filter(t => t.closable);
  
  // Find current title
  const activeTab = tabs.find(t => t.key === activeTabKey);
  let pageTitle = activeTab?.title || 'Dashboard';
  
  // If viewing a fixed module, maybe show a nicer title
  if (!activeTab?.closable) {
      if (activeTabKey === 'topn') pageTitle = 'Top N 监控';
      if (activeTabKey === 'policy') pageTitle = '安全策略管理';
      if (activeTabKey === 'objects') pageTitle = '网络对象管理';
      if (activeTabKey === 'network') pageTitle = '网络配置中心';
      if (activeTabKey === 'orchestration') pageTitle = '组网编排中心';
      if (activeTabKey === 'operations') pageTitle = '防火墙运维中心';
  }

  return (
    <header className="bg-white border-b border-gray-200 h-12 flex items-center justify-between px-4 shrink-0 shadow-sm z-30 relative transition-all duration-300">
       {/* Left: Active Page Title & Dynamic Tabs */}
       <div className="flex items-center overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight mr-4 whitespace-nowrap">
                {pageTitle}
            </h2>
            
            {/* Dynamic Tabs Bar */}
            {dynamicTabs.length > 0 && (
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 h-8 overflow-x-auto scrollbar-hide">
                     {dynamicTabs.map(tab => (
                         <div 
                            key={tab.key}
                            onClick={() => onTabClick(tab.key)}
                            className={`
                                flex items-center px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all border whitespace-nowrap
                                ${activeTabKey === tab.key 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }
                            `}
                         >
                             {tab.title}
                             <button 
                                onClick={(e) => { e.stopPropagation(); onTabClose(tab.key); }}
                                className={`ml-2 rounded-full p-0.5 hover:bg-red-100 hover:text-red-600 transition-colors ${activeTabKey === tab.key ? 'text-blue-400' : 'text-gray-300'}`}
                             >
                                 <X className="w-3 h-3" />
                             </button>
                         </div>
                     ))}
                </div>
            )}
       </div>

       {/* Right: Actions */}
       <div className="flex items-center space-x-4 pl-4 shrink-0 bg-white">
            <div className="hidden md:flex items-center text-xs text-gray-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                系统运行正常
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors flex items-center">
              下发配置
            </button>
            <div className="relative cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </div>
       </div>
    </header>
  );
};

export default TopNav;
