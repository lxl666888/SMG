
import React, { useState } from 'react';
import { 
  FileCode, 
  Layers, 
  Monitor, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Play,
  LayoutGrid,
  Settings,
  Share2
} from 'lucide-react';

interface NetworkInitializationProps {
  step: number;
  onCreateTemplate: () => void;
  onCreateStack: (name: string) => void;
  onAssignDevices: () => void;
  onSkip: () => void;
}

const NetworkInitialization: React.FC<NetworkInitializationProps> = ({ 
  step, 
  onCreateTemplate, 
  onCreateStack,
  onAssignDevices,
  onSkip
}) => {
  const [stackName, setStackName] = useState('');

  const steps = [
      { num: 1, title: '配置模版参数', icon: FileCode },
      { num: 2, title: '创建网络模版', icon: Layers },
      { num: 3, title: '关联生效设备', icon: Monitor },
  ];

  const renderStepIcon = (item: { num: number, title: string, icon: React.ElementType }) => {
    const isActive = step === item.num;
    const isCompleted = step > item.num;
    const Icon = item.icon;

    return (
      <div className="flex flex-col items-center relative z-10">
        <div className={`
            w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${isActive 
            ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-50' 
            : isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-200 text-gray-300'
            }
        `}>
            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
        </div>
        <div className={`mt-3 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-blue-700 font-bold' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
            {item.title}
        </div>
      </div>
    );
  };

  const renderConnector = (stepNum: number) => {
    const isCompleted = step > stepNum;
    return (
      <div className="flex-1 h-0.5 mx-4 -mt-6 transition-all duration-700 relative">
          <div className="absolute inset-0 bg-gray-200"></div>
          <div className={`absolute inset-0 bg-green-500 transition-all duration-700 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full bg-gray-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
      
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-6 border border-gray-100">
                <LayoutGrid className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">初始化网络配置中心</h1>
            <p className="text-gray-500 text-lg">检测到当前尚未配置任何网络模版，请跟随向导完成初始化设置。</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 px-16 relative">
            {renderStepIcon(steps[0])}
            {renderConnector(1)}
            {renderStepIcon(steps[1])}
            {renderConnector(2)}
            {renderStepIcon(steps[2])}
        </div>

        {/* Step Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[420px] flex flex-col transition-all duration-300">
            
            {/* Step 1: Create Template Param */}
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <FileCode className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">第一步：配置模版参数</h2>
                    <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
                        模版参数是网络配置的最小原子单元（如：接口定义、DNS配置、路由表等）。<br/>
                        您需要先创建一个基础参数集合，供后续的网络模版调用。
                    </p>
                    <button 
                        onClick={onCreateTemplate}
                        className="group px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        新增模版参数
                    </button>
                </div>
            )}

            {/* Step 2: Create Stack */}
            {step === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <Layers className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">第二步：创建网络模版</h2>
                    <p className="text-gray-500 max-w-lg mb-8 leading-relaxed">
                        网络模版（Template Stack）是参数的容器。它将多个参数模版组合在一起，<br/>
                        形成一套完整的、可复用的网络架构标准。
                    </p>
                    
                    <div className="w-full max-w-md flex flex-col space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="text-left">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">定义模版名称</label>
                            <input 
                                type="text" 
                                value={stackName}
                                onChange={(e) => setStackName(e.target.value)}
                                placeholder="例如：总部核心网络模版"
                                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                autoFocus
                            />
                        </div>
                        <button 
                            disabled={!stackName.trim()}
                            onClick={() => onCreateStack(stackName)}
                            className="w-full px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
                        >
                            创建并关联参数 <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Associate Devices */}
            {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <Monitor className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">第三步：关联生效设备</h2>
                    <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
                        配置已就绪！最后一步，请选择该模版适用的设备组或防火墙。<br/>
                        配置下发后，设备将自动同步并应用这些网络设置。
                    </p>
                    <button 
                        onClick={onAssignDevices}
                        className="group px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 flex items-center text-lg"
                    >
                        选择关联设备 <Play className="w-5 h-5 ml-2 fill-current" />
                    </button>
                </div>
            )}

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-8 text-center">
             <button 
                onClick={onSkip}
                className="text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center mx-auto transition-colors border border-gray-200 px-4 py-2 rounded-full hover:bg-white hover:border-gray-300"
             >
                 <Settings className="w-3.5 h-3.5 mr-1.5" />
                 跳过向导，进入手动配置模式
             </button>
        </div>

      </div>
    </div>
  );
};

export default NetworkInitialization;
