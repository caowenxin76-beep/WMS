import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Box, Lock, CheckCircle2, AlertOctagon, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const initialBatches = [
  { id: 'BAT-20260101', sku: 'SKU-1001', name: '无线蓝牙耳机', mfgDate: '2025-12-01', expDate: '2027-12-01', qty: 200 },
  { id: 'BAT-20260102', sku: 'SKU-1001', name: '无线蓝牙耳机', mfgDate: '2026-01-15', expDate: '2028-01-15', qty: 250 },
  { id: 'BAT-20251105', sku: 'SKU-1005', name: '27寸4K显示器', mfgDate: '2025-11-05', expDate: '2030-11-05', qty: 34 },
];

const initialAlerts = [
  { id: 'ALT-001', sku: 'SKU-1002', name: '人体工学椅', type: '低库存', threshold: 20, current: 12, status: '未处理' },
  { id: 'ALT-002', sku: 'SKU-1003', name: '机械键盘', type: '缺货', threshold: 10, current: 0, status: '已通知采购' },
  { id: 'ALT-003', sku: 'SKU-1001', name: '无线蓝牙耳机', type: '效期预警', threshold: 30, current: 450, status: '观察中' },
];

const initialLedger = [
  { id: 'LOG-001', date: '2026-03-10 14:30', type: '入库', sku: 'SKU-1001', qty: 50, operator: '张三', remark: '采购入库 (PO-2026-001)' },
  { id: 'LOG-002', date: '2026-03-11 09:15', type: '出库', sku: 'SKU-1002', qty: -2, operator: '李四', remark: '销售出库 (SO-2026-892)' },
  { id: 'LOG-003', date: '2026-03-11 10:05', type: '调拨', sku: 'SKU-1004', qty: 0, operator: '王五', remark: '从 A-01-05 移至 B-01-01' },
];

