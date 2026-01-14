import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import DanhSachBienNhanPage from './pages/DanhSachBienNhanPage';
import ThongKePage from './pages/ThongKePage';
import ReceiptFormPage from './pages/ReceiptFormPage';
import LoginPage from './pages/auth/LoginPage';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes: Yêu cầu đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="bien-nhan" element={<DanhSachBienNhanPage />} />
            {/* Sử dụng key để ép React remount component khi chuyển route, giúp reset state hoàn toàn */}
            <Route path="create-receipt" element={<ReceiptFormPage key="create" mode="create" />} />
            <Route path="manage-receipt" element={<ReceiptFormPage key="manage" mode="manage" />} />
            <Route path="thong-ke" element={<ThongKePage />} />
          </Route>
        </Route>

        {/* Fallback cho các route không xác định */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;