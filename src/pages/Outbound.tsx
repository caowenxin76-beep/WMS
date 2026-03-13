import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { ArrowUpFromLine, Truck, PackageCheck, AlertCircle, Layers, MonitorPlay, CheckCircle2, UserPlus, Lock, FileCheck, XCircle, Smartphone, MapPin, Snowflake, ScanLine, Plus, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Outbound() {
  const { tab } = useParams();
  const activeTab = tab || 'orders';
  const tabTitles: Record<string, string> = {
    'orders': '订单接收',
    'wave': '波次计划',
    'picking': '拣货（摘果 / 播种）',
    'review': '复核',
    'packing': '打包 / 称重',
    'shipping': '发货'
  };

  const { outboundOrders: orders, setOutboundOrders: setOrders, allocateWave, completePicking, completePacking, executeShipping } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showWaveModal, setShowWaveModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const [packProgress, setPackProgress] = useState(0);
  
  // PDA State
  const [showPda, setShowPda] = useState(false);
  const [pdaStep, setPdaStep] = useState(1);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [inventoryFrozen, setInventoryFrozen] = useState(false);
  
  const [showManualModal, setShowManualModal] = useState(false);

  const filteredOrders = orders.filter(o => 
    o.stage === activeTab && 
    (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || o.status === filterStatus)
  );

  // Get unique statuses for the current tab
  const availableStatuses = Array.from(new Set(orders.filter(o => o.stage === activeTab).map(o => o.status)));

  const toggleSelect = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, selected: !o.selected } : o));
  };

  const hasSelected = filteredOrders.some(o => o.selected);

  const handleMergeWave = () => {
    const ordersToAllocate = orders.filter(o => o.selected && !o.allocationFailed);
    
    const orderIdsToAllocate = ordersToAllocate.map(o => o.id);
    allocateWave(orderIdsToAllocate);
    
    setShowWaveModal(false);
  };

  // Keyboard shortcuts for Pack Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPackModal) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        setPackProgress(prev => Math.min(prev + 25, 100));
      } else if (e.key === 'F1') {
        e.preventDefault();
        setPackProgress(0); // Clear
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (packProgress === 100) {
          alert('面单已打印！');
          setShowPackModal(false);
          setPackProgress(0);
          completePacking(orders.filter(o => o.stage === 'review').map(o => o.id));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPackModal, packProgress]);

  const handlePdaScan = () => {
    setScanSuccess(true);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => {
      setScanSuccess(false);
      if (pdaStep === 1) setPdaStep(2);
      else if (pdaStep === 2) setPdaStep(3);
    }, 500);
  };

  const handleFreezeInventory = () => {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setInventoryFrozen(true);
    alert('已冻结该库位库存，并通知调度员！');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">出库管理 - {tabTitles[activeTab] || '订单接收'}</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            手动出库
          </button>
          <button onClick={() => {setShowPda(true); setPdaStep(1); setInventoryFrozen(false);}} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
            <Smartphone className="w-4 h-4" />
            PDA 拣货作业
          </button>
          <button onClick={() => setShowPackModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm">
            <MonitorPlay className="w-4 h-4" />
            复核打包工作站
          </button>
          <button 
            onClick={() => setShowWaveModal(true)}
            disabled={!hasSelected}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm
              ${hasSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Layers className="w-4 h-4" />
            分配库存/波次
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号或客户..."
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
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium w-12"></th>
              <th className="px-6 py-4 font-medium">订单号</th>
              <th className="px-6 py-4 font-medium">客户</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">数量</th>
              <th className="px-6 py-4 font-medium">目的地</th>
              <th className="px-6 py-4 font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  暂无相关单据
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className={`hover:bg-gray-50/50 transition-colors ${order.allocationFailed ? 'bg-rose-50/50' : ''}`} title={order.allocationFailed ? '缺货原因：SKU-1003 缺 500 件' : ''}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={order.selected}
                      onChange={() => toggleSelect(order.id)}
                      disabled={order.status !== '待分配'}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{order.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{order.sku}</td>
                  <td className="px-6 py-4 text-gray-500">{order.items}</td>
                  <td className="px-6 py-4 text-gray-500">{order.destination}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {order.allocationFailed && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      {!order.allocationFailed && order.status === '待分配' && <UserPlus className="w-4 h-4 text-gray-400" />}
                      {order.status === '已分配(占用)' && <Lock className="w-4 h-4 text-blue-500" />}
                      {order.status === '拣货中' && <PackageCheck className="w-4 h-4 text-amber-500" />}
                      {order.status === '复核中' && <FileCheck className="w-4 h-4 text-indigo-500" />}
                      {order.status === '已打包' && <PackageCheck className="w-4 h-4 text-emerald-500" />}
                      {order.status === '已发货' && <Truck className="w-4 h-4 text-emerald-500" />}
                      {order.status === '已关闭' && <XCircle className="w-4 h-4 text-rose-500" />}
                      <span className={`text-sm font-medium
                        ${order.allocationFailed ? 'text-rose-600' :
                          order.status === '待分配' ? 'text-gray-600' : 
                          order.status === '已分配(占用)' ? 'text-blue-700' : 
                          order.status === '拣货中' ? 'text-amber-700' : 
                          order.status === '复核中' ? 'text-indigo-700' : 
                          order.status === '已打包' ? 'text-emerald-700' : 
                          order.status === '已发货' ? 'text-emerald-700' : 
                          'text-rose-700'}`}>
                        {order.allocationFailed ? '分配失败 (缺货)' : order.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Wave Strategy Modal */}
      {showWaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">波次创建策略选择</h2>
            <p className="text-sm text-gray-500 mb-6">系统将在后台锁定(预占)库存，并生成拣货任务。</p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 border border-indigo-200 bg-indigo-50 rounded-xl cursor-pointer">
                <input type="radio" name="strategy" defaultChecked className="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <p className="font-bold text-indigo-900">选项 A：按库位路径最短原则</p>
                  <p className="text-sm text-indigo-700 mt-1">系统自动计算最优行走路径，适合多品多件订单。</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                <input type="radio" name="strategy" className="mt-1 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <p className="font-bold text-gray-900">选项 B：按单品订单合并</p>
                  <p className="text-sm text-gray-500 mt-1">一单一货集中拣选，适合电商爆款快速出库。</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowWaveModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">取消</button>
              <button onClick={handleMergeWave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">确定生成</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PDA Picking Simulator Modal */}
      {showPda && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`w-[360px] h-[700px] bg-gray-900 rounded-[3rem] p-4 border-[8px] border-gray-800 shadow-2xl relative overflow-hidden transition-colors duration-300 ${scanSuccess ? 'bg-emerald-900/50' : ''}`}>
            <div className="bg-gray-50 w-full h-full rounded-[2rem] overflow-hidden flex flex-col relative">
              <div className="bg-blue-600 text-white p-4 text-center font-bold shadow-md">
                NexusWMS PDA - 拣货
              </div>
              
              <div className="flex-1 p-4 flex flex-col">
                {pdaStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">待拣货任务 (路径已优化)</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      <div className="bg-white p-3 rounded-xl border-2 border-blue-500 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-blue-700">1. 库位: A-01-01</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">待拣</span>
                        </div>
                        <p className="text-sm font-mono text-gray-600">SKU-1001 (无线蓝牙耳机)</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">需拣数量: 12</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm opacity-60">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-700">2. 库位: B-02-04</span>
                        </div>
                        <p className="text-sm font-mono text-gray-500">SKU-1002 (人体工学椅)</p>
                        <p className="text-sm font-bold text-gray-700 mt-1">需拣数量: 4</p>
                      </div>
                    </div>
                    <button onClick={handlePdaScan} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4 hover:bg-blue-700 active:scale-95 transition-all">
                      前往第一个库位并扫码
                    </button>
                  </motion.div>
                )}

                {pdaStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                    <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-bold text-lg">A-01-01</span>
                      </div>
                      <p className="text-sm text-gray-700 font-mono">SKU-1001 (无线蓝牙耳机)</p>
                      <p className="text-xl font-bold text-gray-900 mt-2">需拣数量: <span className="text-blue-600">12</span></p>
                    </div>

                    {inventoryFrozen ? (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center mb-4">
                        <Snowflake className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <p className="font-bold text-rose-700">库存已冻结</p>
                        <p className="text-xs text-rose-600 mt-1">已通知调度员重新分配任务</p>
                      </div>
                    ) : (
                      <div className="space-y-4 flex-1">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">扫描商品条码</label>
                          <input type="text" defaultValue="SKU-1001" className="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-100 font-mono" readOnly />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">确认实拣数量</label>
                          <input type="number" defaultValue="12" className="w-full p-3 border-2 border-blue-500 rounded-xl text-lg font-bold outline-none" />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto space-y-3">
                      {!inventoryFrozen && (
                        <>
                          <button onClick={handlePdaScan} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all">
                            确认拣货
                          </button>
                          <button onClick={handleFreezeInventory} className="w-full py-3 bg-white border-2 border-rose-500 text-rose-600 rounded-xl font-bold hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            实物损坏 (库存冻结)
                          </button>
                        </>
                      )}
                      {inventoryFrozen && (
                        <button onClick={() => { setPdaStep(1); setShowPda(false); }} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 active:scale-95 transition-all">
                          结束当前任务
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {pdaStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">拣货完成</h3>
                    <p className="text-sm text-gray-500 mb-8">当前库位任务已完成，请前往下一库位</p>
                    <button onClick={() => { 
                      setPdaStep(1); 
                      setShowPda(false); 
                      completePicking(orders.filter(o => o.stage === 'picking').map(o => o.id));
                    }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all">
                      完成拣货任务
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
            
            <button onClick={() => setShowPda(false)} className="absolute -right-12 top-0 text-white hover:text-gray-300">
              <XCircle className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Pack & Review Workstation Modal */}
      {showPackModal && (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
          <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-3 text-white">
              <MonitorPlay className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold tracking-tight">复核打包工作站 (PC端)</span>
            </div>
            <button onClick={() => setShowPackModal(false)} className="text-gray-400 hover:text-white">退出工作站</button>
          </div>
          
          <div className="flex-1 p-8 flex gap-8">
            <div className="w-1/3 flex flex-col gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-2">扫描拣货筐条码</h3>
                <input type="text" placeholder="等待扫描..." className="w-full bg-gray-900 border-2 border-emerald-500/50 text-white px-4 py-3 rounded-xl font-mono text-lg focus:outline-none focus:border-emerald-500 transition-colors" autoFocus />
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex-1">
                <h3 className="text-gray-400 font-medium mb-4">快捷键操作说明</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center justify-between text-gray-300">
                    <span>模拟扫描商品</span>
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-emerald-400 font-mono">Enter</kbd>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span>清空当前扫描记录</span>
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-white font-mono">F1</kbd>
                  </li>
                  <li className="flex items-center justify-between text-gray-300">
                    <span>打印快递面单</span>
                    <kbd className="bg-gray-700 px-2 py-1 rounded text-white font-mono">F2</kbd>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">波次订单核对进度</h2>
                <span className="text-4xl font-mono font-bold text-emerald-400">{packProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-900 rounded-full h-4 mb-8 overflow-hidden">
                <motion.div 
                  className="bg-emerald-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${packProgress}%` }}
                  transition={{ type: 'spring', stiffness: 50 }}
                />
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4].map((item, index) => {
                  const isScanned = packProgress >= (index + 1) * 25;
                  return (
                    <div key={item} className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300
                      ${isScanned ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-gray-900 border-gray-700'}`}>
                      <div className="flex items-center gap-4">
                        {isScanned ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-600" />}
                        <div>
                          <p className={`font-mono font-bold ${isScanned ? 'text-emerald-400' : 'text-gray-300'}`}>SKU-100{item}</p>
                          <p className="text-sm text-gray-500">无线蓝牙耳机 x1</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isScanned ? 'text-emerald-500' : 'text-gray-500'}`}>
                        {isScanned ? '已核对' : '待扫描'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {packProgress === 100 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-auto bg-indigo-600 text-white p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                  全部变绿！请按 F2 触发面单打印
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Outbound Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">手动创建出库单</h2>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newOrder = {
                id: formData.get('id') as string,
                customer: formData.get('customer') as string,
                items: Number(formData.get('items')),
                sku: formData.get('sku') as string,
                destination: formData.get('destination') as string,
                status: '待分配',
                stage: 'asn',
                selected: false,
                allocationFailed: false
              };
              setOrders([newOrder, ...orders]);
              setShowManualModal(false);
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出库单号</label>
                  <input type="text" name="id" defaultValue={`SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                  <input type="text" name="customer" required placeholder="例如：本地便利店" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU 编码</label>
                  <input type="text" name="sku" required placeholder="例如：SKU-1001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出库数量</label>
                  <input type="number" name="items" required min="1" placeholder="输入需出库总数" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
                  <input type="text" name="destination" required placeholder="例如：北京市朝阳区" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
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
