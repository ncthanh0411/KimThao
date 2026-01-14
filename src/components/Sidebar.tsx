import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PieChart, Gem, X, PanelLeftClose, LogOut, PlusCircle, Search, Settings } from 'lucide-react';
import { authService } from '../api/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = authService.getUser();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Danh Sách Biên Nhận', path: '/bien-nhan', icon: <FileText size={20} /> },
    { name: 'Lập Biên Nhận', path: '/create-receipt', icon: <PlusCircle size={20} /> },
    { name: 'Quản Lý Biên Nhận', path: '/manage-receipt', icon: <Search size={20} /> },
    { name: 'Thống Kê', path: '/thong-ke', icon: <PieChart size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
      authService.logout();
    }
  };

  return (
    <>
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white text-slate-800 flex flex-col h-screen border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <Gem className="text-gold-500 mr-2" size={28} />
            <div>
              <h1 className="font-bold text-lg leading-tight text-gold-600">Kim Thảo</h1>
              <p className="text-xs text-gray-500">Pawn System</p>
            </div>
          </div>
          
          {/* Close button: Hiện X trên mobile, Hiện icon Panel trên Desktop */}
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Thu gọn menu"
          >
            <span className="lg:hidden"><X size={20} /></span>
            <span className="hidden lg:block"><PanelLeftClose size={20} /></span>
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto flex flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                  // Trên mobile thì đóng menu khi click
                  if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm border border-primary-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className={`mr-3 ${ ({ isActive }: any) => isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                  {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}

          {/* Spacer để đẩy mục Cài đặt xuống dưới */}
          <div className="flex-1"></div>

          {/* Mục Cài đặt Máy in */}
          <div className="pt-4 border-t border-gray-100 mt-2">
            <NavLink
                to="/settings"
                onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3 text-gray-400 group-hover:text-gray-600">
                    <Settings size={20} />
                </span>
                <span className="text-sm">Cấu hình Máy in</span>
              </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-sm border border-gold-200 shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-800 truncate" title={user?.fullName}>
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role || 'Quản lý'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;