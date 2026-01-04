
import React, { useState } from 'react';
import { NetworkZone } from '../types';
import { RefreshCw, Plus, Trash2, Edit2 } from 'lucide-react';

interface ZoneTableProps {
  data: NetworkZone[];
  onAdd: () => void;
  onEdit: (zone: NetworkZone) => void;
  onDelete: (id: string) => void;
}

const ZoneTable: React.FC<ZoneTableProps> = ({ data, onAdd, onEdit, onDelete }) => {
  return (
    <div className="flex-1 bg-white flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center space-x-4 text-sm justify-between shrink-0">
        <div className="flex items-center space-x-4">
            <div className="flex space-x-3">
                 <button 
                    onClick={onAdd}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                 >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> 新增
                 </button>
                 <button 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center px-3 py-1.5 rounded shadow-sm transition-all text-xs font-medium"
                 >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
                 </button>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <button className="flex items-center text-gray-600 hover:text-blue-600 text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> 刷新
            </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white relative">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold border-b w-10">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 font-semibold border-b">区域名称</th>
              <th className="px-4 py-3 font-semibold border-b">区域类型</th>
              <th className="px-4 py-3 font-semibold border-b">接口列表</th>
              <th className="px-4 py-3 font-semibold border-b text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer" onClick={() => onEdit(row)}>
                  {row.name}
                </td>
                <td className="px-4 py-3">
                    {row.type === 'L3' ? '三层区域' : row.type === 'L2' ? '二层区域' : '虚拟网线区域'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                    {row.interfaces.length > 0 ? row.interfaces.join(', ') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-3">
                        <button 
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            onClick={() => onEdit(row)}
                        >
                            编辑
                        </button>
                        <button 
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                            onClick={() => onDelete(row.id)}
                        >
                            删除
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZoneTable;
