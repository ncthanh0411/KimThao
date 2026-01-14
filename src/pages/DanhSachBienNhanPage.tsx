import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Search, Filter, RefreshCw, ChevronUp, ChevronDown, Calendar, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { pawnService } from '../api/pawnService';
import { BienNhan, BienNhanFilter } from '../types';
import { formatCurrency, formatDateShort, formatDate } from '../utils/format';
import DetailModal from '../components/DetailModal';

// Keys lưu trữ session
const FILTERS_KEY = 'bien_nhan_filters';
const SHOW_FILTER_KEY = 'bien_nhan_show_filters';

// --- Tách Component Table ---
const VirtualTable = memo(({ 
    flatData, 
    isLoading, 
    isFetchingNextPage, 
    fetchNextPage, 
    hasNextPage,
    onRowClick 
}: any) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: flatData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48, // Chiều cao ước tính mỗi dòng
        overscan: 10,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();
    
    // Tính toán khoảng đệm trên và dưới để giả lập chiều cao scroll
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
    const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1].end) : 0;

    useEffect(() => {
        const [lastItem] = [...virtualRows].reverse();
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
        virtualRows,
    ]);

    return (
        <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
            <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
                {isLoading && flatData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-2" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : flatData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500 italic">
                        Không tìm thấy dữ liệu.
                    </div>
                ) : (
                    <table className="min-w-full text-sm text-left whitespace-nowrap table-fixed border-separate border-spacing-0">
                        <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm h-[48px]">
                            <tr>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[100px]">Mã BN</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[160px]">Khách hàng</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[110px]">CMND</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[110px]">Điện thoại</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[100px]">Giao dịch</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[110px]">Ngày cầm</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[110px]">Ngày GD</th>
                                <th className="px-3 py-3 text-center border-b border-gray-200 bg-gray-50 w-[60px]">SL</th>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 w-[180px]">Mô tả</th>
                                <th className="px-3 py-3 text-right border-b border-gray-200 bg-gray-50 w-[110px]">Tiền gốc</th>
                                <th className="px-3 py-3 text-right border-b border-gray-200 bg-gray-50 w-[100px]">Phát sinh</th>
                                <th className="px-3 py-3 text-right border-b border-gray-200 bg-gray-50 w-[100px]">Tiền lãi</th>
                                <th className="px-3 py-3 text-right border-b border-gray-200 bg-gray-50 w-[110px]">Tiền GD</th>
                                <th className="px-3 py-3 text-center border-b border-gray-200 bg-gray-50 w-[90px]">Số ngày cầm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Spacer Row Top */}
                            {paddingTop > 0 && (
                                <tr>
                                    <td colSpan={14} style={{ height: `${paddingTop}px` }} />
                                </tr>
                            )}

                            {/* Data Rows */}
                            {virtualRows.map((virtualRow) => {
                                const item = flatData[virtualRow.index];
                                if (!item) return null;
                                
                                const isDaChuoc = item.maLoaiGiaoDich === 'CHD' || item.trangThai === 'DCH';

                                return (
                                <tr 
                                    key={item.maBienNhan}
                                    data-index={virtualRow.index} 
                                    ref={rowVirtualizer.measureElement}
                                    className="hover:bg-blue-50/60 transition-colors cursor-pointer group even:bg-gray-50/30 h-[48px]"
                                    onClick={() => onRowClick(item)}
                                >
                                    <td className="px-3 py-3 font-mono font-medium text-primary-600 truncate">{item.maBienNhan}</td>
                                    <td className="px-3 py-3 font-medium text-gray-900 truncate" title={item.tenKhachHang}>{item.tenKhachHang}</td>
                                    <td className="px-3 py-3 text-gray-600 truncate">{item.cmnd}</td>
                                    <td className="px-3 py-3 text-gray-600 truncate">{item.dienThoai}</td>
                                    <td className="px-3 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            isDaChuoc
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                            {item.tenLoaiGiaoDich}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-600">{formatDateShort(item.ngayCam)}</td>
                                    <td className="px-3 py-3 text-gray-600">{formatDateShort(item.ngayGiaoDich)}</td>
                                    <td className="px-3 py-3 text-center text-gray-700 font-medium">{item.soLuong}</td>
                                    <td className="px-3 py-3 max-w-[12rem] truncate text-gray-500" title={item.moTa}>{item.moTa}</td>
                                    <td className="px-3 py-3 text-right font-medium text-gray-900">{formatCurrency(item.tienGoc)}</td>
                                    <td className="px-3 py-3 text-right text-gray-500">{formatCurrency(item.tienPhatSinh)}</td>
                                    <td className="px-3 py-3 text-right text-orange-600 font-medium">{formatCurrency(item.tienLai)}</td>
                                    <td className="px-3 py-3 text-right text-blue-600 font-bold">{formatCurrency(item.tienGiaoDich)}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{item.soNgayCam}</span>
                                    </td>
                                </tr>
                                );
                            })}
                            
                            {/* Spacer Row Bottom */}
                            {paddingBottom > 0 && (
                                <tr>
                                    <td colSpan={14} style={{ height: `${paddingBottom}px` }} />
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                
                {isFetchingNextPage && (
                     <div className="py-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2 sticky bottom-0 w-full bg-white/90 backdrop-blur-sm z-20 border-t border-gray-100">
                         <Loader2 className="w-4 h-4 animate-spin" /> Đang tải thêm dữ liệu...
                     </div>
                )}
            </div>
        </div>
    );
});

