import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Filter, Download } from 'lucide-react';

const inventoryData = [
  { name: '电子产品', value: 4000 },
  { name: '办公家具', value: 3000 },
  { name: '日用百货', value: 2000 },
  { name: '生鲜食品', value: 1000 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

const inboundData = [
  { date: '03-01', volume: 120 },
  { date: '03-02', volume: 150 },
  { date: '03-03', volume: 180 },
  { date: '03-04', volume: 140 },
  { date: '03-05', volume: 200 },
  { date: '03-06', volume: 250 },
  { date: '03-07', volume: 220 },
];

const outboundData = [
  { date: '03-01', volume: 100 },
  { date: '03-02', volume: 130 },
  { date: '03-03', volume: 160 },
  { date: '03-04', volume: 190 },
  { date: '03-05', volume: 150 },
  { date: '03-06', volume: 210 },
  { date: '03-07', volume: 240 },
];

const reviewData = [
  { name: '张三', passed: 400, failed: 24 },
  { name: '李四', passed: 300, failed: 13 },
  { name: '王五', passed: 200, failed: 8 },
  { name: '赵六', passed: 278, failed: 39 },
];

const historyData = [
  { month: '10月', inventory: 4000 },
  { month: '11月', inventory: 3000 },
  { month: '12月', inventory: 2000 },
  { month: '1月', inventory: 2780 },
  { month: '2月', inventory: 1890 },
  { month: '3月', inventory: 2390 },
];

const floorPlanData = [
  { id: 'A-01', status: 'full', capacity: '100%' },
  { id: 'A-02', status: 'partial', capacity: '60%' },
  { id: 'A-03', status: 'empty', capacity: '0%' },
  { id: 'A-04', status: 'full', capacity: '95%' },
  { id: 'B-01', status: 'partial', capacity: '40%' },
  { id: 'B-02', status: 'empty', capacity: '0%' },
  { id: 'B-03', status: 'partial', capacity: '75%' },
  { id: 'B-04', status: 'full', capacity: '100%' },
  { id: 'C-01', status: 'empty', capacity: '0%' },
  { id: 'C-02', status: 'empty', capacity: '0%' },
  { id: 'C-03', status: 'partial', capacity: '30%' },
  { id: 'C-04', status: 'full', capacity: '90%' },
];

export function Reports() {
  const { tab } = useParams();
  const activeTab = tab || 'inventory';

  const tabTitles: Record<string, string> = {
    'inventory': '库存报表',
    'inbound': '入库报表',
    'outbound': '出库报表',
    'review': '复核报表',
    'location-flow': '库位流水',
    'history': '历史库存',
    'floor-plan': '库位平面图'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">报表 - {tabTitles[activeTab]}</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Filter className="w-4 h-4" />
            筛选条件
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-1 flex flex-col">
        {activeTab === 'inventory' && (
          <div className="flex-1 flex flex-col md:flex-row gap-8">
            <div className="flex-1 h-[400px]">
              <h3 className="text-lg font-bold text-gray-800 mb-4">库存分类占比</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={inventoryData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    fill="#8884d8" 
                    paddingAngle={5} 
                    dataKey="value" 
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} 件`, '库存量']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 h-[400px]">
              <h3 className="text-lg font-bold text-gray-800 mb-4">各分类库存量</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'inbound' && (
          <div className="flex-1 h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">近7天入库趋势</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inboundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'outbound' && (
          <div className="flex-1 h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">近7天出库趋势</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outboundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="flex-1 h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">员工复核效率与异常统计</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="passed" name="复核通过" stackId="a" fill="#10b981" />
                <Bar dataKey="failed" name="复核异常" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">历史库存走势</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="inventory" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'floor-plan' && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded"></div><span className="text-sm text-gray-600">满载 (&gt;90%)</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-400 rounded"></div><span className="text-sm text-gray-600">部分使用</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div><span className="text-sm text-gray-600">空闲</span></div>
            </div>
            <div className="grid grid-cols-4 gap-4 flex-1">
              {floorPlanData.map(loc => (
                <div key={loc.id} className={`rounded-xl border-2 p-4 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer
                  ${loc.status === 'full' ? 'bg-rose-50 border-rose-200' : loc.status === 'partial' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800">{loc.id}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full
                      ${loc.status === 'full' ? 'bg-rose-200 text-rose-800' : loc.status === 'partial' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'}
                    `}>{loc.capacity}</span>
                  </div>
                  <div className="mt-4 w-full bg-white rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${loc.status === 'full' ? 'bg-rose-500' : loc.status === 'partial' ? 'bg-amber-400' : 'bg-gray-300'}`} style={{ width: loc.capacity }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'location-flow' && (
          <div className="flex-1 overflow-auto">
             <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">时间</th>
                  <th className="px-6 py-4 font-medium">库位</th>
                  <th className="px-6 py-4 font-medium">操作类型</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">数量变化</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">2026-03-11 10:00</td>
                  <td className="px-6 py-4 font-bold text-gray-900">A-01-01</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">入库上架</td>
                  <td className="px-6 py-4 font-mono text-gray-500">SKU-1001</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">+50</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">2026-03-11 09:30</td>
                  <td className="px-6 py-4 font-bold text-gray-900">B-02-04</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">出库下架</td>
                  <td className="px-6 py-4 font-mono text-gray-500">SKU-1002</td>
                  <td className="px-6 py-4 font-bold text-rose-600">-10</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">2026-03-10 15:20</td>
                  <td className="px-6 py-4 font-bold text-gray-900">C-01-02</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">库内调拨</td>
                  <td className="px-6 py-4 font-mono text-gray-500">SKU-1005</td>
                  <td className="px-6 py-4 font-bold text-blue-600">+20</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
