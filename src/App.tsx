import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import DanhSachBienNhanPage from './pages/DanhSachBienNhanPage';
import ThongKePage from './pages/ThongKePage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bien-nhan" element={<DanhSachBienNhanPage />} />
          <Route path="thong-ke" element={<ThongKePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;