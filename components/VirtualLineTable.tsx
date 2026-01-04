
import React from 'react';
import { VirtualLine } from '../types';
import { RefreshCw, Plus, Trash2, Edit2, TrendingUp, MoreHorizontal } from 'lucide-react';

interface VirtualLineTableProps {
  data: VirtualLine[];
  onAdd: () => void;
  onEdit: (vl: VirtualLine) => void;
  onDelete: (id: string) => void;
}

const VirtualLineTable: React.FC<VirtualLineTableProps> = ({ data, onAdd, onEdit, onDelete }) => {
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
                 {/* Remove Delete Button from toolbar for consistency with image or keep? Image 2 shows table header with "Add", "Refresh". 
                     Actually image 2 shows top toolbar with: [Add] | [Delete] | [Refresh] (No, it shows Add, Refresh)
                     Wait, looking closely at image 2: It has "Add" (Icon + Text), vertical bar, "Refresh" (Icon + Text).
                     Let's match that strictly if we want pixel perfection, but standard toolbar is fine.
                  */}
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
              <th className="px-4 py-3 font-semibold border-b w-16">序号</th>
              <th className="px-4 py-3 font-semibold border-b">线路名称</th>
              <th className="px-4 py-3 font-semibold border-b">外出接口</th>
              <th className="px-4 py-3 font-semibold border-b">上行</th>
              <th className="px-4 py-3 font-semibold border-b">下行</th>
              <th className="px-4 py-3 font-semibold border-b text-right">操作</th>
              <th className="px-4 py-3 font-semibold border-b w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? data.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 text-gray-500 text-xs">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer" onClick={() => onEdit(row)}>
                  {row.name}
                </td>
                <td className="px-4 py-3 text-gray-700">{row.outboundInterface}</td>
                <td className="px-4 py-3 text-gray-700">{row.uplink}</td>
                <td className="px-4 py-3 text-gray-700">{row.downlink}</td>
                <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <td className="px-4 py-3 text-center">
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            )) : (
              <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center">
                          <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                          <span className="text-sm">暂无虚拟线路数据</span>
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

export default VirtualLineTable;
