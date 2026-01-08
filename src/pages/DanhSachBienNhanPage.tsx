import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Search, Filter, RefreshCw, PlusCircle, ChevronUp, ChevronDown, Calendar, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { pawnService } from '../api/pawnService';
import { BienNhan, BienNhanFilter } from '../types';
import { formatCurrency, formatDateShort, formatDate } from '../utils/format';
import DetailModal from '../components/DetailModal';

// Định nghĩa độ rộng cột (Đã ẩn Địa chỉ và Trị giá, thêm Số lượng)
const COLUMN_WIDTHS = {
    maBN: 'w-[120px]',
    khachHang: 'w-[180px]',
    cmnd: 'w-[120px]',
    sdt: 'w-[120px]',
    giaoDich: 'w-[120px]',
    ngayGD: 'w-[140px]',
    ngayCam: 'w-[140px]', // Moved next to ngayGD
    soLuong: 'w-[80px]',  // New
    moTa: 'w-[200px]',
    tienGoc: 'w-[120px]',
    phatSinh: 'w-[120px]',
    tienLai: 'w-[120px]',
    tienGD: 'w-[120px]',
    soNgay: 'w-[80px]',
};

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
            {/* Header Table (Sticky) */}
            <div className="overflow-hidden border-b border-gray-200 bg-gray-50 shrink-0 pr-[6px]"> 
               <table className="w-full text-sm text-left whitespace-nowrap table-fixed">
                  <thead className="bg-gray-50 text-gray-600 font-semibold">
                      <tr>
                          <th className={`${COLUMN_WIDTHS.maBN} px-4 py-3 border-b border-gray-200`}>Mã BN</th>
                          <th className={`${COLUMN_WIDTHS.khachHang} px-4 py-3 border-b border-gray-200`}>Khách hàng</th>
                          <th className={`${COLUMN_WIDTHS.cmnd} px-4 py-3 border-b border-gray-200`}>CMND</th>
                          <th className={`${COLUMN_WIDTHS.sdt} px-4 py-3 border-b border-gray-200`}>Điện thoại</th>
                          <th className={`${COLUMN_WIDTHS.giaoDich} px-4 py-3 border-b border-gray-200`}>Giao dịch</th>
                          <th className={`${COLUMN_WIDTHS.ngayCam} px-4 py-3 border-b border-gray-200`}>Ngày cầm</th>
                          <th className={`${COLUMN_WIDTHS.ngayGD} px-4 py-3 border-b border-gray-200`}>Ngày GD</th>
                          <th className={`${COLUMN_WIDTHS.soLuong} px-4 py-3 text-center border-b border-gray-200`}>SL</th>
                          <th className={`${COLUMN_WIDTHS.moTa} px-4 py-3 border-b border-gray-200`}>Mô tả</th>
                          <th className={`${COLUMN_WIDTHS.tienGoc} px-4 py-3 text-right border-b border-gray-200`}>Tiền gốc</th>
                          <th className={`${COLUMN_WIDTHS.phatSinh} px-4 py-3 text-right border-b border-gray-200`}>Phát sinh</th>
                          <th className={`${COLUMN_WIDTHS.tienLai} px-4 py-3 text-right border-b border-gray-200`}>Tiền lãi</th>
                          <th className={`${COLUMN_WIDTHS.tienGD} px-4 py-3 text-right border-b border-gray-200`}>Tiền GD</th>
                          <th className={`${COLUMN_WIDTHS.soNgay} px-4 py-3 text-center border-b border-gray-200`}>Ngày</th>
                      </tr>
                  </thead>
               </table>
            </div>
    
            {/* Scrollable Body (Virtualized) */}
            <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-2" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : flatData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                        Không tìm thấy dữ liệu.
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
                                  <th className={COLUMN_WIDTHS.cmnd}></th>
                                  <th className={COLUMN_WIDTHS.sdt}></th>
                                  <th className={COLUMN_WIDTHS.giaoDich}></th>
                                  <th className={COLUMN_WIDTHS.ngayCam}></th>
                                  <th className={COLUMN_WIDTHS.ngayGD}></th>
                                  <th className={COLUMN_WIDTHS.soLuong}></th>
                                  <th className={COLUMN_WIDTHS.moTa}></th>
                                  <th className={COLUMN_WIDTHS.tienGoc}></th>
                                  <th className={COLUMN_WIDTHS.phatSinh}></th>
                                  <th className={COLUMN_WIDTHS.tienLai}></th>
                                  <th className={COLUMN_WIDTHS.tienGD}></th>
                                  <th className={COLUMN_WIDTHS.soNgay}></th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                 const item = flatData[virtualRow.index];
                                 if (!item) return null;
                                 
                                 // Logic xác định màu sắc dựa trên mã loại giao dịch (CHD = Chuộc)
                                 const isDaChuoc = item.maLoaiGiaoDich === 'CHD';

                                 return (
                                    <tr 
                                        key={item.maBienNhan} 
                                        className="hover:bg-blue-50/60 transition-colors cursor-pointer group even:bg-gray-50/30 h-[48px]"
                                        onClick={() => onRowClick(item)}
                                    >
                                        <td className="px-4 py-3 font-mono font-medium text-primary-600 truncate">{item.maBienNhan}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 truncate" title={item.tenKhachHang}>{item.tenKhachHang}</td>
                                        <td className="px-4 py-3 text-gray-600 truncate">{item.cmnd}</td>
                                        <td className="px-4 py-3 text-gray-600 truncate">{item.dienThoai}</td>
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
                                        <td className="px-4 py-3 text-center text-gray-700 font-medium">{item.soLuong}</td>
                                        <td className="px-4 py-3 max-w-[12rem] truncate text-gray-500" title={item.moTa}>{item.moTa}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.tienGoc)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(item.tienPhatSinh)}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(item.tienLai)}</td>
                                        <td className="px-4 py-3 text-right text-blue-600 font-bold">{formatCurrency(item.tienGiaoDich)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{item.soNgayCam}</span>
                                        </td>
                                    </tr>
                                 );
                               })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {isFetchingNextPage && (
                     <div className="py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                         <Loader2 className="w-4 h-4 animate-spin" /> Đang tải thêm...
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

  // Sử dụng Refs cho inputs để hiệu năng tối đa (Zero-lag typing)
  const maBNRef = useRef<HTMLInputElement>(null);
  const tenKhachRef = useRef<HTMLInputElement>(null);
  const sdtRef = useRef<HTMLInputElement>(null);
  const cmndRef = useRef<HTMLInputElement>(null);
  const tuNgayRef = useRef<HTMLInputElement>(null);
  const denNgayRef = useRef<HTMLInputElement>(null);

  // State chỉ lưu giá trị kích hoạt tìm kiếm
  const [activeFilters, setActiveFilters] = useState<BienNhanFilter>({
    maBN: '',
    tenKhach: '',
    sdt: '',
    cmnd: '',
    tuNgay: formatDateForInput(firstDayOfYear),
    denNgay: formatDateForInput(today)
  });
  
  // State để ép buộc refresh khi nhấn nút tìm kiếm (ngay cả khi filter không đổi)
  const [searchVersion, setSearchVersion] = useState(0);
  
  const [showFilters, setShowFilters] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BienNhan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 2. React Query: Infinite Data Fetching ---
  const PAGE_LIMIT = 50; 

  // Thêm searchVersion vào queryKey để kích hoạt refetch khi nhấn nút Tìm kiếm
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['bienNhans', activeFilters, searchVersion], 
    queryFn: async ({ pageParam = 1 }) => {
      // Loại bỏ các giá trị rỗng trước khi gửi đi
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
  
  // Hàm xử lý tìm kiếm: Đọc giá trị từ Refs và cập nhật State + Version
  const handleSearch = useCallback(() => {
    setActiveFilters({
      maBN: maBNRef.current?.value || '',
      tenKhach: tenKhachRef.current?.value || '',
      sdt: sdtRef.current?.value || '',
      cmnd: cmndRef.current?.value || '',
      tuNgay: tuNgayRef.current?.value || '',
      denNgay: denNgayRef.current?.value || ''
    });
    // Tăng version để luôn trigger request mới
    setSearchVersion(v => v + 1);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSearch();
      }
  };

  // Chỉ cho phép nhập số
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
    
    // Reset giá trị trong DOM inputs
    if(maBNRef.current) maBNRef.current.value = '';
    if(tenKhachRef.current) tenKhachRef.current.value = '';
    if(sdtRef.current) sdtRef.current.value = '';
    if(cmndRef.current) cmndRef.current.value = '';
    if(tuNgayRef.current) tuNgayRef.current.value = defaultStart;
    if(denNgayRef.current) denNgayRef.current.value = defaultEnd;

    // Trigger lại API với giá trị mặc định
    setActiveFilters({ 
        maBN: '', 
        tenKhach: '', 
        sdt: '', 
        cmnd: '', 
        tuNgay: defaultStart, 
        denNgay: defaultEnd 
    });
    setSearchVersion(v => v + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      
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

        <button className="flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors w-full lg:w-auto shrink-0">
            <PlusCircle size={18} />
            <span>Lập Biên Nhận</span>
        </button>
      </div>

      {/* 2. FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col xl:flex-row gap-4" onKeyDown={handleKeyDown}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Mã Biên Nhận</label>
                        <input 
                            type="text" name="maBN" autoComplete="off" placeholder="Nhập mã BN..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
                            ref={maBNRef} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Khách Hàng</label>
                        <input 
                            type="text" name="tenKhach" autoComplete="off" placeholder="Tên khách hàng..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
                            ref={tenKhachRef}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Số Điện Thoại</label>
                        <input 
                            type="text" name="sdt" autoComplete="off" placeholder="Chỉ nhập số..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
                            ref={sdtRef}
                            onInput={handleNumberInput} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">CMND / CCCD</label>
                        <input 
                            type="text" name="cmnd" autoComplete="off" placeholder="Chỉ nhập số..." 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
                            ref={cmndRef}
                            onInput={handleNumberInput} 
                        />
                    </div>
                </div>

                <div className="flex gap-2 items-end justify-end xl:w-auto w-full pt-2 xl:pt-0">
                    <button onClick={handleResetFilters} className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 border border-gray-300 shadow-sm">
                        <RefreshCw size={16} /> <span className="hidden xl:inline">Đặt lại</span>
                    </button>
                    <button onClick={handleSearch} className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium flex items-center gap-2 shadow-sm shadow-gold-200">
                        <Search size={18} /> Tìm kiếm
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
      <div className="shrink-0 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
              Đang hiển thị {flatData.length.toLocaleString()} 
              {totalRows > 0 && ` / Tổng ${totalRows.toLocaleString()}`} dòng
          </span>
      </div>

      <DetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedItem} />
    </div>
  );
};

export default DanhSachBienNhanPage;