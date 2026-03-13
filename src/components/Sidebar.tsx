import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Package, ArrowDownToLine, ArrowUpFromLine, Database, ChevronDown, ChevronRight, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { 
    name: '报表', 
    path: '/reports', 
    icon: BarChart2,
    subItems: [
      { name: '库存报表', path: '/reports/inventory' },
      { name: '入库报表', path: '/reports/inbound' },
      { name: '出库报表', path: '/reports/outbound' },
      { name: '复核报表', path: '/reports/review' },
      { name: '库位流水', path: '/reports/location-flow' },
      { name: '历史库存', path: '/reports/history' },
      { name: '库位平面图', path: '/reports/floor-plan' },
    ]
  },
  { 
    name: '基础数据', 
    path: '/master-data', 
    icon: Database,
    subItems: [
      { name: '仓库管理', path: '/master-data/warehouse' },
      { name: '库区管理', path: '/master-data/zone' },
      { name: '库位管理', path: '/master-data/location' },
      { name: '货主管理', path: '/master-data/owner' },
      { name: '往来单位', path: '/master-data/partner' },
      { name: '订单类型', path: '/master-data/order-type' },
    ]
  },
  { 
    name: '入库管理', 
    path: '/inbound', 
    icon: ArrowDownToLine,
    subItems: [
      { name: '预约收货', path: '/inbound/asn' },
      { name: '收货 / 验收', path: '/inbound/receiving' },
      { name: '质检 (QC)', path: '/inbound/qc' },
      { name: '上架策略 & 执行', path: '/inbound/putaway' },
    ]
  },
  { 
    name: '出库管理', 
    path: '/outbound', 
    icon: ArrowUpFromLine,
    subItems: [
      { name: '订单接收', path: '/outbound/orders' },
      { name: '波次计划', path: '/outbound/wave' },
      { name: '拣货（摘果 / 播种）', path: '/outbound/picking' },
      { name: '复核', path: '/outbound/review' },
      { name: '打包 / 称重', path: '/outbound/packing' },
      { name: '发货', path: '/outbound/shipping' },
    ]
  },
  { 
    name: '库存管理', 
    path: '/inventory', 
    icon: Package,
    subItems: [
      { name: '实时库存', path: '/inventory/realtime' },
      { name: '批次 / 效期 / 序列号', path: '/inventory/batch' },
      { name: '库存预警', path: '/inventory/alerts' },
      { name: '库存台账', path: '/inventory/ledger' },
    ]
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    '/reports': location.pathname.startsWith('/reports'),
    '/master-data': location.pathname.startsWith('/master-data'),
    '/inbound': location.pathname.startsWith('/inbound'),
    '/outbound': location.pathname.startsWith('/outbound'),
    '/inventory': location.pathname.startsWith('/inventory')
  });

  useEffect(() => {
    if (location.pathname.startsWith('/reports')) setExpandedMenus(prev => ({ ...prev, '/reports': true }));
    if (location.pathname.startsWith('/master-data')) setExpandedMenus(prev => ({ ...prev, '/master-data': true }));
    if (location.pathname.startsWith('/inbound')) setExpandedMenus(prev => ({ ...prev, '/inbound': true }));
    if (location.pathname.startsWith('/outbound')) setExpandedMenus(prev => ({ ...prev, '/outbound': true }));
    if (location.pathname.startsWith('/inventory')) setExpandedMenus(prev => ({ ...prev, '/inventory': true }));
  }, [location.pathname]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-indigo-600">
          <Package className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">NexusWMS</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.subItems && location.pathname.startsWith(item.path));
          const isExpanded = expandedMenus[item.path];

          return (
            <div key={item.name} className="flex flex-col">
              {item.subItems ? (
                <button
                  onClick={() => {
                    toggleMenu(item.path);
                    if (!isExpanded) {
                      navigate(item.subItems[0].path);
                    }
                  }}
                  className={twMerge(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    twMerge(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              )}

              {/* Submenus */}
              <AnimatePresence>
                {item.subItems && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          className={({ isActive }) =>
                            twMerge(
                              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            )
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            管
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">管理员</span>
            <span className="text-xs text-gray-500">admin@nexuswms.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
