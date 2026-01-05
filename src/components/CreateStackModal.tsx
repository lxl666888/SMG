
import React, { useState } from 'react';
import { Template, DeviceGroup } from '../types';
import { X, Layers, FileCode, Monitor, Server, ChevronRight, Check } from 'lucide-react';

interface CreateStackModalProps {
  onClose: () => void;
  onSave: (name: string, description: string, selectedTemplateIds: string[], selectedDeviceIds: string[]) => void;
  availableTemplates: Template[];
  availableGroups: DeviceGroup[];
}

const CreateStackModal: React.FC<CreateStackModalProps> = ({ onClose, onSave, availableTemplates, availableGroups }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  // Helper for device tree rendering (Simplified for this modal)
  const renderDeviceTree = (nodes: DeviceGroup[], level = 0) => {
      return nodes.map(node => (
          <div key={node.id}>
              <div 
                className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => {
                   const newSet = new Set(selectedDevices);
                   if (newSet.has(node.name)) newSet.delete(node.name);
                   else newSet.add(node.name);
                   setSelectedDevices(newSet);
                }}
              >
                  <input 
                    type="checkbox" 
                    checked={selectedDevices.has(node.name)} 
                    onChange={() => {}} 
                    className="mr-2 rounded text-blue-600" 
                  />
                  {node.type === 'device' ? <Server className="w-4 h-4 mr-2 text-gray-400" /> : <Folder className="w-4 h-4 mr-2 text-blue-400" />}
                  <span className="text-sm text-gray-700">{node.name}</span>
              </div>
              {node.children && renderDeviceTree(node.children, level + 1)}
          </div>
      ));
  };
  
  // Icon placeholder
  const Folder = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"/></svg>;

  const handleSave = () => {
      if (!name.trim()) return;
      onSave(name, description, Array.from(selectedTemplates), Array.from(selectedDevices));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">新建网络模版</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Steps Sidebar */}
            <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 space-y-1">
                {[
                    { n: 1, label: '基础信息', icon: Layers },
                    { n: 2, label: '选择模版参数', icon: FileCode },
                    { n: 3, label: '关联设备', icon: Monitor },
                ].map(s => (
                    <div 
                        key={s.n}
                        onClick={() => setStep(s.n)}
                        className={`
                            flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors
                            ${step === s.n ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100'}
                        `}
                    >
                        <s.icon className={`w-4 h-4 mr-2 ${step === s.n ? 'text-blue-500' : 'text-gray-400'}`} />
                        {s.label}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto bg-white">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">模版名称 <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="请输入模版名称" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">描述说明</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="请输入描述..." 
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-200 h-full flex flex-col">
                        <div className="mb-4">
                            <h4 className="font-bold text-gray-800">选择包含的模版参数</h4>
                            <p className="text-xs text-gray-500 mt-1">勾选需要包含在此模版集中的参数配置</p>
                        </div>
                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                            {availableTemplates.length > 0 ? availableTemplates.map(tmpl => (
                                <div 
                                    key={tmpl.id}
                                    onClick={() => {
                                        const newSet = new Set(selectedTemplates);
                                        if (newSet.has(tmpl.id)) newSet.delete(tmpl.id);
                                        else newSet.add(tmpl.id);
                                        setSelectedTemplates(newSet);
                                    }}
                                    className={`
                                        flex items-center px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors
                                        ${selectedTemplates.has(tmpl.id) ? 'bg-blue-50/50' : ''}
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors
                                        ${selectedTemplates.has(tmpl.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                                    `}>
                                        {selectedTemplates.has(tmpl.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-gray-800">{tmpl.name}</div>
                                        <div className="text-xs text-gray-500">{tmpl.description}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-400 text-sm">暂无可用模版参数，请先创建参数</div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                     <div className="animate-in fade-in slide-in-from-right-4 duration-200 h-full flex flex-col">
                        <div className="mb-4">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-gray-800">关联生效设备</h4>
                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">选填</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">选择应用此模版的设备或设备组，也可以稍后在模版详情中配置</p>
                        </div>
                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-2">
                             {renderDeviceTree(availableGroups)}
                        </div>
                     </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-xs text-gray-500">
                {step === 1 && '请填写基础信息'}
                {step === 2 && `已选 ${selectedTemplates.size} 个模版参数`}
                {step === 3 && (selectedDevices.size > 0 ? `已选 ${selectedDevices.size} 个设备/组` : '未选择关联设备 (可直接完成)')}
            </div>
            <div className="flex space-x-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        上一步
                    </button>
                )}
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center"
                    >
                        下一步 <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                ) : (
                    <button 
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className={`
                            px-6 py-2 rounded-lg text-sm font-bold text-white shadow-sm flex items-center
                            ${!name.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                        `}
                    >
                        完成创建 <Check className="w-4 h-4 ml-1.5" />
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default CreateStackModal;
