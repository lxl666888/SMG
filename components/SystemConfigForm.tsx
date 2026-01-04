
import React from 'react';
import { Info, Save } from 'lucide-react';

interface SystemConfigFormProps {
    isPreview?: boolean;
}

const SystemConfigForm: React.FC<SystemConfigFormProps> = ({ isPreview = false }) => {
  return (
    <div className="flex-1 bg-white h-full overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Card Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-10">
                
                {/* Section 1: Web Console Options */}
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-6">web控制台选项</h2>
                    
                    <div className="space-y-5 max-w-3xl">
                        {/* HTTPS Port */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">https端口：</label>
                            <div className="col-span-3 flex items-center">
                                <input 
                                    type="number" 
                                    defaultValue={443} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                                <Info className="w-4 h-4 text-blue-500 ml-3 cursor-pointer" />
                            </div>
                        </div>

                        {/* SSH Port */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">SSH端口：</label>
                            <div className="col-span-3">
                                <input 
                                    type="number" 
                                    defaultValue={22345} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* Timeout */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">控制超时 (m)：</label>
                            <div className="col-span-3">
                                <input 
                                    type="number" 
                                    defaultValue={11} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* Smart Service */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">智能客服：</label>
                            <div className="col-span-3 flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="smart_service" defaultChecked className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">开启</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="smart_service" className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">关闭</span>
                                </label>
                            </div>
                        </div>

                        {/* Dynamic Captcha */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">动态验证码：</label>
                            <div className="col-span-3 flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="captcha" defaultChecked className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">开启</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="captcha" className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">关闭</span>
                                </label>
                            </div>
                        </div>

                        {/* Projection Display */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="flex items-center">
                                <label className="text-sm font-medium text-gray-600">投屏显示</label>
                                <Info className="w-3.5 h-3.5 text-blue-500 ml-1 cursor-pointer" />
                                <span className="text-gray-600">：</span>
                            </div>
                            <div className="col-span-3 flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="projection" className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">开启</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="projection" defaultChecked className="text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className="ml-2 text-sm text-gray-700">关闭</span>
                                </label>
                            </div>
                        </div>

                        {/* Use TLS */}
                        <div className="grid grid-cols-4 gap-4 items-start pt-1">
                            <div className="flex items-center mt-1">
                                <label className="text-sm font-medium text-gray-600">使用TLS</label>
                                <Info className="w-3.5 h-3.5 text-blue-500 ml-1 cursor-pointer" />
                                <span className="text-gray-600">：</span>
                            </div>
                            <div className="col-span-3 flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className={`ml-2 text-sm ${isPreview ? 'text-gray-400' : 'text-gray-500'}`}>TLS1.0</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className={`ml-2 text-sm ${isPreview ? 'text-gray-400' : 'text-gray-500'}`}>TLS1.1</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className={`ml-2 text-sm ${isPreview ? 'text-gray-400' : 'text-gray-500'}`}>TLS1.2</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={isPreview} />
                                    <span className={`ml-2 text-sm ${isPreview ? 'text-gray-400' : 'text-gray-500'}`}>TLS1.3</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: General Auth Params */}
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-6">通用认证参数</h2>
                    
                    <div className="space-y-5 max-w-3xl">
                         {/* Max Concurrent */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">最大并发管理数：</label>
                            <div className="col-span-3 flex items-center">
                                <input 
                                    type="number" 
                                    defaultValue={10} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                                <span className="ml-3 text-sm text-gray-700">个</span>
                            </div>
                        </div>

                        {/* Single User Limit */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">单用户限制：</label>
                            <div className="col-span-3 flex items-center">
                                <input 
                                    type="number" 
                                    defaultValue={10} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                                <span className="ml-3 text-sm text-gray-700">个登录地点</span>
                            </div>
                        </div>

                        {/* Login Attempts */}
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-600">登录失败允许尝试：</label>
                            <div className="col-span-3 flex items-center">
                                <input 
                                    type="number" 
                                    defaultValue={10} 
                                    disabled={isPreview}
                                    className={`block w-full max-w-md rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${isPreview ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                                />
                                <span className="ml-3 text-sm text-gray-700">次</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button 
                        className={`flex items-center px-6 py-2 rounded-md font-medium shadow-sm transition-colors ${isPreview ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        disabled={isPreview}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        保存
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SystemConfigForm;
