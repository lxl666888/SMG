
import React, { useState, useEffect, useRef } from 'react';
import { Template, TemplateStack, VariableMapping } from '../types';
import { FileText, Plus, CheckCircle2, Monitor, Settings, Edit2, X, ArrowLeft, ArrowRight, ArrowLeft as ArrowLeftIcon, GripHorizontal, Lock, AlertCircle, Sliders, Settings2 } from 'lucide-react';

interface TemplateStackBuilderProps {
  stack: TemplateStack;
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string | null) => void;
  onAddTemplate: () => void;
  onRemoveTemplate: (id: string) => void;
  onUpdateName: (name: string) => void;
  onBack: () => void;
  onOpenScopeSelector: () => void;
  onReorderTemplates: (newTemplates: Template[]) => void;
  readOnly?: boolean;
}

const TemplateCard: React.FC<{
  template: Template;
  index: number;
  total: number;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  readOnly: boolean;
}> = ({ template, index, total, isSelected, isDimmed, onClick, onRemove, onDragStart, onDragOver, onDrop, isDragging, readOnly }) => {
  
  return (
    <div 
      className={`flex items-center relative z-0 mr-4 last:mr-0 group/card transition-all duration-300 ${isDragging ? 'opacity-20 scale-95' : 'opacity-100'}`}
      draggable={!readOnly}
      onDragStart={!readOnly ? onDragStart : undefined}
      onDragOver={!readOnly ? onDragOver : undefined}
      onDrop={!readOnly ? onDrop : undefined}
    >
      {/* Card */}
      <div
        onClick={onClick}
        className={`
          relative w-[280px] h-[160px] rounded-lg border transition-all duration-200 cursor-pointer flex flex-col p-4
          ${isSelected 
            ? 'border-blue-500 bg-blue-50/60 shadow-md scale-105 z-10 ring-1 ring-blue-500' 
            : isDimmed 
                ? 'border-gray-100 bg-gray-50/50 opacity-60 hover:opacity-100' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
          }
        `}
      >
        <div className="flex items-start justify-between mb-2">
           <div className="flex items-center space-x-2">
              {!readOnly && (
                  <div className={`p-1.5 rounded-md bg-indigo-50 text-indigo-600 cursor-move`} title="拖拽调整优先级">
                      <GripHorizontal className="w-4 h-4" />
                  </div>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${index === 0 ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                优先级: {index + 1}
              </span>
           </div>
           
           <div className="flex items-center space-x-1">
               {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
               
               {/* Delete Button */}
               {!readOnly && (
                   <button 
                      onClick={onRemove}
                      className={`
                        p-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors
                        ${isSelected ? 'text-gray-400' : 'text-gray-300 opacity-0 group-hover/card:opacity-100'}
                      `}
                      title="移除此模版"
                   >
                      <X className="w-4 h-4" />
                   </button>
               )}
           </div>
        </div>

        <div className="flex-1">
           <h3 className="font-bold text-gray-800 text-sm leading-snug truncate mb-1" title={template.name}>{template.name}</h3>
           <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
             {template.description}
           </p>
        </div>

        {/* Priority Helper - Drag Hint */}
        <div className={`flex items-center justify-center mt-2 pt-2 border-t border-dashed ${isSelected ? 'border-blue-200' : 'border-gray-100'}`}>
             <span className="text-[10px] text-gray-400">
                {readOnly 
                    ? (index === 0 ? '最高优先级 (覆盖后序配置)' : '优先级较低') 
                    : (index === 0 ? '最高优先级 (覆盖后序配置)' : '拖拽可调整优先级')
                }
             </span>
        </div>
      </div>
    </div>
  );
};

const TemplateStackBuilder: React.FC<TemplateStackBuilderProps> = ({
  stack,
  selectedTemplateId,
  onSelectTemplate,
  onAddTemplate,
  onRemoveTemplate,
  onUpdateName,
  onBack,
  onOpenScopeSelector,
  onReorderTemplates,
  readOnly = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stack.name);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setTempName(stack.name);
  }, [stack.name]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
        onUpdateName(tempName);
    } else {
        setTempName(stack.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleNameBlur();
    }
  };

  // -- Drag and Drop Logic --
  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    if (readOnly) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move'; 
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault(); 
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (targetIndex: number) => (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newTemplates = [...stack.templates];
    const [draggedItem] = newTemplates.splice(draggedIndex, 1);
    newTemplates.splice(targetIndex, 0, draggedItem);
    
    onReorderTemplates(newTemplates);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-20 flex flex-col shrink-0">
      
      {/* 1. Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30 shrink-0">
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
                {readOnly && (
                    <div className="flex items-center bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded border border-gray-200">
                        <Lock className="w-3 h-3 mr-1" />
                        只读模式
                    </div>
                )}
                
                <div className="group flex items-center">
                    {isEditingName && !readOnly ? (
                        <input 
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleNameBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="text-lg font-bold text-gray-800 bg-white border border-blue-400 rounded px-2 py-0.5 outline-none w-80 shadow-sm"
                        />
                    ) : (
                        <div 
                            className={`flex items-center px-2 py-0.5 -ml-2 rounded transition-colors ${!readOnly ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                            onClick={() => !readOnly && setIsEditingName(true)}
                            title={!readOnly ? "点击修改名称" : ""}
                        >
                            <h2 className="text-lg font-bold text-gray-800 mr-2">{stack.name}</h2>
                            {!readOnly && <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                模版构成
            </div>
        </div>

        {/* Right Actions: Scope */}
        <div className="flex items-center bg-white rounded-md border border-gray-200 px-1 py-1 shadow-sm">
            <div className="flex items-center px-3 py-1.5 border-r border-gray-200 text-sm text-gray-600">
                <Monitor className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-500 mr-2">生效范围:</span>
                <span className="font-medium text-gray-800 truncate max-w-[200px]">
                    {stack.assignedDeviceGroups.length > 0 ? stack.assignedDeviceGroups.join(', ') : '未关联设备'}
                </span>
            </div>
            {!readOnly ? (
                <button 
                    onClick={onOpenScopeSelector}
                    className="px-3 py-1.5 hover:bg-gray-50 text-blue-600 text-sm font-medium rounded transition-colors flex items-center"
                >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    管理关联
                </button>
            ) : (
                <div className="px-3 py-1.5 text-gray-400 text-sm font-medium flex items-center cursor-not-allowed">
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    管理关联
                </div>
            )}
        </div>
      </div>

      {/* 2. Visual Builder Area */}
      <div className="p-6">
            <div className="flex items-center overflow-x-auto pb-4 scrollbar-hide pl-1 min-h-[190px]">
                
                {stack.templates.map((tmpl, idx) => (
                <TemplateCard
                    key={tmpl.id}
                    template={tmpl}
                    index={idx}
                    total={stack.templates.length}
                    isSelected={selectedTemplateId === tmpl.id}
                    isDimmed={selectedTemplateId !== null && selectedTemplateId !== tmpl.id}
                    isDragging={draggedIndex === idx}
                    readOnly={readOnly}
                    onClick={() => {
                        if (selectedTemplateId === tmpl.id) {
                            onSelectTemplate(null);
                        } else {
                            onSelectTemplate(tmpl.id);
                        }
                    }}
                    onRemove={(e) => {
                    e.stopPropagation();
                    onRemoveTemplate(tmpl.id);
                    }}
                    onDragStart={handleDragStart(idx)}
                    onDragOver={handleDragOver(idx)}
                    onDrop={handleDrop(idx)}
                />
                ))}

                <div className="mr-4"></div>
                
                {!readOnly && (
                    <button
                        onClick={onAddTemplate}
                        className="w-[280px] h-[160px] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all flex-shrink-0 group relative overflow-hidden bg-gray-50/30"
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-600 flex items-center justify-center mb-3 transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-md">
                            <Plus className="w-6 h-6" />
                        </div>
                        
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700 transition-colors">
                            关联模版参数
                        </span>
                        
                        <div className="mt-3 flex items-center px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 group-hover:bg-orange-100 transition-colors">
                            <AlertCircle className="w-3 h-3 text-orange-500 mr-1.5" />
                            <span className="text-[10px] font-medium text-orange-700">
                                新增项默认最高优先级
                            </span>
                        </div>
                    </button>
                )}

            </div>
            
            {/* Helper Text */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    {selectedTemplateId === null ? (
                        <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <Monitor className="w-3 h-3 mr-1.5" />
                            当前展示：全量生效配置（组合结果）
                        </span>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center text-gray-500">
                                <Monitor className="w-3 h-3 mr-1.5" />
                                当前展示：
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                                仅显示 {stack.templates.find(t => t.id === selectedTemplateId)?.name} 覆盖的配置
                            </span>
                            <button 
                                onClick={() => onSelectTemplate(null)}
                                className="text-blue-600 hover:underline ml-2"
                            >
                                返回组合视图
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center space-x-6 opacity-80">
                    <div className="flex items-center text-orange-500 text-[10px] uppercase tracking-wider font-semibold">
                        <ArrowLeftIcon className="w-3 h-3 mr-1" />
                        最高优先级 (覆盖)
                    </div>
                    <div className="h-px w-32 bg-gradient-to-r from-orange-200 via-gray-200 to-gray-200"></div>
                    <div className="flex items-center text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                        优先级低 (基础)
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TemplateStackBuilder;
