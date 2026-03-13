import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowDownToLine, CheckCircle2, Clock, XCircle, Smartphone, ScanLine, AlertTriangle, FileEdit, FileCheck, ArrowUpCircle, EyeOff, RefreshCcw, Plus, ClipboardList, ShieldCheck, PackageOpen, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Inbound() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'asn';

  const { inboundOrders: orders, setInboundOrders: setOrders, executePutaway: storeExecutePutaway } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPda, setShowPda] = useState(false);
  
  // PDA State
  const [pdaStep, setPdaStep] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isBlindReceiving, setIsBlindReceiving] = useState(false);
  const [scannedQty, setScannedQty] = useState(0);
  const [currentPdaOrder, setCurrentPdaOrder] = useState<any>(null);

  const qtyInputRef = useRef<HTMLInputElement>(null);

  const tabTitles: Record<string, string> = {
    'asn': '预约收货',
    'receiving': '收货 / 验收',
    'qc': '质检 (QC)',
    'putaway': '上架策略 & 执行'
  };

  const filteredOrders = orders.filter(o => 
    o.stage === activeTab && 
    (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || o.status === filterStatus)
  );

  // Get unique statuses for the current tab
  const availableStatuses = Array.from(new Set(orders.filter(o => o.stage === activeTab).map(o => o.status)));

  // Actions
  const approveAsn = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: '待收货', stage: 'receiving' } : o));
  };

  const startReceiving = (order: any) => {
    setCurrentPdaOrder(order);
    setShowPda(true);
    setPdaStep(1);
    setScannedQty(0);
  };

  const passQc = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: '待上架', stage: 'putaway', location: `A-${Math.floor(Math.random()*10).toString().padStart(2,'0')}-01` } : o));
  };

  const failQc = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: '质检异常', stage: 'done' } : o));
  };

  const executePutaway = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: '已完成', stage: 'done' } : o));
    const orderToPutaway = orders.find(o => o.id === id);
    if (orderToPutaway) {
      storeExecutePutaway(orderToPutaway);
    }
  };

  // PDA Handlers
  const handlePdaScan = () => {
    setScanSuccess(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setScanSuccess(false), 500);
    setTimeout(() => setPdaStep(pdaStep + 1), 600);
  };

  const handleSkuScan = () => {
    setScanSuccess(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setScannedQty(prev => prev + 1);
    setTimeout(() => setScanSuccess(false), 300);
  };

  const handleQtySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt((e.target as any).qty.value);
    if (!isBlindReceiving && currentPdaOrder && qty > currentPdaOrder.items) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setShowWarning(true);
    } else {
      finishReceiving();
    }
  };

  const finishReceiving = () => {
    if (currentPdaOrder) {
      setOrders(orders.map(o => o.id === currentPdaOrder.id ? { ...o, items: scannedQty, status: '待质检', stage: 'qc' } : o));
    }
    setShowPda(false);
    setShowWarning(false);
  };

  useEffect(() => {
    if (pdaStep === 2 && qtyInputRef.current) {
      qtyInputRef.current.focus();
    }
  }, [pdaStep]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">入库管理 - {tabTitles[activeTab] || '预约收货'}</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            手动入库
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索单号或供应商..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">全部状态</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">单号</th>
                <th className="px-6 py-4 font-medium">供应商</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">数量</th>
                <th className="px-6 py-4 font-medium">日期</th>
                <th className="px-6 py-4 font-medium">状态</th>
                {activeTab === 'putaway' && <th className="px-6 py-4 font-medium">推荐库位</th>}
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      暂无相关单据
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={order.id} 
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{order.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{order.supplier}</td>
                      <td className="px-6 py-4 font-mono text-gray-500">{order.sku}</td>
                      <td className="px-6 py-4 text-gray-500">{order.items}</td>
                      <td className="px-6 py-4 text-gray-500">{order.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                          ${order.status.includes('异常') ? 'bg-rose-100 text-rose-700' : 
                            order.status === '已完成' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-blue-50 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      {activeTab === 'putaway' && (
                        <td className="px-6 py-4 font-mono font-medium text-gray-700">
                          {order.location}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        {activeTab === 'asn' && (
                          <button onClick={() => approveAsn(order.id)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            审核通过
                          </button>
                        )}
                        {activeTab === 'receiving' && (
                          <button onClick={() => startReceiving(order)} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 ml-auto">
                            <Smartphone className="w-4 h-4" />
                            PDA 收货
                          </button>
                        )}
                        {activeTab === 'qc' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => failQc(order.id)} className="text-rose-600 hover:text-rose-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                              异常/拒收
                            </button>
                            <button onClick={() => passQc(order.id)} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                              质检通过
                            </button>
                          </div>
                        )}
                        {activeTab === 'putaway' && (
                          <button onClick={() => executePutaway(order.id)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            确认上架
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* PDA Simulator Modal */}
      {showPda && currentPdaOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`w-[360px] h-[700px] bg-gray-900 rounded-[3rem] p-4 border-[8px] border-gray-800 shadow-2xl relative overflow-hidden transition-colors duration-300 ${scanSuccess ? 'bg-emerald-900/50' : ''}`}>
            {/* PDA Screen */}
            <div className="bg-gray-50 w-full h-full rounded-[2rem] overflow-hidden flex flex-col relative">
              <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
                <span className="font-bold">NexusWMS PDA</span>
                <button 
                  onClick={() => setIsBlindReceiving(!isBlindReceiving)}
                  className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${isBlindReceiving ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-indigo-100'}`}
                >
                  <EyeOff className="w-3 h-3" />
                  盲收模式
                </button>
              </div>
              
              <div className="flex-1 p-4 flex flex-col">
                {pdaStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                    <ScanLine className="w-16 h-16 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">收货清点</h3>
                    <p className="text-sm text-gray-500 mb-8">请扫描单号条码</p>
                    <button onClick={handlePdaScan} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all">
                      模拟扫码 ({currentPdaOrder.id})
                    </button>
                  </motion.div>
                )}

                {pdaStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                    <div className="bg-indigo-50 p-3 rounded-lg mb-4 border border-indigo-100">
                      <p className="text-xs text-indigo-600 font-bold">当前单号: {currentPdaOrder.id}</p>
                      {!isBlindReceiving && <p className="text-sm text-gray-900">预报数量: {currentPdaOrder.items}</p>}
                      {isBlindReceiving && <p className="text-sm text-rose-600 font-bold">盲收模式：不显示预报数量</p>}
                    </div>
                    <form onSubmit={handleQtySubmit} className="space-y-4 flex-1 flex flex-col">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">扫描 SKU 条码 (可重复扫码累加)</label>
                        <div className="flex gap-2">
                          <input type="text" defaultValue="SKU-1001" className="flex-1 p-3 border-2 border-gray-300 rounded-xl bg-gray-100 font-mono" readOnly />
                          <button type="button" onClick={handleSkuScan} className="px-4 bg-indigo-100 text-indigo-700 rounded-xl font-bold active:scale-95 transition-transform">
                            扫码+1
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">输入实收数量</label>
                        <input 
                          type="number" 
                          name="qty" 
                          ref={qtyInputRef}
                          value={scannedQty || ''}
                          onChange={(e) => setScannedQty(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full p-3 border-2 border-indigo-500 rounded-xl text-lg font-bold outline-none" 
                        />
                      </div>
                      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mt-auto hover:bg-indigo-700 active:scale-95 transition-all">
                        确认收货
                      </button>
                    </form>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Warning Modal Overlay inside PDA */}
            {showWarning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                <motion.div animate={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }} className="bg-white rounded-xl p-5 w-full border-t-4 border-rose-500 shadow-2xl">
                  <div className="flex items-center gap-2 text-rose-600 mb-3">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-bold">超收警告</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">实收数量 ({scannedQty}) 大于预报数量 ({currentPdaOrder.items})，请确认是否继续？(需主管权限)</p>
                  <button onClick={finishReceiving} className="w-full py-3 bg-rose-600 text-white rounded-lg font-bold active:scale-95 transition-transform">
                    知道了 (强制继续)
                  </button>
                </motion.div>
              </div>
            )}
            
            {/* Close PDA button */}
            <button onClick={() => setShowPda(false)} className="absolute -right-12 top-0 text-white hover:text-gray-300">
              <XCircle className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Inbound Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">手动创建入库单</h2>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newOrder = {
                id: formData.get('id') as string,
                supplier: formData.get('supplier') as string,
                sku: formData.get('sku') as string,
                items: Number(formData.get('items')),
                date: formData.get('date') as string,
                status: '待审核',
                stage: 'asn'
              };
              setOrders([newOrder, ...orders]);
              setShowManualModal(false);
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
                  <input type="text" name="id" defaultValue={`ASN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">供应商</label>
                  <input type="text" name="supplier" required placeholder="例如：本地供应商" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU 编码</label>
                  <input type="text" name="sku" required placeholder="例如：SKU-1001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预报数量</label>
                  <input type="number" name="items" required min="1" placeholder="输入预计收货数量" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预计到货时间</label>
                  <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowManualModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">确认创建</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
