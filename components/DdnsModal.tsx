
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { DdnsPolicy, NetworkInterface } from '../types';

interface DdnsModalProps {
  initialData?: DdnsPolicy | null;
  interfaces: NetworkInterface[];
  onClose: () => void;
  onSave: (data: Partial<DdnsPolicy>) => void;
}

const DdnsModal: React.FC<DdnsModalProps> = ({ initialData, interfaces, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'enabled' | 'disabled'>('enabled');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [iface, setIface] = useState('');
  const [updateInterval, setUpdateInterval] = useState(24);
  const [retryInterval, setRetryInterval] = useState(10);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setProvider(initialData.provider);
      setDomain(initialData.domain);
      setUsername(initialData.username || '');
      setPassword(initialData.password || '');
      setIface(initialData.interface);
      setUpdateInterval(initialData.updateInterval);
      setRetryInterval(initialData.retryInterval);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!name.trim()) return alert('请输入策略名称');
    if (!provider) return alert('请选择服务商');
    if (!domain.trim()) return alert('请输入域名');
    if (!iface) return alert('请选择绑定接口');

    onSave({
      id: initialData?.id,
      name,
      status,
      description,
      provider,
      domain,
      username,
      password,
      interface: iface,
      updateInterval,
      retryInterval
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? '编辑DDNS策略' : '新增DDNS策略'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">名称：</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="请输入DDNS策略名称"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">状态：</label>
              <div className="col-span-3 flex space-x-6">
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        name="ddnsStatus"
                        checked={status === 'enabled'}
                        onChange={() => setStatus('enabled')}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="ml-2 text-sm text-gray-700">启用</span>
                </label>
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        name="ddnsStatus"
                        checked={status === 'disabled'}
                        onChange={() => setStatus('disabled')}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                    />
                    <span className="ml-2 text-sm text-gray-700">禁用</span>
                </label>
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

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">服务商：</label>
              <div className="col-span-3">
                <select 
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择DDNS服务商</option>
                  <option value="DynDNS">DynDNS</option>
                  <option value="No-IP">No-IP</option>
                  <option value="3322">3322.org</option>
                  <option value="Oray">花生壳 (Oray)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">域名：</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="请输入域名"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">用户名：</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="请输入用户名或者token"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">密码：</label>
              <div className="col-span-3 relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="请输入密码（选填）"
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">绑定接口：</label>
              <div className="col-span-3">
                <select 
                  value={iface}
                  onChange={e => setIface(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择绑定接口</option>
                  {interfaces.filter(i => i.category === 'physical' || i.category === 'sub' || i.category === 'vlan').map(i => (
                    <option key={i.id} value={i.name}>{i.name} ({i.ip})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">更新间隔：</label>
              <div className="col-span-3 flex items-center">
                <input 
                  type="number" 
                  value={updateInterval}
                  onChange={e => setUpdateInterval(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="ml-3 text-sm text-gray-600 w-10">小时</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-700 text-right">重试间隔：</label>
              <div className="col-span-3 flex items-center">
                <input 
                  type="number" 
                  value={retryInterval}
                  onChange={e => setRetryInterval(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="ml-3 text-sm text-gray-600 w-10">分钟</span>
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

export default DdnsModal;
