
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { VirtualWire, NetworkInterface } from '../types';

interface VirtualWireModalProps {
  initialData?: VirtualWire | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<VirtualWire>) => void;
}

const VirtualWireModal: React.FC<VirtualWireModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [iface1, setIface1] = useState('');
  const [iface2, setIface2] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIface1(initialData.interface1);
      setIface2(initialData.interface2);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSave = () => {
    if (!name.trim()) return alert('请输入名称');
    if (!iface1) return alert('请选择虚拟网线接口一');
    if (!iface2) return alert('请选择虚拟网线接口二');
    if (iface1 === iface2) return alert('两个接口不能相同');

    onSave({
      id: initialData?.id,
      name,
      interface1: iface1,
      interface2: iface2,
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? '编辑虚拟网线' : '新增虚拟网线'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 text-sm text-gray-600 leading-relaxed">
            AF设备的“<span className="text-blue-600 font-medium">虚拟网线接口一</span>”与“<span className="text-blue-600 font-medium">虚拟网线接口二</span>”为绑定关系，与其他网口隔离，转发数据包不会查fdb表，数据包从其中一个接口进只能直接从另外一个接口出。
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">名称：</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="请输入名称"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">虚拟网线接口一：</label>
              <div className="col-span-3">
                <select 
                  value={iface1}
                  onChange={e => setIface1(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择网线接口</option>
                  {interfaces.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">虚拟网线接口二：</label>
              <div className="col-span-3">
                <select 
                  value={iface2}
                  onChange={e => setIface2(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择网线接口</option>
                  {interfaces.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-sm font-medium text-gray-700 text-right pt-2">描述：</label>
              <div className="col-span-3">
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-20"
                  placeholder="请输入描述（选填）"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center space-x-3">
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
            >
              确定
            </button>
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded transition-colors"
            >
              取消
            </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualWireModal;
