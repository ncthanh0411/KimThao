import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { pawnService } from '../api/pawnService';
import { BienNhan } from '../types';
import { formatCurrency, formatDateShort } from '../utils/format';

const ThongKePage: React.FC = () => {
  const [data, setData] = useState<BienNhan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Summary Calculation
  const [summary, setSummary] = useState({
      totalTienCam: 0,
      totalTienLai: 0,
      countGiaoDich: 0,
      countKhachCam: 0,
      countKhachChuoc: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Gọi API lấy toàn bộ danh sách (hoặc API thống kê chuyên biệt nếu có)
    const result = await pawnService.getBienNhans();
    setData(result);
    calculateSummary(result);
    setLoading(false);
  };

  const calculateSummary = (items: BienNhan[]) => {
      const totalCam = items.reduce((sum, item) => sum + (item.tienGoc || 0), 0);
      const totalLai = items.reduce((sum, item) => sum + (item.tienLai || 0), 0);
      const uniqueCustomers = new Set(items.map(i => i.tenKhachHang)).size;
      // Nếu API trả về trạng thái, dùng trạng thái. Nếu không, tạm tính logic khác hoặc để 0.
      const daChuocCount = items.filter(i => i.tenLoaiGiaoDich === 'Chuộc đồ').length; 

      setSummary({
          totalTienCam: totalCam,
          totalTienLai: totalLai,
          countGiaoDich: items.length,
          countKhachCam: uniqueCustomers,
          countKhachChuoc: daChuocCount 
      });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Báo cáo thống kê</h2>

      {/* Aggregate Stats Area - Đổi sang nền trắng, viền xanh */}
      <div className="bg-white border-2 border-primary-600 rounded-2xl p-6 shadow-md text-gray-800">
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 divide-x divide-gray-200">
            <div className="px-4 first:pl-0">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Giao Dịch</p>
                <p className="text-3xl font-bold">{summary.countGiaoDich}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Khách cầm</p>
                <p className="text-3xl font-bold text-primary-600">{summary.countKhachCam}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Giao dịch Chuộc</p>
                <p className="text-3xl font-bold text-green-600">{summary.countKhachChuoc}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Tiền Cầm</p>
                <p className="text-2xl font-bold text-gold-600">{formatCurrency(summary.totalTienCam)}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Tiền Lãi</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalTienLai)}</p>
            </div>
         </div>
      </div>

       {/* Simplified Filters - Ô search màu trắng */}
       <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
           <Search size={20} className="text-gray-400 ml-2" />
           <input type="text" placeholder="Tìm kiếm nhanh..." className="flex-1 outline-none text-sm text-gray-700 bg-white" />
           <div className="h-6 w-px bg-gray-200"></div>
           <button className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3">
               Xuất Excel
           </button>
       </div>

       {/* Condensed Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3">Mã BN</th>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3">Ngày cầm</th>
                        <th className="px-4 py-3">Mô tả</th>
                        <th className="px-4 py-3 text-right">Tiền gốc</th>
                        <th className="px-4 py-3 text-right">Lãi</th>
                        <th className="px-4 py-3 text-right">Phát sinh</th>
                        <th className="px-4 py-3 text-right">Thực thu</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                     {loading ? (
                         <tr><td colSpan={8} className="p-4 text-center">Đang tải...</td></tr>
                     ) : data.slice(0, 15).map((item) => (
                        <tr key={item.maBienNhan} className="hover:bg-gray-50">
                             <td className="px-4 py-3 text-gray-500">{item.maBienNhan}</td>
                             <td className="px-4 py-3 font-medium text-gray-900">{item.tenKhachHang}</td>
                             <td className="px-4 py-3 text-gray-500">{formatDateShort(item.ngayCam)}</td>
                             <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{item.moTa}</td>
                             <td className="px-4 py-3 text-right">{formatCurrency(item.tienGoc)}</td>
                             <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(item.tienLai)}</td>
                             <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.tienPhatSinh)}</td>
                             <td className="px-4 py-3 text-right font-bold text-gray-900">
                                 {formatCurrency((item.tienLai || 0) + (item.tienPhatSinh || 0))}
                             </td>
                        </tr>
                     ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ThongKePage;