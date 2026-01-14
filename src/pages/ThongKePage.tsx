import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { pawnService } from '../api/pawnService';
import { BienNhan, BienNhanFilter } from '../types';
import { formatCurrency, formatDateShort, formatDate } from '../utils/format';

// Key lưu session
const THONG_KE_FILTERS_KEY = 'thong_ke_filters';

// 1. Cấu hình cột hiển thị cho trang Thống Kê
const COLUMN_WIDTHS = {
    maBN: 'w-[120px]',
    khachHang: 'w-[200px]',
    giaoDich: 'w-[120px]',
    ngayCam: 'w-[140px]',
    ngayGD: 'w-[140px]',
    tienGoc: 'w-[140px]',
    phatSinh: 'w-[120px]',
    tienLai: 'w-[120px]',
    tienGD: 'w-[140px]',
};

// 2. Component Bảng ảo hóa (Virtual Table) - Phiên bản rút gọn cho Thống Kê
const VirtualTable = memo(({ 
    flatData, 
    isLoading, 
    isFetchingNextPage, 
    fetchNextPage, 
    hasNextPage 
}: any) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: flatData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 10,
    });

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
        if (!lastItem) return;

        if (
            lastItem.index >= flatData.length - 1 && 
            hasNextPage && 
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [
        hasNextPage,
        fetchNextPage,
        flatData.length,
        isFetchingNextPage,
        rowVirtualizer.getVirtualItems(),
    ]);

    return (
        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
            {/* Header Table */}
            <div className="overflow-hidden border-b border-gray-200 bg-gray-50 shrink-0 pr-[6px]"> 
               <table className="w-full text-sm text-left whitespace-nowrap table-fixed">
                  <thead className="bg-gray-50 text-gray-600 font-semibold">
                      <tr>
                          <th className={`${COLUMN_WIDTHS.maBN} px-4 py-3 border-b border-gray-200`}>Mã BN</th>
                          <th className={`${COLUMN_WIDTHS.khachHang} px-4 py-3 border-b border-gray-200`}>Khách hàng</th>
                          <th className={`${COLUMN_WIDTHS.giaoDich} px-4 py-3 border-b border-gray-200`}>Giao dịch</th>
                          <th className={`${COLUMN_WIDTHS.ngayCam} px-4 py-3 border-b border-gray-200`}>Ngày cầm</th>
                          <th className={`${COLUMN_WIDTHS.ngayGD} px-4 py-3 border-b border-gray-200`}>Ngày GD</th>
                          <th className={`${COLUMN_WIDTHS.tienGoc} px-4 py-3 text-right border-b border-gray-200`}>Tiền Gốc</th>
                          <th className={`${COLUMN_WIDTHS.phatSinh} px-4 py-3 text-right border-b border-gray-200`}>Phát Sinh</th>
                          <th className={`${COLUMN_WIDTHS.tienLai} px-4 py-3 text-right border-b border-gray-200`}>Tiền Lãi</th>
                          <th className={`${COLUMN_WIDTHS.tienGD} px-4 py-3 text-right border-b border-gray-200`}>Tiền GD</th>
                      </tr>
                  </thead>
               </table>
            </div>
    
            {/* Body Table */}
            <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-2" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : flatData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                        Không có dữ liệu thống kê trong khoảng thời gian này.
                    </div>
                ) : (
                    <div 
                      style={{ 
                        height: `${rowVirtualizer.getTotalSize()}px`, 
                        width: '100%', 
                        position: 'relative' 
                      }}
                    >
                        <table className="w-full text-sm text-left whitespace-nowrap table-fixed absolute top-0 left-0"
                             style={{ transform: `translateY(${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px)` }}
                        >
                            <thead className="invisible h-0">
                               <tr>
                                  <th className={COLUMN_WIDTHS.maBN}></th>
                                  <th className={COLUMN_WIDTHS.khachHang}></th>
                                  <th className={COLUMN_WIDTHS.giaoDich}></th>
                                  <th className={COLUMN_WIDTHS.ngayCam}></th>
                                  <th className={COLUMN_WIDTHS.ngayGD}></th>
                                  <th className={COLUMN_WIDTHS.tienGoc}></th>
                                  <th className={COLUMN_WIDTHS.phatSinh}></th>
                                  <th className={COLUMN_WIDTHS.tienLai}></th>
                                  <th className={COLUMN_WIDTHS.tienGD}></th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                 const item = flatData[virtualRow.index];
                                 if (!item) return null;
                                 
                                 const isDaChuoc = item.maLoaiGiaoDich === 'CHD';

                                 return (
                                    <tr key={item.maBienNhan} className="hover:bg-blue-50/60 transition-colors even:bg-gray-50/30 h-[48px]">
                                        <td className="px-4 py-3 font-mono font-medium text-primary-600 truncate">{item.maBienNhan}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 truncate" title={item.tenKhachHang}>{item.tenKhachHang}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                isDaChuoc
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {item.tenLoaiGiaoDich}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{formatDateShort(item.ngayCam)}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDate(item.ngayGiaoDich)}</td>
                                        <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.tienGoc)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.tienPhatSinh)}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(item.tienLai)}</td>
                                        <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(item.tienGiaoDich)}</td>
                                    </tr>
                                 );
                               })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {isFetchingNextPage && (
                     <div className="py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                         <Loader2 className="w-4 h-4 animate-spin" /> Đang tải thêm dữ liệu...
                     </div>
                )}
            </div>
        </div>
    );
});

