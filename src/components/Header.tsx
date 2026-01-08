import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Menu Button - Hiện thị trên cả Desktop để toggle sidebar */}
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Đóng/Mở Menu"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar - Responsive width */}
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        <button className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;