export function Inventory() {
  const { tab } = useParams();
  const activeTab = tab || 'realtime';
  const tabTitles: Record<string, string> = {
    'realtime': '实时库存',
    'batch': '批次 / 效期 / 序列号',
    'alerts': '库存预警',
    'ledger': '库存台账'
  };

  const { inventory, setInventory } = useStore();
  const [batches, setBatches] = useState(initialBatches);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [ledger, setLedger] = useState(initialLedger);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'inventory' | 'batch' | 'alert' | 'ledger' | null>(null);

  const openEdit = (item: any, type: 'inventory' | 'batch' | 'alert' | 'ledger') => {
    setEditingItem(item);
    setEditType(type);
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditType(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    if (editType === 'inventory') {
      const updated = {
        ...editingItem,
        name: formData.get('name'),
        category: formData.get('category'),
        total: Number(formData.get('total')),
        available: Number(formData.get('available')),
        locked: Number(formData.get('locked')),
        frozen: Number(formData.get('frozen')),
        location: formData.get('location'),
        status: formData.get('status'),
      };
      setInventory(inventory.map(i => i.id === editingItem.id ? updated : i));
    } else if (editType === 'batch') {
      const updated = {
        ...editingItem,
        expDate: formData.get('expDate'),
        qty: Number(formData.get('qty')),
      };
      setBatches(batches.map(i => i.id === editingItem.id ? updated : i));
    } else if (editType === 'alert') {
      const updated = {
        ...editingItem,
        threshold: Number(formData.get('threshold')),
        status: formData.get('status'),
      };
      setAlerts(alerts.map(i => i.id === editingItem.id ? updated : i));
    } else if (editType === 'ledger') {
      const updated = {
        ...editingItem,
        remark: formData.get('remark'),
      };
      setLedger(ledger.map(i => i.id === editingItem.id ? updated : i));
    }
    closeEdit();
  };

  const filterData = (data: any[]) => data.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInventory = filterData(inventory);
  const filteredBatches = filterData(batches);
  const filteredAlerts = filterData(alerts);
  const filteredLedger = filterData(ledger);

  const totalInventory = inventory.reduce((sum, item) => sum + item.total, 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);
  const totalLocked = inventory.reduce((sum, item) => sum + item.locked, 0);
  const totalFrozen = inventory.reduce((sum, item) => sum + item.frozen, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">库存管理 - {tabTitles[activeTab] || '实时库存'}</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            新增记录
          </button>
        </div>
      </div>

      {activeTab === 'realtime' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><Box className="w-6 h-6" /></div>
            <div><p className="text-sm font-medium text-gray-500">总库存 (Total)</p><p className="text-2xl font-bold text-gray-900">{totalInventory}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
            <div><p className="text-sm font-medium text-gray-500">可用 (Available)</p><p className="text-2xl font-bold text-gray-900">{totalAvailable}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><Lock className="w-6 h-6" /></div>
            <div><p className="text-sm font-medium text-gray-500">锁定 (待拣/待上架)</p><p className="text-2xl font-bold text-gray-900">{totalLocked}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600"><AlertOctagon className="w-6 h-6" /></div>
            <div><p className="text-sm font-medium text-gray-500">冻结 (质检/损坏)</p><p className="text-2xl font-bold text-gray-900">{totalFrozen}</p></div>
          </div>
        </div>
      )}

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
        
        {activeTab === 'realtime' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">SKU编码</th>
                <th className="px-6 py-4 font-medium">物料名称</th>
                <th className="px-6 py-4 font-medium">分类</th>
                <th className="px-6 py-4 font-medium">总库存</th>
                <th className="px-6 py-4 font-medium text-emerald-600">可用</th>
                <th className="px-6 py-4 font-medium text-amber-600">锁定</th>
                <th className="px-6 py-4 font-medium text-rose-600">冻结</th>
                <th className="px-6 py-4 font-medium">所在库位</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.total}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{item.available}</td>
                  <td className="px-6 py-4 font-medium text-amber-600">{item.locked}</td>
                  <td className="px-6 py-4 font-medium text-rose-600">{item.frozen}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{item.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.status === '正常' ? 'bg-emerald-100 text-emerald-800' : 
                        item.status === '低库存' ? 'bg-amber-100 text-amber-800' : 
                        item.status === '部分冻结' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(item, 'inventory')} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="编辑">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'batch' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">批次号</th>
                <th className="px-6 py-4 font-medium">SKU编码</th>
                <th className="px-6 py-4 font-medium">物料名称</th>
                <th className="px-6 py-4 font-medium">生产日期</th>
                <th className="px-6 py-4 font-medium">有效期至</th>
                <th className="px-6 py-4 font-medium">批次数量</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{item.id}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.mfgDate}</td>
                  <td className="px-6 py-4 text-gray-500">{item.expDate}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.qty}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(item, 'batch')} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'alerts' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">预警编号</th>
                <th className="px-6 py-4 font-medium">SKU编码</th>
                <th className="px-6 py-4 font-medium">物料名称</th>
                <th className="px-6 py-4 font-medium">预警类型</th>
                <th className="px-6 py-4 font-medium">预警阈值</th>
                <th className="px-6 py-4 font-medium">当前数值</th>
                <th className="px-6 py-4 font-medium">处理状态</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAlerts.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{item.id}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">{item.type}</td>
                  <td className="px-6 py-4 text-gray-500">{item.threshold}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.current}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === '未处理' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(item, 'alert')} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'ledger' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">流水号</th>
                <th className="px-6 py-4 font-medium">时间</th>
                <th className="px-6 py-4 font-medium">操作类型</th>
                <th className="px-6 py-4 font-medium">SKU编码</th>
                <th className="px-6 py-4 font-medium">数量变更</th>
                <th className="px-6 py-4 font-medium">操作人</th>
                <th className="px-6 py-4 font-medium">备注</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLedger.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.type}</td>
                  <td className="px-6 py-4 font-mono text-indigo-600">{item.sku}</td>
                  <td className={`px-6 py-4 font-bold ${item.qty > 0 ? 'text-emerald-600' : item.qty < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                    {item.qty > 0 ? `+${item.qty}` : item.qty}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.operator}</td>
                  <td className="px-6 py-4 text-gray-500">{item.remark}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(item, 'ledger')} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editType === 'inventory' ? '编辑库存物料' : 
                 editType === 'batch' ? '编辑批次信息' : 
                 editType === 'alert' ? '处理库存预警' : '编辑台账备注'}
              </h2>
              <button type="button" onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              {editType === 'inventory' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU编码 (只读)</label><input type="text" defaultValue={editingItem.id} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">物料名称</label><input type="text" name="name" defaultValue={editingItem.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><input type="text" name="category" defaultValue={editingItem.category} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">所在库位</label><input type="text" name="location" defaultValue={editingItem.location} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">总库存</label><input type="number" name="total" defaultValue={editingItem.total} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">可用库存</label><input type="number" name="available" defaultValue={editingItem.available} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">锁定库存</label><input type="number" name="locked" defaultValue={editingItem.locked} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">冻结库存</label><input type="number" name="frozen" defaultValue={editingItem.frozen} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select name="status" defaultValue={editingItem.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="正常">正常</option>
                      <option value="低库存">低库存</option>
                      <option value="缺货">缺货</option>
                      <option value="部分冻结">部分冻结</option>
                    </select>
                  </div>
                </div>
              )}
              {editType === 'batch' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">批次号</label><input type="text" defaultValue={editingItem.id} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">有效期至</label><input type="date" name="expDate" defaultValue={editingItem.expDate} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">批次数量</label><input type="number" name="qty" defaultValue={editingItem.qty} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                </div>
              )}
              {editType === 'alert' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">预警编号</label><input type="text" defaultValue={editingItem.id} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">预警阈值</label><input type="number" name="threshold" defaultValue={editingItem.threshold} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">处理状态</label>
                    <select name="status" defaultValue={editingItem.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="未处理">未处理</option>
                      <option value="观察中">观察中</option>
                      <option value="已通知采购">已通知采购</option>
                      <option value="已解决">已解决</option>
                    </select>
                  </div>
                </div>
              )}
              {editType === 'ledger' && (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">流水号</label><input type="text" defaultValue={editingItem.id} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea name="remark" defaultValue={editingItem.remark} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEdit} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">保存更改</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
