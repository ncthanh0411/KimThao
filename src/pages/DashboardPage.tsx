import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Users, FileText, DollarSign, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { pawnService } from '../api/pawnService';
import { formatCurrency } from '../utils/format';

// Mock data cho Biểu đồ Dòng Tiền (6 tháng gần nhất)
const monthlyChartData = [
  { name: 'Thg 8', TienCam: 154000000, TienChuoc: 84000000 },
  { name: 'Thg 9', TienCam: 130000000, TienChuoc: 63980000 },
  { name: 'Thg 10', TienCam: 180000000, TienChuoc: 98000000 },
  { name: 'Thg 11', TienCam: 278000000, TienChuoc: 139080000 },
  { name: 'Thg 12', TienCam: 189000000, TienChuoc: 148000000 },
  { name: 'Thg 1', TienCam: 239000000, TienChuoc: 138000000 },
];

// Mock data cho Biểu đồ Lãi (Tuần này - T2 đến CN)
const weeklyInterestData = [
  { name: 'T2', Lai: 4500000 },
  { name: 'T3', Lai: 3200000 },
  { name: 'T4', Lai: 5100000 },
  { name: 'T5', Lai: 2800000 },
  { name: 'T6', Lai: 4900000 },
  { name: 'T7', Lai: 6200000 },
  { name: 'CN', Lai: 7500000 },
];

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subValue?: string; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  bgIcon?: string;
  loading?: boolean;
}> = ({ title, value, subValue, icon, trend, trendValue, bgIcon, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-full">
    {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
    ) : null}
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
        <span className="text-gray-400 ml-1">vs hôm qua</span>
      </div>
    )}
  </div>
);

const DashboardPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Binding API Summary cho Dashboard dựa theo ngày chọn
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardSummary', selectedDate],
    queryFn: () => pawnService.getThongKeSummary(selectedDate, selectedDate),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // Cache 1 phút
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan trong ngày</h2>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
           <Calendar size={16} className="text-gray-500" />
           <input 
              type="date" 
              className="text-sm text-gray-700 outline-none cursor-pointer" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>
      </div>

      {/* Stat Cards - Sử dụng Data thật từ API Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng khách cầm" 
          value={stats?.soKhachHangCam.toLocaleString() || '0'} 
          icon={<Users size={24} />} 
          trend="up" 
          trendValue="+"
          bgIcon="bg-indigo-50 text-indigo-600"
          loading={isLoading}
        />
        <StatCard 
          title="Tổng giao dịch" 
          value={stats?.soGiaoDich.toLocaleString() || '0'} 
          subValue={`Chuộc: ${stats?.soKhachHangChuoc || 0}`}
          icon={<FileText size={24} />} 
          bgIcon="bg-orange-50 text-orange-600"
          loading={isLoading}
        />
        <StatCard 
          title="Tiền cầm hôm nay" 
          value={formatCurrency(stats?.tongTienCam || 0)} 
          icon={<DollarSign size={24} />} 
          bgIcon="bg-green-50 text-green-600"
          loading={isLoading}
        />
        <StatCard 
          title="Tiền lãi thu được" 
          value={formatCurrency(stats?.tongTienLai || 0)} 
          icon={<TrendingUp size={24} />} 
          bgIcon="bg-gold-100 text-gold-600"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Đổi thành 6 tháng gần nhất */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-gray-800">Biểu đồ dòng tiền (Tháng)</h3>
                <p className="text-xs text-gray-400 mt-1">Dữ liệu 6 tháng gần nhất</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">...</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    tickFormatter={(value) => `${value / 1000000}tr`}
                />
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="TienCam" name="Tiền cầm" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCam)" strokeWidth={3} />
                <Area type="monotone" dataKey="TienChuoc" name="Tiền chuộc" stroke="#f59e0b" fillOpacity={1} fill="url(#colorChuoc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart - Đổi thành thống kê Tuần (T2 -> CN) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="mb-6">
            <h3 className="font-bold text-gray-800">Thống kê lãi tuần</h3>
            <p className="text-sm text-gray-500">Doanh thu lãi từ Thứ 2 - CN</p>
          </div>
          <div className="h-60 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyInterestData}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="Lai" name="Tiền Lãi" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-400">Cao nhất</p>
                <p className="font-bold text-emerald-500 text-sm">CN</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tổng tuần</p>
                <p className="font-bold text-gray-700 text-sm truncate">34.2tr</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">TB/Ngày</p>
                <p className="font-bold text-blue-500 text-sm truncate">4.8tr</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;