const DanhSachBienNhanPage: React.FC = () => {
  // --- 1. Thiết lập Bộ lọc ---
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Sử dụng Refs cho inputs
  const maBNRef = useRef<HTMLInputElement>(null);
  const tenKhachRef = useRef<HTMLInputElement>(null);
  const sdtRef = useRef<HTMLInputElement>(null);
  const cmndRef = useRef<HTMLInputElement>(null);
  const tuNgayRef = useRef<HTMLInputElement>(null);
  const denNgayRef = useRef<HTMLInputElement>(null);

  // Khôi phục bộ lọc từ session storage
  const [activeFilters, setActiveFilters] = useState<BienNhanFilter>(() => {
    const saved = sessionStorage.getItem(FILTERS_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        maBN: '',
        tenKhach: '',
        sdt: '',
        cmnd: '',
        tuNgay: formatDateForInput(firstDayOfYear),
        denNgay: formatDateForInput(today)
    };
  });
  
  // Khôi phục trạng thái hiển thị bộ lọc
  const [showFilters, setShowFilters] = useState(() => {
    const saved = sessionStorage.getItem(SHOW_FILTER_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  // State để ép buộc refresh
  const [searchVersion, setSearchVersion] = useState(0);
  
  const [selectedItem, setSelectedItem] = useState<BienNhan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lưu showFilters mỗi khi thay đổi
  useEffect(() => {
    sessionStorage.setItem(SHOW_FILTER_KEY, JSON.stringify(showFilters));
  }, [showFilters]);

  // --- 2. React Query: Infinite Data Fetching ---
  const PAGE_LIMIT = 50; 

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['bienNhans', activeFilters, searchVersion], 
    queryFn: async ({ pageParam = 1 }) => {
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([_, v]) => v !== '')
      );
      return pawnService.getBienNhansInfinite(cleanFilters, Number(pageParam), PAGE_LIMIT);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < PAGE_LIMIT) return undefined;
      return lastPage.pagination.page + 1;
    },
    initialPageParam: 1, 
    refetchOnWindowFocus: false, 
  });

  const flatData = React.useMemo(() => {
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

  const totalRows = data?.pages[0]?.pagination.total || 0;

  // --- Handlers ---
  const handleSearch = useCallback(() => {
    const newFilters = {
      maBN: maBNRef.current?.value || '',
      tenKhach: tenKhachRef.current?.value || '',
      sdt: sdtRef.current?.value || '',
      cmnd: cmndRef.current?.value || '',
      tuNgay: tuNgayRef.current?.value || '',
      denNgay: denNgayRef.current?.value || ''
    };
    
    // Lưu vào state và session storage
    setActiveFilters(newFilters);
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(newFilters));
    setSearchVersion(v => v + 1);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSearch();
      }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/\D/.test(value)) {
          e.target.value = value.replace(/\D/g, '');
      }
  };

  const handleRowClick = useCallback((item: BienNhan) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleResetFilters = () => {
    const defaultStart = formatDateForInput(firstDayOfYear);
    const defaultEnd = formatDateForInput(today);
    
    if(maBNRef.current) maBNRef.current.value = '';
    if(tenKhachRef.current) tenKhachRef.current.value = '';
    if(sdtRef.current) sdtRef.current.value = '';
    if(cmndRef.current) cmndRef.current.value = '';
    if(tuNgayRef.current) tuNgayRef.current.value = defaultStart;
    if(denNgayRef.current) denNgayRef.current.value = defaultEnd;

    const defaultFilters = { 
        maBN: '', 
        tenKhach: '', 
        sdt: '', 
        cmnd: '', 
        tuNgay: defaultStart, 
        denNgay: defaultEnd 
    };

    setActiveFilters(defaultFilters);
    sessionStorage.removeItem(FILTERS_KEY); // Clear session
    setSearchVersion(v => v + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
      
      {/* 1. HEADER TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <h2 className="text-xl font-bold text-gray-800 shrink-0 mr-2">Danh sách biên nhận</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
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

              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm group focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shrink-0">
                  <Calendar size={16} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <div className="flex items-center gap-2">
                      <input 
                          type="date" name="tuNgay" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          defaultValue={activeFilters.tuNgay} 
                          ref={tuNgayRef}
                      />
                      <span className="text-gray-400 font-medium">-</span>
                      <input 
                          type="date" name="denNgay" 
                          className="border-none p-0 text-sm text-gray-700 focus:ring-0 bg-transparent font-medium cursor-pointer outline-none"
                          defaultValue={activeFilters.denNgay}
                          ref={denNgayRef}
                      />
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER PANEL - Compact inputs */}
      {showFilters && (
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col xl:flex-row gap-3" onKeyDown={handleKeyDown}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Mã BN</label>
                        <input 
                            type="text" name="maBN" autoComplete="off" placeholder="Mã BN..." 
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" 
                            ref={maBNRef} 
                            defaultValue={activeFilters.maBN}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Khách Hàng</label>
                        <input 
                            type="text" name="tenKhach" autoComplete="off" placeholder="Tên khách..." 
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" 
                            ref={tenKhachRef}
                            defaultValue={activeFilters.tenKhach}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Điện Thoại</label>
                        <input 
                            type="text" name="sdt" autoComplete="off" placeholder="SĐT..." 
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" 
                            ref={sdtRef}
                            onInput={handleNumberInput} 
                            defaultValue={activeFilters.sdt}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">CMND</label>
                        <input 
                            type="text" name="cmnd" autoComplete="off" placeholder="CMND..." 
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" 
                            ref={cmndRef}
                            onInput={handleNumberInput} 
                            defaultValue={activeFilters.cmnd}
                        />
                    </div>
                </div>

                <div className="flex gap-2 items-end justify-end xl:w-auto w-full pt-1 xl:pt-0">
                    <button onClick={handleResetFilters} className="px-3 py-1.5 bg-white text-gray-600 rounded border border-gray-300 hover:bg-gray-50 font-medium flex items-center gap-2 text-sm">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={handleSearch} className="px-5 py-1.5 bg-gold-500 text-white rounded hover:bg-gold-600 font-medium flex items-center gap-2 shadow-sm text-sm whitespace-nowrap">
                        <Search size={16} /> Tìm kiếm
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3. TABLE AREA */}
      <VirtualTable 
        flatData={flatData}
        totalRows={totalRows}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        onRowClick={handleRowClick}
      />
        
      {/* 4. FOOTER STATS */}
      <div className="shrink-0 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
              Đang hiển thị {flatData.length.toLocaleString()} 
              {totalRows > 0 && ` / Tổng ${totalRows.toLocaleString()}`} dòng
          </span>
      </div>

      <DetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedItem} />
    </div>
  );
};

export default DanhSachBienNhanPage;