import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Users, FileText, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { pawnService } from '../api/pawnService';
import { ThongKeTongQuan } from '../types';
import { formatCurrency } from '../utils/format';

// Mock data for charts
const chartData = [
  { name: 'T2', TienCam: 4000, TienChuoc: 2400, Lai: 400 },
  { name: 'T3', TienCam: 3000, TienChuoc: 1398, Lai: 300 },
  { name: 'T4', TienCam: 2000, TienChuoc: 9800, Lai: 200 },
  { name: 'T5', TienCam: 2780, TienChuoc: 3908, Lai: 278 },
  { name: 'T6', TienCam: 1890, TienChuoc: 4800, Lai: 189 },
  { name: 'T7', TienCam: 2390, TienChuoc: 3800, Lai: 239 },
  { name: 'CN', TienCam: 3490, TienChuoc: 4300, Lai: 349 },
];

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subValue?: string; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  bgIcon?: string 
}> = ({ title, value, subValue, icon, trend, trendValue, bgIcon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${bgIcon || 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className={`mt-4 flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        <span className="font-medium">{trendValue}</span>
        <span className="text-gray-400 ml-1">vs tháng trước</span>
      </div>
    )}
  </div>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ThongKeTongQuan | null>(null);

  useEffect(() => {
    pawnService.getDashboardStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan trong ngày</h2>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
           <Calendar size={16} className="text-gray-500" />
           <input type="date" className="text-sm text-gray-700 outline-none" defaultValue={new Date().toISOString().split('T')[0]}/>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng khách cầm" 
          value={stats?.soKhachHangCam.toLocaleString() || '...'} 
          icon={<Users size={24} />} 
          trend="up" 
          trendValue="11.01%"
          bgIcon="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Tổng giao dịch" 
          value={stats?.soGiaoDich.toLocaleString() || '...'} 
          icon={<FileText size={24} />} 
          trend="down" 
          trendValue="9.05%"
          bgIcon="bg-orange-50 text-orange-600"
        />
        <StatCard 
          title="Tiền cầm hôm nay" 
          value={formatCurrency(stats?.tongTienCam || 0)} 
          icon={<DollarSign size={24} />} 
          bgIcon="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Tiền lãi thu được" 
          value={formatCurrency(stats?.tongTienLai || 0)} 
          icon={<TrendingUp size={24} />} 
          bgIcon="bg-gold-100 text-gold-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Biểu đồ dòng tiền (Tuần này)</h3>
            <button className="text-gray-400 hover:text-gray-600">...</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorChuoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value * 1000)} // Mock formatting
                />
                <Area type="monotone" dataKey="TienCam" name="Tiền cầm" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCam)" strokeWidth={3} />
                <Area type="monotone" dataKey="TienChuoc" name="Tiền chuộc" stroke="#f59e0b" fillOpacity={1} fill="url(#colorChuoc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="mb-6">
            <h3 className="font-bold text-gray-800">Thống kê lãi tháng</h3>
            <p className="text-sm text-gray-500">Mục tiêu đặt ra cho tháng này</p>
          </div>
          <div className="h-60 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip formatter={(value: number) => formatCurrency(value * 1000)} />
                <Bar dataKey="Lai" name="Tiền Lãi" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-400">Thực tế</p>
                <p className="font-bold text-emerald-500 text-sm">$20K ↑</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dự kiến</p>
                <p className="font-bold text-gray-700 text-sm">$20K</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Hôm nay</p>
                <p className="font-bold text-emerald-500 text-sm">$20K ↑</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;