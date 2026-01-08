import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  // Khởi tạo state dựa trên kích thước màn hình
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Effect để tự động đóng/mở dựa trên resize màn hình (Responsive UX)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false); // Mobile: Mặc định đóng
      } else {
        setIsSidebarOpen(true);  // Desktop: Mặc định mở
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar nhận props để điều khiển hiển thị */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* 
         Logic margin-left:
         - Mobile (< lg): Luôn là ml-0 (Sidebar dạng overlay)
         - Desktop (>= lg): Nếu mở thì ml-64, nếu đóng thì ml-0
      */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        <Header onMenuToggle={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay cho Mobile khi mở menu (Backdrop) - Chỉ hiện trên mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden glass"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default MainLayout;