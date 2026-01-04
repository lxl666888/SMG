
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { VirtualLine, NetworkInterface } from '../types';

interface VirtualLineModalProps {
  initialData?: VirtualLine | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<VirtualLine>) => void;
}

const VirtualLineModal: React.FC<VirtualLineModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [outboundInterface, setOutboundInterface] = useState('');
  
  const [uplinkValue, setUplinkValue] = useState('');
  const [uplinkUnit, setUplinkUnit] = useState('Kbps');
  
  const [downlinkValue, setDownlinkValue] = useState('');
  const [downlinkUnit, setDownlinkUnit] = useState('Kbps');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setOutboundInterface(initialData.outboundInterface);
      
      const up = parseBandwidth(initialData.uplink);
      setUplinkValue(up.value);
      setUplinkUnit(up.unit);

      const down = parseBandwidth(initialData.downlink);
      setDownlinkValue(down.value);
      setDownlinkUnit(down.unit);
    }
  }, [initialData]);

  const parseBandwidth = (bwString: string) => {
      const parts = bwString.split(' ');
      if (parts.length === 2) {
          return { value: parts[0], unit: parts[1] };
      }
      return { value: '', unit: 'Kbps' };
  };

  const handleSave = () => {
    if (!name.trim()) return alert('请输入线路名称');
    if (!outboundInterface) return alert('请选择外出接口');

    onSave({
      id: initialData?.id,
      name,
      outboundInterface,
      uplink: `${uplinkValue} ${uplinkUnit}`,
      downlink: `${downlinkValue} ${downlinkUnit}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? '编辑虚拟线路' : '新增虚拟线路'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">线路名称：</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">外出接口：</label>
              <div className="col-span-3">
                <select 
                  value={outboundInterface}
                  onChange={e => setOutboundInterface(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择物理接口</option>
                  {interfaces.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">上行：</label>
              <div className="col-span-3 flex space-x-2">
                <input 
                  type="number" 
                  value={uplinkValue}
                  onChange={e => setUplinkValue(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="8"
                />
                <select 
                    value={uplinkUnit}
                    onChange={e => setUplinkUnit(e.target.value)}
                    className="w-24 border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none"
                >
                    <option value="Kbps">Kbps</option>
                    <option value="Mbps">Mbps</option>
                    <option value="Gbps">Gbps</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">下行：</label>
              <div className="col-span-3 flex space-x-2">
                <input 
                  type="number" 
                  value={downlinkValue}
                  onChange={e => setDownlinkValue(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="8"
                />
                <select 
                    value={downlinkUnit}
                    onChange={e => setDownlinkUnit(e.target.value)}
                    className="w-24 border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none"
                >
                    <option value="Kbps">Kbps</option>
                    <option value="Mbps">Mbps</option>
                    <option value="Gbps">Gbps</option>
                </select>
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

export default VirtualLineModal;
