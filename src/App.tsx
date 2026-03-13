/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Reports } from './pages/Reports';
import { MasterData } from './pages/MasterData';
import { Inventory } from './pages/Inventory';
import { Inbound } from './pages/Inbound';
import { Outbound } from './pages/Outbound';
import { StoreProvider } from './context/StoreContext';

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/reports/inventory" replace />} />
                <Route path="/reports" element={<Navigate to="/reports/inventory" replace />} />
                <Route path="/reports/:tab" element={<Reports />} />
                <Route path="/master-data" element={<Navigate to="/master-data/warehouse" replace />} />
                <Route path="/master-data/:tab" element={<MasterData />} />
                <Route path="/inventory" element={<Navigate to="/inventory/realtime" replace />} />
                <Route path="/inventory/:tab" element={<Inventory />} />
                <Route path="/inbound" element={<Navigate to="/inbound/asn" replace />} />
                <Route path="/inbound/:tab" element={<Inbound />} />
                <Route path="/outbound" element={<Navigate to="/outbound/orders" replace />} />
                <Route path="/outbound/:tab" element={<Outbound />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </StoreProvider>
  );
}
