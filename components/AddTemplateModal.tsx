
import React, { useState } from 'react';
import { Template } from '../types';
import { Search, Plus, FileCode, Check, X, ArrowRight } from 'lucide-react';

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTemplates: Template[];
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
}

const AddTemplateModal: React.FC<AddTemplateModalProps> = ({
  isOpen,
  onClose,
  availableTemplates,
  onSelectTemplate,
  onCreateNew
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = availableTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedId) {
        const tmpl = availableTemplates.find(t => t.id === selectedId);
        if (tmpl) onSelectTemplate(tmpl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div>
              <h3 className="text-lg font-bold text-gray-800">添加模版参数</h3>
              <p className="text-xs text-gray-500">选择一个现有的模版参数加入当前集合，或创建一个新的</p>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
               <X className="w-5 h-5 text-gray-500" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search & Create New Action */}
            <div className="p-4 border-b border-gray-100 space-y-3">
                 <button 
                    onClick={onCreateNew}
                    className="w-full py-3 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all group"
                 >
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">创建一个全新的模版参数</span>
                 </button>
                 
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="搜索已有参数..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                 </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
                {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(tmpl => (
                        <div 
                            key={tmpl.id}
                            onClick={() => setSelectedId(tmpl.id)}
                            className={`
                                flex items-start p-3 rounded-lg border cursor-pointer transition-all
                                ${selectedId === tmpl.id 
                                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${selectedId === tmpl.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <FileCode className="w-4 h-4" />
                            </div>
                            <div className="ml-3 flex-1">
                                <h4 className={`text-sm font-bold ${selectedId === tmpl.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {tmpl.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {tmpl.description}
                                </p>
                            </div>
                            {selectedId === tmpl.id && (
                                <div className="ml-2 mt-1">
                                    <Check className="w-4 h-4 text-blue-600" />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-sm">没有找到匹配的参数</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-3">
             <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2">
                 取消
             </button>
             <button 
                disabled={!selectedId}
                onClick={handleConfirm}
                className={`
                    flex items-center px-6 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all
                    ${selectedId 
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }
                `}
             >
                 添加选中参数 <ArrowRight className="w-4 h-4 ml-2" />
             </button>
        </div>

      </div>
    </div>
  );
};

export default AddTemplateModal;
