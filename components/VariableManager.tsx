
import React, { useState, useEffect, useRef } from 'react';
import { VariableMapping, TemplateStack, Template, DeviceGroup } from '../types';
import { Search, Download, Upload, Save, AlertCircle, FileSpreadsheet, Check } from 'lucide-react';

interface VariableManagerProps {
  stack: TemplateStack;
  allTemplates: Template[];
  groups: DeviceGroup[]; // Need access to groups to resolve device list
  onSave: (newMappings: VariableMapping[]) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({ stack, allTemplates, groups, onSave }) => {
  const [mappings, setMappings] = useState<VariableMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceColumns, setDeviceColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to resolve all device names from the stack's assigned groups
  const resolveDevices = (assignedIds: string[], allGroups: DeviceGroup[]): string[] => {
      const devices = new Set<string>();
      
      const findNode = (nodes: DeviceGroup[], targetId: string): DeviceGroup | null => {
          for (const node of nodes) {
              if (node.id === targetId || node.name === targetId) return node;
              if (node.children) {
                  const found = findNode(node.children, targetId);
                  if (found) return found;
              }
          }
          return null;
      };

      const collectDevices = (node: DeviceGroup) => {
          if (node.type === 'device') {
              devices.add(node.name);
          } else if (node.children) {
              node.children.forEach(collectDevices);
          }
      };

      assignedIds.forEach(id => {
          const node = findNode(allGroups, id);
          if (node) collectDevices(node);
      });

      return Array.from(devices).sort();
  };

  // Initialization Logic
  useEffect(() => {
      // 1. Resolve Devices for Columns
      const devices = resolveDevices(stack.assignedDeviceGroups, groups);
      setDeviceColumns(devices);

      // 2. Identify all templates in this stack
      const aggregatedVars: Map<string, { variable: string, type: string, description: string, defaultValue: string }> = new Map();

      stack.templates.forEach(tmpl => {
          const fullTmpl = allTemplates.find(t => t.id === tmpl.id) || tmpl;
          if (fullTmpl.variables) {
              fullTmpl.variables.forEach(v => {
                  if (!aggregatedVars.has(v.name)) {
                      aggregatedVars.set(v.name, {
                          variable: v.name,
                          type: v.type,
                          description: v.description || '',
                          defaultValue: v.defaultValue || '',
                      });
                  }
              });
          }
      });

      // 3. Merge with existing mappings
      const mergedMappings: VariableMapping[] = Array.from(aggregatedVars.values()).map(v => {
          const existingMapping = stack.variableMappings?.find(m => m.variable === v.variable);
          return {
              variable: v.variable,
              description: v.description,
              value: existingMapping?.value || v.defaultValue || '', // Stack Default
              deviceValues: existingMapping?.deviceValues || {} // Per Device Overrides
          };
      });

      setMappings(mergedMappings);
  }, [stack, allTemplates, groups]);

  // Handlers
  const handleDefaultValueChange = (variableName: string, val: string) => {
      setMappings(prev => prev.map(m => 
          m.variable === variableName ? { ...m, value: val } : m
      ));
  };

  const handleDeviceValueChange = (variableName: string, deviceName: string, val: string) => {
      setMappings(prev => prev.map(m => {
          if (m.variable === variableName) {
              const newDeviceValues = { ...m.deviceValues };
              if (val.trim() === '') {
                  delete newDeviceValues[deviceName]; // Remove if empty to inherit default
              } else {
                  newDeviceValues[deviceName] = val;
              }
              return { ...m, deviceValues: newDeviceValues };
          }
          return m;
      }));
  };

  // CSV Export
  const handleExport = () => {
      // CSV Header
      const header = ['variable_name', 'variable_type', 'default_value', ...deviceColumns];
      
      // CSV Rows
      const rows = mappings.map(m => {
          // Find type definition again for export
          let type = 'string';
          for(const t of stack.templates) {
             const fullT = allTemplates.find(ft => ft.id === t.id);
             const v = fullT?.variables?.find(v => v.name === m.variable);
             if(v) { type = v.type; break; }
          }

          const rowData = [
              m.variable,
              type,
              m.value, // Default Value
              ...deviceColumns.map(dev => m.deviceValues[dev] || '#inherited#') // Use placeholder for inheritance
          ];
          return rowData.join(',');
      });

      const csvContent = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${stack.name}_variables.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // CSV Import
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          if (!text) return;

          const lines = text.split('\n');
          if (lines.length < 2) return;

          const header = lines[0].trim().split(',');
          // Detect column indices
          const varIdx = header.indexOf('variable_name');
          const defIdx = header.indexOf('default_value');
          
          if (varIdx === -1) {
              alert('CSV格式错误: 缺少 variable_name 列');
              return;
          }

          const newMappings = [...mappings];

          // Map device columns
          const deviceIndices: Record<string, number> = {};
          deviceColumns.forEach(dev => {
              const idx = header.indexOf(dev);
              if (idx !== -1) deviceIndices[dev] = idx;
          });

          // Process rows
          for (let i = 1; i < lines.length; i++) {
              const row = lines[i].trim().split(',');
              if (row.length < 2) continue;

              const varName = row[varIdx];
              const mappingIndex = newMappings.findIndex(m => m.variable === varName);

              if (mappingIndex !== -1) {
                  // Update existing mapping
                  if (defIdx !== -1 && row[defIdx] !== undefined) {
                      newMappings[mappingIndex].value = row[defIdx];
                  }

                  // Update devices
                  Object.entries(deviceIndices).forEach(([devName, colIdx]) => {
                      const val = row[colIdx];
                      if (val && val !== '#inherited#' && val.trim() !== '') {
                          newMappings[mappingIndex].deviceValues[devName] = val;
                      } else if (val === '#inherited#') {
                          delete newMappings[mappingIndex].deviceValues[devName];
                      }
                  });
              }
          }
          
          setMappings(newMappings);
          // Clear input
          if (fileInputRef.current) fileInputRef.current.value = '';
          alert('导入成功');
      };
      reader.readAsText(file);
  };

