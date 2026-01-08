import { BienNhan, ThongKeTongQuan, BienNhanFilter, TrangThaiBienNhan } from '../types';
import { HOST } from './config';
import { authService } from './authService';

// =============================================================================
// CẤU HÌNH API
// =============================================================================
const USE_MOCK_DATA = false; // Đã tắt Mock Data để gọi API thật

// Cấu trúc trả về mới của API (khớp với Backend Node.js)
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Interface cho response của API Summary
interface SummaryResponse {
  tongGiaoDich: number;
  soKhachCam: number;
  soKhachChuoc: number;
  tongTienCam: number;
  tongTienChuoc: number;
  tongTienLai: number;
}

// =============================================================================
// HELPER: XỬ LÝ TIẾNG VIỆT (SEARCH FUZZY) - Dùng khi Mock Data bật
// =============================================================================
const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str.toLowerCase();
};

// =============================================================================
// MOCK DATA GENERATOR
// =============================================================================
const generateMockData = (count: number): BienNhan[] => {
  return Array.from({ length: count }).map((_, i) => ({
    maBienNhan: `0126${String(i).padStart(6, '0')}`,
    tenKhachHang: i % 3 === 0 ? `Nguyễn Văn Thành ${i}` : (i % 3 === 1 ? `Trần Thị Bình ${i}` : `Lê Văn Cường ${i}`),
    cmnd: `079093${String(i).padStart(6, '0')}`,
    dienThoai: `0909${String(i).padStart(6, '0')}`,
    diaChi: `Gò Vấp, TP.HCM - Số nhà ${i}`,
    
    maLoaiGiaoDich: i % 10 === 0 ? 'CHD' : 'CD', // CHD = Chuộc, CD = Cầm Đồ
    tenLoaiGiaoDich: i % 10 === 0 ? 'Chuộc đồ' : 'Cầm đồ',
    ngayGiaoDich: new Date(2024, 0, 1 + (i % 365)).toISOString(),
    
    // Tạo mô tả có dấu "+" để test tính năng tách dòng
    moTa: `01 Dây chuyền vàng 18K + 01 Mặt dây chuyền hình phật + TL: 3 chỉ 5 phân + Hột: Không`,
    loaiHang: 'Vàng 18K',
    soLuong: 1 + (i % 3),
    
    tienGoc: (i + 1) * 1000000,
    tienPhatSinh: i % 4 === 0 ? 50000 : 0,
    tienLai: (i + 1) * 20000,
    tienGiam: 0,
    tienGiaoDich: (i + 1) * 1020000,
    
    soNgayCam: 30 + (i % 10),
    ngayCam: new Date(2023, 11, 1 + (i % 28)).toISOString(),
    ngayHetHan: new Date(2024, 2, 1 + (i % 28)).toISOString(),
    
    giaTriMonHang: (i + 1) * 1500000, 
    trangThai: i % 10 === 0 ? TrangThaiBienNhan.DA_CHUOC : TrangThaiBienNhan.DANG_CAM,
    nhanVien: 'NV Thu Ngân'
  }));
};

