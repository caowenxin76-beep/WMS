import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Plus, Upload, Download, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const initialData: Record<string, any[]> = {
  'warehouse': [
    { id: 'WH-01', name: '华北一号仓', type: '自营仓', address: '北京市大兴区', status: '启用' },
    { id: 'WH-02', name: '华南分拨中心', type: '中转仓', address: '广州市白云区', status: '启用' },
  ],
  'zone': [
    { id: 'Z-A', name: 'A区-高位货架', warehouse: '华北一号仓', type: '存储区', status: '启用' },
    { id: 'Z-B', name: 'B区-地堆区', warehouse: '华北一号仓', type: '拣货区', status: '启用' },
  ],
  'location': [
    { id: 'A-01-01', zone: 'A区-高位货架', type: '标准库位', capacity: '1000kg', status: '空闲' },
    { id: 'A-01-02', zone: 'A区-高位货架', type: '标准库位', capacity: '1000kg', status: '占用' },
  ],
  'owner': [
    { id: 'OW-001', name: '顶峰科技有限公司', contact: '张三', phone: '13800138000', status: '合作中' },
    { id: 'OW-002', name: '全球零售连锁', contact: '李四', phone: '13900139000', status: '合作中' },
  ],
  'partner': [
    { id: 'PT-001', name: '顺丰速运', type: '承运商', contact: '王五', status: '合作中' },
    { id: 'PT-002', name: '京东物流', type: '承运商', contact: '赵六', status: '合作中' },
  ],
  'order-type': [
    { id: 'OT-01', name: '采购入库', category: '入库', priority: '普通', status: '启用' },
    { id: 'OT-02', name: '销售出库', category: '出库', priority: '高', status: '启用' },
  ]
};

const columnsConfig: Record<string, { key: string, label: string }[]> = {
  'warehouse': [
    { key: 'id', label: '仓库编码' }, { key: 'name', label: '仓库名称' }, { key: 'type', label: '仓库类型' }, { key: 'address', label: '地址' }, { key: 'status', label: '状态' }
  ],
  'zone': [
    { key: 'id', label: '库区编码' }, { key: 'name', label: '库区名称' }, { key: 'warehouse', label: '所属仓库' }, { key: 'type', label: '库区类型' }, { key: 'status', label: '状态' }
  ],
  'location': [
    { key: 'id', label: '库位编码' }, { key: 'zone', label: '所属库区' }, { key: 'type', label: '库位类型' }, { key: 'capacity', label: '承重/容量' }, { key: 'status', label: '状态' }
  ],
  'owner': [
    { key: 'id', label: '货主编码' }, { key: 'name', label: '货主名称' }, { key: 'contact', label: '联系人' }, { key: 'phone', label: '联系电话' }, { key: 'status', label: '状态' }
  ],
  'partner': [
    { key: 'id', label: '单位编码' }, { key: 'name', label: '单位名称' }, { key: 'type', label: '单位类型' }, { key: 'contact', label: '联系人' }, { key: 'status', label: '状态' }
  ],
  'order-type': [
    { key: 'id', label: '类型编码' }, { key: 'name', label: '类型名称' }, { key: 'category', label: '业务大类' }, { key: 'priority', label: '默认优先级' }, { key: 'status', label: '状态' }
  ]
};

export function MasterData() {
  const { tab } = useParams();
  const activeTab = tab || 'warehouse';
  
  const tabTitles: Record<string, string> = {
    'warehouse': '仓库管理',
    'zone': '库区管理',
    'location': '库位管理',
    'owner': '货主管理',
    'partner': '往来单位',
    'order-type': '订单类型'
  };

  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  const currentData = data[activeTab] || [];
  const columns = columnsConfig[activeTab] || [];

  const filteredData = currentData.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newItem: any = {};
    columns.forEach(col => {
      newItem[col.key] = formData.get(col.key);
    });

    if (isAdding) {
      setData({ ...data, [activeTab]: [...currentData, newItem] });
    } else {
      setData({ ...data, [activeTab]: currentData.map(item => item.id === editingItem.id ? newItem : item) });
    }
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDelete = () => {
    setData({ ...data, [activeTab]: currentData.filter(item => item.id !== deletingItem.id) });
    setDeletingItem(null);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate import
    alert('导入成功！');
    setIsImporting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">基础数据 - {tabTitles[activeTab]}</h1>
        <div className="flex gap-3">
          <button onClick={() => setIsImporting(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Upload className="w-4 h-4" />
            批量导入
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            新增记录
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-4 font-medium">{col.label}</th>
              ))}
              <th className="px-6 py-4 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">暂无数据</td></tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-6 py-4 ${col.key === 'id' ? 'font-mono text-indigo-600 font-medium' : 'text-gray-700'}`}>
                      {item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingItem(item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="编辑">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingItem(item)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{isAdding ? '新增记录' : '编辑记录'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {columns.map(col => (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{col.label}</label>
                    <input 
                      type="text" 
                      name={col.key} 
                      defaultValue={editingItem ? editingItem[col.key] : ''} 
                      required 
                      readOnly={!isAdding && col.key === 'id'}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isAdding && col.key === 'id' ? 'bg-gray-50 text-gray-500' : ''}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">保存</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Import Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">批量导入</h2>
              <button onClick={() => setIsImporting(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleImport}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">点击或拖拽文件到此处</p>
                <p className="text-xs text-gray-500">支持 .xlsx, .xls, .csv 格式</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsImporting(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">开始导入</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border-t-4 border-rose-500">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">确认删除</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">您确定要删除该记录吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingItem(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">确认删除</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
