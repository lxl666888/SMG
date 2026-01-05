
import React from 'react';
import { X } from 'lucide-react';
import { TemplateStack, Template, VariableMapping, DeviceGroup } from '../types';
import VariableManager from './VariableManager';

interface VariableMappingModalProps {
  stack: TemplateStack;
  allTemplates: Template[];
  groups: DeviceGroup[]; // Added groups prop
  onClose: () => void;
  onSave: (newMappings: VariableMapping[]) => void;
}

const VariableMappingModal: React.FC<VariableMappingModalProps> = ({ stack, allTemplates, groups, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[1100px] h-[750px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
            <h3 className="text-lg font-bold text-gray-800">变量映射配置</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
            </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
            <VariableManager 
                stack={stack} 
                allTemplates={allTemplates} 
                groups={groups}
                onSave={(m) => { onSave(m); onClose(); }} 
            />
        </div>
      </div>
    </div>
  );
};

export default VariableMappingModal;