const MOCK_TOTAL_ROWS = 50000;
const FULL_MOCK_DB = generateMockData(MOCK_TOTAL_ROWS);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// SERVICE LOGIC
// =============================================================================
export const pawnService = {
  getBienNhansInfinite: async (filter: BienNhanFilter, page: number = 1, limit: number = 50): Promise<PaginatedResponse<BienNhan>> => {
    // A. CALL API THẬT
    if (!USE_MOCK_DATA) {
      try {
        const url = new URL(`${HOST}/api/thong-ke/list`);
        
        // Mapping params
        if (filter.maBN) url.searchParams.append('maBienNhan', filter.maBN);
        if (filter.tenKhach) url.searchParams.append('tenKhachHang', filter.tenKhach); 
        if (filter.sdt) url.searchParams.append('dienThoai', filter.sdt);
        if (filter.cmnd) url.searchParams.append('cmnd', filter.cmnd);
        if (filter.tuNgay) url.searchParams.append('fromDate', filter.tuNgay);
        if (filter.denNgay) url.searchParams.append('toDate', filter.denNgay);
        
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: authService.getAuthHeaders() // Tự động thêm Token vào Header
        });

        // Xử lý khi Token hết hạn
        if (response.status === 401 || response.status === 403) {
           authService.logout();
           throw new Error("Phiên đăng nhập hết hạn");
        }

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json(); 
      } catch (error) {
        console.error("Error fetching Real API List:", error);
        // Trả về rỗng thay vì fallback mock để tránh nhầm lẫn khi đang debug API thật
        return { data: [], pagination: { page, limit, total: 0 } };
      }
    }

    // B. CALL MOCK DATA
    await delay(300);

    let filtered = [...FULL_MOCK_DB];

    if (filter.maBN) {
        const keyword = filter.maBN.trim();
        filtered = filtered.filter(i => i.maBienNhan.includes(keyword));
    }
    
    if (filter.tenKhach) {
        const keyword = removeVietnameseTones(filter.tenKhach);
        filtered = filtered.filter(i => {
            const name = removeVietnameseTones(i.tenKhachHang);
            return name.includes(keyword);
        });
    }

    if (filter.sdt) {
        const keyword = filter.sdt.replace(/\s+/g, '');
        filtered = filtered.filter(i => i.dienThoai.replace(/\s+/g, '').includes(keyword));
    }

    if (filter.cmnd) {
         const keyword = filter.cmnd.trim();
         filtered = filtered.filter(i => i.cmnd.includes(keyword));
    }
    
    if (filter.tuNgay) {
        const from = new Date(filter.tuNgay);
        filtered = filtered.filter(i => new Date(i.ngayCam) >= from);
    }
    if (filter.denNgay) {
        const to = new Date(filter.denNgay);
        filtered = filtered.filter(i => new Date(i.ngayCam) <= to);
    }

    const totalRows = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = filtered.slice(start, end);

    return {
      data: items,
      pagination: {
        page: page,
        limit: limit,
        total: totalRows
      }
    };
  },

  // API Mới: Lấy tổng hợp thống kê theo khoảng thời gian
  getThongKeSummary: async (fromDate: string, toDate: string): Promise<ThongKeTongQuan> => {
    // 1. Thử gọi API thật trước
    if (!USE_MOCK_DATA) {
        try {
            const url = new URL(`${HOST}/api/thong-ke/summary`);
            if (fromDate) url.searchParams.append('fromDate', fromDate);
            if (toDate) url.searchParams.append('toDate', toDate);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: authService.getAuthHeaders() // Tự động thêm Token vào Header
            });

            if (response.status === 401 || response.status === 403) {
               authService.logout();
               throw new Error("Phiên đăng nhập hết hạn");
            }

            if (response.ok) {
                const data: SummaryResponse = await response.json();
                return {
                    soGiaoDich: data.tongGiaoDich,
                    soKhachHangCam: data.soKhachCam,
                    soKhachHangChuoc: data.soKhachChuoc,
                    tongTienCam: data.tongTienCam,
                    tongTienChuoc: data.tongTienChuoc,
                    tongTienLai: data.tongTienLai
                };
            }
            
            console.warn(`API Summary returned ${response.status}. Falling back to mock data.`);
        } catch (error) {
            console.warn("Error fetching Summary API (Network/CORS). Falling back to mock data.", error);
        }
    }

    // 2. Fallback Mock Data (Dữ liệu giả lập khi API lỗi)
    await delay(300);
    return {
        soGiaoDich: 31,
        soKhachHangCam: 26,
        soKhachHangChuoc: 5,
        tongTienCam: 178600000,
        tongTienChuoc: 33500000,
        tongTienLai: 947666
    };
  },

  getBienNhans: async (filter?: BienNhanFilter): Promise<BienNhan[]> => {
    // Hàm này dùng cho trang thống kê, tạm thời mock hoặc cập nhật sau nếu cần
    await delay(500);
    return FULL_MOCK_DB.slice(0, 50);
  },

  getBienNhanDetail: async (maBN: string): Promise<BienNhan | undefined> => {
    await delay(300);
    return FULL_MOCK_DB.find(item => item.maBienNhan === maBN);
  },

  getDashboardStats: async (): Promise<ThongKeTongQuan> => {
    await delay(500);
    return {
      tongTienCam: 5250000000,
      tongTienChuoc: 1205000000,
      tongTienLai: 85000000,
      soGiaoDich: 159,
      soKhachHangCam: 120,
      soKhachHangChuoc: 39
    };
  }
};