  const filteredMappings = mappings.filter(m => 
      m.variable.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileUpload} 
        />

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
            <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
                    变量映射表
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    配置变量在不同设备上的具体值。未配置设备将继承“默认值”。
                </p>
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="搜索变量..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                    />
                </div>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <button 
                    onClick={handleImportClick}
                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    导入CSV
                </button>
                <button 
                    onClick={handleExport}
                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    导出CSV
                </button>
                <button 
                    onClick={() => onSave(mappings)}
                    className="flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-sm transition-colors ml-2"
                >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    保存配置
                </button>
            </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 border-b border-gray-200 min-w-[180px] sticky left-0 z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            变量名称 (Variable)
                        </th>
                        <th className="px-4 py-3 border-b border-gray-200 min-w-[200px] bg-indigo-50/50">
                            默认值 (Stack Default)
                        </th>
                        {deviceColumns.map(dev => (
                            <th key={dev} className="px-4 py-3 border-b border-gray-200 min-w-[200px]">
                                {dev}
                            </th>
                        ))}
                        {deviceColumns.length === 0 && (
                            <th className="px-4 py-3 border-b border-gray-200 text-gray-400 font-normal italic">
                                (未关联设备)
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredMappings.map((mapping) => {
                        // Inherited value visualization logic
                        const defaultValue = mapping.value;

                        return (
                            <tr key={mapping.variable} className="hover:bg-gray-50 transition-colors group">
                                {/* Variable Name - Sticky Left */}
                                <td className="px-4 py-2 border-r border-gray-100 bg-white group-hover:bg-gray-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-indigo-700 font-bold text-xs">
                                            {mapping.variable}
                                        </span>
                                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]" title={mapping.description}>
                                            {mapping.description || '无描述'}
                                        </span>
                                    </div>
                                </td>

                                {/* Default Value */}
                                <td className="px-4 py-2 bg-indigo-50/10 border-r border-indigo-100">
                                    <input 
                                        type="text" 
                                        value={mapping.value}
                                        onChange={(e) => handleDefaultValueChange(mapping.variable, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-indigo-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono bg-white"
                                        placeholder="未设置"
                                    />
                                </td>

                                {/* Device Values */}
                                {deviceColumns.map(dev => {
                                    const devValue = mapping.deviceValues[dev];
                                    const isInherited = devValue === undefined || devValue === '';
                                    
                                    return (
                                        <td key={dev} className="px-4 py-2 border-r border-gray-100">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={isInherited ? '' : devValue}
                                                    onChange={(e) => handleDeviceValueChange(mapping.variable, dev, e.target.value)}
                                                    className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono transition-colors
                                                        ${isInherited 
                                                            ? 'border-dashed border-gray-300 text-gray-400 bg-transparent placeholder-gray-300' 
                                                            : 'border-green-300 bg-green-50/30 text-gray-800 font-medium'
                                                        }
                                                    `}
                                                    placeholder={defaultValue || '#inherited#'}
                                                />
                                                {/* Visual indicator for inherited vs overridden */}
                                                {!isInherited && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                {deviceColumns.length === 0 && (
                                    <td className="px-4 py-2 text-gray-400 text-xs italic">
                                        无关联设备
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    {filteredMappings.length === 0 && (
                        <tr>
                            <td colSpan={deviceColumns.length + 2} className="px-6 py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                                    <p>未找到变量定义。</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default VariableManager;
