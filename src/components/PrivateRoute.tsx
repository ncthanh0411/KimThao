import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../api/authService';

const PrivateRoute: React.FC = () => {
  const isAuth = authService.isAuthenticated();

  // Nếu đã đăng nhập -> Cho phép truy cập route con (Outlet)
  // Nếu chưa -> Đá về trang Login
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;