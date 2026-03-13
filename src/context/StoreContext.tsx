import React, { createContext, useContext, useState } from 'react';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  total: number;
  available: number;
  locked: number;
  frozen: number;
  status: string;
};

export type InboundOrder = {
  id: string;
  supplier: string;
  sku: string;
  items: number;
  date: string;
  status: string;
  stage: string;
  location?: string;
};

export type OutboundOrder = {
  id: string;
  customer: string;
  sku: string;
  items: number;
  destination: string;
  status: string;
  stage: string;
  selected: boolean;
  allocationFailed: boolean;
};

const initialInventory: InventoryItem[] = [
  { id: 'SKU-1001', name: '无线蓝牙耳机', category: '电子产品', location: 'A-01-01', total: 1500, available: 1200, locked: 300, frozen: 0, status: '正常' },
  { id: 'SKU-1002', name: '人体工学椅', category: '办公家具', location: 'B-02-04', total: 450, available: 400, locked: 50, frozen: 0, status: '正常' },
  { id: 'SKU-1003', name: '27寸4K显示器', category: '电子产品', location: 'A-02-02', total: 80, available: 0, locked: 80, frozen: 0, status: '缺货' },
  { id: 'SKU-1004', name: '机械键盘', category: '电子产品', location: 'A-01-05', total: 320, available: 300, locked: 20, frozen: 0, status: '正常' },
  { id: 'SKU-1005', name: 'A4打印纸(箱)', category: '办公耗材', location: 'C-01-02', total: 2000, available: 1900, locked: 0, frozen: 100, status: '部分冻结' },
];

const initialInbound: InboundOrder[] = [
  { id: 'ASN-2026-001', supplier: '科技电子供应商', sku: 'SKU-1001', items: 150, date: '2026-03-11', status: '待审核', stage: 'asn' },
  { id: 'ASN-2026-002', supplier: '环球家具制造', sku: 'SKU-1002', items: 45, date: '2026-03-10', status: '待收货', stage: 'receiving' },
  { id: 'ASN-2026-003', supplier: '办公用品批发', sku: 'SKU-1005', items: 500, date: '2026-03-09', status: '待质检', stage: 'qc' },
  { id: 'ASN-2026-004', supplier: '科技电子供应商', sku: 'SKU-1004', items: 200, date: '2026-03-08', status: '待上架', stage: 'putaway', location: 'A-01-05' },
  { id: 'ASN-2026-005', supplier: '本地便利店', sku: 'SKU-1003', items: 80, date: '2026-03-07', status: '已完成', stage: 'done', location: 'B-02-01' },
];

const initialOutbound: OutboundOrder[] = [
  { id: 'SO-2026-892', customer: '顶峰科技有限公司', sku: 'SKU-1001', items: 12, destination: '北京市朝阳区', status: '待分配', stage: 'orders', selected: false, allocationFailed: false },
  { id: 'SO-2026-893', customer: '创星企业', sku: 'SKU-1002', items: 4, destination: '上海市浦东新区', status: '已分配(占用)', stage: 'wave', selected: false, allocationFailed: false },
  { id: 'SO-2026-894', customer: '全球零售连锁', sku: 'SKU-1004', items: 156, destination: '广州市天河区', status: '已发货', stage: 'shipping', selected: false, allocationFailed: false },
  { id: 'SO-2026-895', customer: '本地便利店', sku: 'SKU-1005', items: 2, destination: '深圳市南山区', status: '拣货中', stage: 'picking', selected: false, allocationFailed: false },
  { id: 'SO-2026-896', customer: '华南贸易公司', sku: 'SKU-1001', items: 45, destination: '广州市白云区', status: '复核中', stage: 'review', selected: false, allocationFailed: false },
  { id: 'SO-2026-897', customer: '西部电子', sku: 'SKU-1002', items: 8, destination: '成都市武侯区', status: '已打包', stage: 'packing', selected: false, allocationFailed: false },
  { id: 'SO-2026-898', customer: '测试缺货订单', sku: 'SKU-1003', items: 500, destination: '杭州市西湖区', status: '待分配', stage: 'orders', selected: false, allocationFailed: true },
];

type StoreContextType = {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  inboundOrders: InboundOrder[];
  setInboundOrders: React.Dispatch<React.SetStateAction<InboundOrder[]>>;
  outboundOrders: OutboundOrder[];
  setOutboundOrders: React.Dispatch<React.SetStateAction<OutboundOrder[]>>;
  executePutaway: (orderId: string) => void;
  allocateWave: (orderIds: string[]) => void;
  completePicking: (orderIds: string[]) => void;
  completePacking: (orderIds: string[]) => void;
  executeShipping: (orderId: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [inventory, setInventory] = useState(initialInventory);
  const [inboundOrders, setInboundOrders] = useState(initialInbound);
  const [outboundOrders, setOutboundOrders] = useState(initialOutbound);

  const executePutaway = (orderId: string) => {
    setInboundOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        setInventory(inv => {
          const existing = inv.find(i => i.id === o.sku);
          if (existing) {
            return inv.map(i => i.id === o.sku ? { ...i, total: i.total + o.items, available: i.available + o.items, status: '正常' } : i);
          } else {
            return [...inv, {
              id: o.sku,
              name: '新商品',
              category: '未分类',
              location: o.location || '未分配',
              total: o.items,
              available: o.items,
              locked: 0,
              frozen: 0,
              status: '正常'
            }];
          }
        });
        return { ...o, status: '已完成', stage: 'done' };
      }
      return o;
    }));
  };

  const allocateWave = (orderIds: string[]) => {
    setOutboundOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        if (o.allocationFailed) {
          return { ...o, selected: false };
        }
        
        // Lock inventory
        setInventory(inv => inv.map(i => {
          if (i.id === o.sku) {
            const allocatable = Math.min(i.available, o.items);
            return {
              ...i,
              available: i.available - allocatable,
              locked: i.locked + allocatable
            };
          }
          return i;
        }));
        
        return { ...o, status: '已分配(占用)', stage: 'wave', selected: false };
      }
      return o;
    }));
  };

  const completePicking = (orderIds: string[]) => {
    setOutboundOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        return { ...o, status: '复核中', stage: 'review' };
      }
      return o;
    }));
  };

  const completePacking = (orderIds: string[]) => {
    setOutboundOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        return { ...o, status: '已打包', stage: 'packing' };
      }
      return o;
    }));
  };

  const executeShipping = (orderId: string) => {
    setOutboundOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        setInventory(inv => inv.map(i => {
          if (i.id === o.sku) {
            return { 
              ...i, 
              total: Math.max(0, i.total - o.items), 
              locked: Math.max(0, i.locked - o.items) 
            };
          }
          return i;
        }));
        return { ...o, status: '已发货', stage: 'shipping' };
      }
      return o;
    }));
  };

  return (
    <StoreContext.Provider value={{
      inventory, setInventory,
      inboundOrders, setInboundOrders,
      outboundOrders, setOutboundOrders,
      executePutaway, allocateWave, completePicking, completePacking, executeShipping
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
