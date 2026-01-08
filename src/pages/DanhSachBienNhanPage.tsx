import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, PlusCircle, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { pawnService } from '../api/pawnService';
import { BienNhan, BienNhanFilter } from '../types';
import { formatCurrency, formatDateShort, formatDate } from '../utils/format';
import DetailModal from '../components/DetailModal';

const DanhSachBienNhanPage: React.FC = () => {
  // --- Logic tính toán ngày mặc định ---
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultTuNgay = formatDateForInput(firstDayOfYear);
  const defaultDenNgay = formatDateForInput(today);
  // ------------------------------------

  const [data, setData] = useState<BienNhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BienNhan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true); 
  
  const [filters, setFilters] = useState<BienNhanFilter>({
    maBN: '',
    tenKhach: '',
    sdt: '',
    cmnd: '',
    tuNgay: defaultTuNgay,
    denNgay: defaultDenNgay
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Tự động fetch data khi ngày thay đổi (vì đã bỏ nút refresh thủ công ở toolbar)
  useEffect(() => {
    // Debounce nhẹ hoặc gọi luôn tùy nhu cầu, ở đây gọi luôn để UX mượt
    fetchData();
  }, [filters.tuNgay, filters.denNgay]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cleanFilters: BienNhanFilter = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const result = await pawnService.getBienNhans(cleanFilters);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (item: BienNhan) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    const defaultFilters = { 
        maBN: '', 
        tenKhach: '', 
        sdt: '', 
        cmnd: '', 
        tuNgay: defaultTuNgay, 
        denNgay: defaultDenNgay 
    };
    setFilters(defaultFilters);
    
    // fetchData sẽ tự chạy nhờ useEffect dependency, nhưng gọi trực tiếp ở đây để chắc chắn reset ngay lập tức
    setLoading(true);
    pawnService.getBienNhans(defaultFilters)
        .then(setData)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      
      {/* 1. SECTION: HEADER TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        
        {/* Left Side: Title & Tool Groups */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <h2 className="text-xl font-bold text-gray-800 shrink-0 mr-2">Danh sách biên nhận</h2>
          
          {/* Toolbar Container */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
              
              {/* Button: Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm border ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline whitespace-nowrap">{showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}</span>
                {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Date Picker Group: Cleaned up (No Refresh Button) */}
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm group focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shrink-0">
                  <Calendar size={16} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <div className="flex items-center gap-2">
                      <input 
                          type="date" 
                          name="tuNgay" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          value={filters.tuNgay} 
                          onChange={handleFilterChange} 
                      />
                      <span className="text-gray-400 font-medium">-</span>
                      <input 
                          type="date" 
                          name="denNgay" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          value={filters.denNgay} 
                          onChange={handleFilterChange} 
                      />
                  </div>
              </div>
          </div>
        </div>

        {/* Right Side: Primary Action */}
        <button 
            className="flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors w-full lg:w-auto shrink-0"
        >
            <PlusCircle size={18} />
            <span>Lập Biên Nhận</span>
        </button>
      </div>

      {/* 2. SECTION: FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Mã Biên Nhận</label>
                        <input 
                            type="text" name="maBN" placeholder="Nhập mã BN..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            value={filters.maBN} onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Khách Hàng</label>
                        <input 
                            type="text" name="tenKhach" placeholder="Tên khách hàng..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            value={filters.tenKhach} onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Số Điện Thoại</label>
                        <input 
                            type="text" name="sdt" placeholder="Số điện thoại..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            value={filters.sdt} onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">CMND / CCCD</label>
                        <input 
                            type="text" name="cmnd" placeholder="Số CMND..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            value={filters.cmnd} onChange={handleFilterChange}
                        />
                    </div>
                </div>

                <div className="flex gap-2 items-end justify-end xl:w-auto w-full pt-2 xl:pt-0">
                    <button 
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 border border-gray-300 shadow-sm"
                    >
                        <RefreshCw size={16} /> <span className="hidden xl:inline">Đặt lại</span>
                    </button>
                    <button 
                        onClick={() => fetchData()}
                        className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium flex items-center gap-2 shadow-sm shadow-gold-200"
                    >
                        <Search size={18} /> Tìm kiếm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3. SECTION: TABLE AREA */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative">
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-200 left-0 sticky-left-shadow">Mã BN</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Khách hàng</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Giao dịch</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Ngày GD</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Mô tả</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Tiền gốc</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Phát sinh</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Tiền lãi</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Tiền giảm</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Tiền GD</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-center border-b border-gray-200">Số ngày</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Ngày cầm</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 text-right border-b border-gray-200">Trị Giá</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Địa chỉ</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">Điện thoại</th>
                        <th className="px-4 py-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200">CMND</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                         <tr>
                            <td colSpan={16} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={16} className="px-6 py-12 text-center text-gray-500 italic">Không tìm thấy dữ liệu.</td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr 
                                key={item.maBienNhan} 
                                className="hover:bg-blue-50/60 transition-colors cursor-pointer group even:bg-gray-50/30"
                                onClick={() => handleRowClick(item)}
                            >
                                <td className="px-4 py-3 font-mono font-medium text-primary-600 sticky left-0 bg-white group-hover:bg-blue-50/60 z-10 border-r border-transparent group-hover:border-blue-100">{item.maBienNhan}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{item.tenKhachHang}</td>
                                
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                        item.tenLoaiGiaoDich === 'Chuộc đồ'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {item.tenLoaiGiaoDich}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-gray-600">{formatDate(item.ngayGiaoDich)}</td>
                                <td className="px-4 py-3 max-w-[12rem] truncate text-gray-500" title={item.moTa}>{item.moTa}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.tienGoc)}</td>
                                <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.tienPhatSinh)}</td>
                                <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(item.tienLai)}</td>
                                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(item.tienGiam)}</td>
                                <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(item.tienGiaoDich)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{item.soNgayCam}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{formatDateShort(item.ngayCam)}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.triGiaTaiSan)}</td>
                                <td className="px-4 py-3 max-w-[10rem] truncate text-gray-500" title={item.diaChi}>{item.diaChi}</td>
                                <td className="px-4 py-3 text-gray-600">{item.dienThoai}</td>
                                <td className="px-4 py-3 text-gray-600">{item.cmnd}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
        
      {/* 4. SECTION: FOOTER PAGINATION */}
      {!loading && data.length > 0 && (
          <div className="shrink-0 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">Hiển thị {data.length} kết quả</span>
              <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm disabled:opacity-50 text-gray-600">Trước</button>
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-600">Sau</button>
              </div>
          </div>
      )}

      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedItem} 
      />
    </div>
  );
};

export default DanhSachBienNhanPage;