import React, { useState, useEffect } from 'react';
import { X, Search, Layers, Server } from 'lucide-react';
import { NetworkZone, NetworkInterface } from '../types';

interface ZoneFormModalProps {
  initialData?: NetworkZone | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<NetworkZone>) => void;
}

const ZoneFormModal: React.FC<ZoneFormModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'L3' | 'L2' | 'Virtual Wire'>('L3');
  const [selectedInterfaces, setSelectedInterfaces] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setSelectedInterfaces(new Set(initialData.interfaces));
    }
  }, [initialData]);

  const filteredInterfaces = interfaces.filter(iface => 
    iface.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInterface = (ifaceName: string) => {
    const newSet = new Set(selectedInterfaces);
    if (newSet.has(ifaceName)) {
      newSet.delete(ifaceName);
    } else {
      newSet.add(ifaceName);
    }
    setSelectedInterfaces(newSet);
  };

  const handleSave = () => {
    if (!name.trim()) return alert('请输入区域名称');
    onSave({
      id: initialData?.id,
      name,
      type,
      interfaces: Array.from(selectedInterfaces)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? '编辑区域' : '新增区域'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Name */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-gray-700">名称：</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className={`flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${initialData ? 'bg-gray-100 text-gray-500' : ''}`}
                placeholder="请输入区域名称"
                readOnly={!!initialData} // Usually Zone Name is key
              />
            </div>

            {/* Type */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-gray-700">转发类型：</label>
              <div className="flex items-center space-x-6">
                {['L2', 'L3', 'Virtual Wire'].map((t) => (
                  <label key={t} className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="zoneType"
                      checked={type === (t === 'L2' ? 'L2' : t === 'L3' ? 'L3' : 'Virtual Wire')}
                      onChange={() => setType(t as any)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="ml-2 text-sm text-gray-700">{t === 'L2' ? '二层区域' : t === 'L3' ? '三层区域' : '虚拟网线区域'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interface Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">接口</label>
              <div className="flex border border-gray-300 rounded-lg h-[300px]">
                {/* Left: Available */}
                <div className="flex-1 flex flex-col border-r border-gray-200">
                  <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">待选 ({filteredInterfaces.filter(i => !selectedInterfaces.has(i.name)).length})</span>
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedInterfaces(new Set(interfaces.map(i => i.name)))}>全选</button>
                  </div>
                  <div className="p-2 border-b border-gray-200">
                     <div className="relative">
                        <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="搜索关键字"
                            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                        />
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredInterfaces.map(iface => {
                      if (selectedInterfaces.has(iface.name)) return null;
                      return (
                        <div 
                          key={iface.id}
                          onClick={() => toggleInterface(iface.name)}
                          className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer group"
                        >
                          <div className="w-4 h-4 border border-gray-300 rounded mr-2 bg-white group-hover:border-blue-400"></div>
                          <Server className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-700">{iface.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected */}
                <div className="flex-1 flex flex-col bg-blue-50/20">
                  <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">已选 ({selectedInterfaces.size})</span>
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedInterfaces(new Set())}>清空</button>
                  </div>
                  <div className="p-2 border-b border-gray-200 invisible">
                     <input type="text" className="w-full py-1 text-xs border border-transparent" disabled />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {Array.from(selectedInterfaces).map((name: string) => (
                        <div 
                          key={name}
                          onClick={() => toggleInterface(name)}
                          className="flex items-center px-2 py-1.5 hover:bg-red-50 rounded cursor-pointer group border border-transparent hover:border-red-100"
                        >
                          <div className="w-4 h-4 bg-blue-600 border border-blue-600 rounded mr-2 flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 transition-colors">
                              <X className="w-3 h-3 text-white" />
                          </div>
                          <Server className="w-3.5 h-3.5 mr-2 text-blue-600 group-hover:text-red-500" />
                          <span className="text-sm text-gray-800 group-hover:text-red-700">{name}</span>
                        </div>
                     ))}
                     {selectedInterfaces.size === 0 && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <Layers className="w-8 h-8 mb-2 opacity-20" />
                             <span className="text-xs">暂无数据</span>
                         </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center space-x-3">
            <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium rounded transition-colors">取消</button>
            <button onClick={handleSave} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors">确定</button>
        </div>
      </div>
    </div>
  );
};

export default ZoneFormModal;