const ThongKePage: React.FC = () => {
  // --- 1. Thiết lập Bộ lọc (Chỉ Ngày) ---
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tuNgayRef = useRef<HTMLInputElement>(null);
  const denNgayRef = useRef<HTMLInputElement>(null);

  // Khôi phục từ session storage
  const [activeFilters, setActiveFilters] = useState<BienNhanFilter>(() => {
    const saved = sessionStorage.getItem(THONG_KE_FILTERS_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        tuNgay: formatDateForInput(firstDayOfMonth),
        denNgay: formatDateForInput(today)
    };
  });
  
  // Version để kích hoạt refetch
  const [searchVersion, setSearchVersion] = useState(0);

  // --- 2. React Query: Infinite Data Fetching cho Danh Sách ---
  const PAGE_LIMIT = 50; 

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['thongKeBienNhans', activeFilters, searchVersion], 
    queryFn: async ({ pageParam = 1 }) => {
      // Chỉ gửi tuNgay, denNgay
      const cleanFilters = {
          tuNgay: activeFilters.tuNgay,
          denNgay: activeFilters.denNgay
      };
      return pawnService.getBienNhansInfinite(cleanFilters, Number(pageParam), PAGE_LIMIT);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < PAGE_LIMIT) return undefined;
      return lastPage.pagination.page + 1;
    },
    initialPageParam: 1, 
    refetchOnWindowFocus: false, 
  });

  const flatData = useMemo(() => {
    if (!data) return [];
    const allItems = data.pages.flatMap(page => page.data);
    const uniqueItems: BienNhan[] = [];
    const seenIds = new Set<string>();

    for (const item of allItems) {
        if (item.maBienNhan && !seenIds.has(item.maBienNhan)) {
            seenIds.add(item.maBienNhan);
            uniqueItems.push(item);
        }
    }
    return uniqueItems;
  }, [data]);

  // --- 3. React Query: Fetch Summary Data từ API ---
  const summaryQuery = useQuery({
      queryKey: ['thongKeSummary', activeFilters.tuNgay, activeFilters.denNgay, searchVersion],
      queryFn: () => pawnService.getThongKeSummary(activeFilters.tuNgay || '', activeFilters.denNgay || ''),
      refetchOnWindowFocus: false,
  });

  const summary = summaryQuery.data || {
      soGiaoDich: 0,
      soKhachHangCam: 0,
      soKhachHangChuoc: 0,
      tongTienCam: 0,
      tongTienChuoc: 0,
      tongTienLai: 0
  };

  // --- Handlers ---
  const handleSearch = () => {
    const newFilters = {
      tuNgay: tuNgayRef.current?.value || '',
      denNgay: denNgayRef.current?.value || ''
    };
    // Lưu vào state và session
    setActiveFilters(newFilters);
    sessionStorage.setItem(THONG_KE_FILTERS_KEY, JSON.stringify(newFilters));
    setSearchVersion(v => v + 1);
  };

  return (
    // Height adjusted because Header is removed
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
      
      {/* 1. Header & Filter - ĐÃ CẬP NHẬT: ĐƯA VỀ BÊN TRÁI */}
      <div className="flex flex-col gap-3 shrink-0">
         <h2 className="text-xl font-bold text-gray-800">Báo cáo thống kê</h2>
         
         <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm self-start">
             <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-200">
                  <Calendar size={16} className="text-gray-400" />
                  <div className="flex items-center gap-2">
                      <input 
                          type="date" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          defaultValue={activeFilters.tuNgay} 
                          ref={tuNgayRef}
                      />
                      <span className="text-gray-400 font-medium">-</span>
                      <input 
                          type="date" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          defaultValue={activeFilters.denNgay}
                          ref={denNgayRef}
                      />
                  </div>
              </div>
              <button 
                onClick={handleSearch}
                className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                  <Search size={16} /> Xem
              </button>
         </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="bg-white border-2 border-primary-600 rounded-2xl p-6 shadow-md text-gray-800 shrink-0 relative">
         {summaryQuery.isLoading && (
             <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-2xl">
                 <Loader2 className="animate-spin text-primary-500" />
             </div>
         )}
         <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 divide-x divide-gray-200">
            <div className="px-4 first:pl-0">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Giao Dịch</p>
                <p className="text-3xl font-bold">{summary.soGiaoDich.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1 italic">Kết quả tổng hợp</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Khách cầm</p>
                <p className="text-3xl font-bold text-primary-600">{summary.soKhachHangCam.toLocaleString()}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Khách chuộc</p>
                <p className="text-3xl font-bold text-green-600">{summary.soKhachHangChuoc.toLocaleString()}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Tiền Cầm</p>
                <p className="text-xl font-bold text-blue-600 truncate" title={formatCurrency(summary.tongTienCam)}>{formatCurrency(summary.tongTienCam)}</p>
            </div>
             <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Tiền Chuộc</p>
                <p className="text-xl font-bold text-green-600 truncate" title={formatCurrency(summary.tongTienChuoc)}>{formatCurrency(summary.tongTienChuoc)}</p>
            </div>
            <div className="px-4">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Tổng Tiền Lãi</p>
                <p className="text-xl font-bold text-orange-600 truncate" title={formatCurrency(summary.tongTienLai)}>{formatCurrency(summary.tongTienLai)}</p>
            </div>
         </div>
      </div>

       {/* 3. Virtual Table */}
       <VirtualTable 
         flatData={flatData}
         isLoading={isLoading}
         isFetchingNextPage={isFetchingNextPage}
         fetchNextPage={fetchNextPage}
         hasNextPage={hasNextPage}
       />
       
       {/* 4. Footer info */}
       <div className="shrink-0 text-xs text-gray-400 text-right px-2">
           *Danh sách hiển thị chi tiết các giao dịch trong khoảng thời gian đã chọn
       </div>
    </div>
  );
};

export default ThongKePage;