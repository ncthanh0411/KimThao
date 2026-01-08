import { BienNhan, ThongKeTongQuan, BienNhanFilter, TrangThaiBienNhan } from '../types';

// =============================================================================
// CẤU HÌNH API (BẬT/TẮT Ở ĐÂY)
// =============================================================================
// Để chuyển sang dùng API thật:
// 1. Đổi giá trị USE_MOCK_DATA = false
// 2. Đảm bảo biến HOST trỏ đúng server backend
const USE_MOCK_DATA = false; 
const HOST = 'https://kimthao-service.azurewebsites.net';

// =============================================================================
// MOCK DATA (DỮ LIỆU GIẢ LẬP)
// =============================================================================
const MOCK_DATA: BienNhan[] = Array.from({ length: 50 }).map((_, i) => ({
  maBienNhan: `0126000${200 + i}`,
  tenKhachHang: i % 3 === 0 ? 'Nguyễn Văn An' : (i % 3 === 1 ? 'Trần Thị Bình' : 'Lê Văn Cường'),
  cmnd: `07909300${1000 + i}`,
  dienThoai: `0909123${100 + i}`,
  diaChi: i % 2 === 0 ? '123 Dương Quảng Hàm, P5, Gò Vấp' : '456 Quang Trung, P10, Gò Vấp',
  
  tenLoaiGiaoDich: i % 5 === 0 ? 'Thêm tiền' : (i % 10 === 0 ? 'Chuộc đồ' : 'Cầm đồ'),
  ngayGiaoDich: new Date(2024, 0, 1 + (i % 28)).toISOString(),
  
  moTa: `01 Dây chuyền vàng 18K 6 chỉ - Mẫu ${i}F00`,
  loaiHang: 'Vàng 18K',
  
  tienGoc: (i + 1) * 2000000,
  tienPhatSinh: i % 4 === 0 ? 50000 : 0,
  tienLai: (i + 1) * 50000,
  tienGiam: i % 7 === 0 ? 20000 : 0,
  tienGiaoDich: i % 10 === 0 ? ((i + 1) * 2000000 + (i + 1) * 50000) : 0,
  
  soNgayCam: 30 + (i * 2),
  ngayCam: new Date(2023, 11, 1 + (i % 28)).toISOString(),
  ngayHetHan: new Date(2024, 2, 1 + (i % 28)).toISOString(),
  
  triGiaTaiSan: (i + 1) * 2500000,
  trangThai: i % 10 === 0 ? TrangThaiBienNhan.DA_CHUOC : TrangThaiBienNhan.DANG_CAM,
  nhanVien: 'NV Thu Ngân 1'
}));

// Hàm delay giả lập mạng chậm
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// SERVICE LOGIC
// =============================================================================
export const pawnService = {
  // 1. Lấy danh sách biên nhận
  getBienNhans: async (filter?: BienNhanFilter): Promise<BienNhan[]> => {
    // ---------------------------------------------------------
    // A. LOGIC GỌI API THẬT (Khi USE_MOCK_DATA = false)
    // ---------------------------------------------------------
    if (!USE_MOCK_DATA) {
      try {
        const url = new URL(`${HOST}/api/thong-ke/list`);
        if (filter) {
          if (filter.maBN) url.searchParams.append('maBienNhan', filter.maBN);
          if (filter.tenKhach) url.searchParams.append('khachHang', filter.tenKhach);
          if (filter.sdt) url.searchParams.append('dienThoai', filter.sdt);
          if (filter.cmnd) url.searchParams.append('cmnd', filter.cmnd);
          if (filter.tuNgay) url.searchParams.append('fromDate', filter.tuNgay);
          if (filter.denNgay) url.searchParams.append('toDate', filter.denNgay);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
      } catch (error) {
        console.error("Error fetching Real API:", error);
        return [];
      }
    }

    // ---------------------------------------------------------
    // B. LOGIC DÙNG MOCK DATA (Khi USE_MOCK_DATA = true)
    // ---------------------------------------------------------
    await delay(600); // Giả lập loading
    let data = [...MOCK_DATA];

    if (filter) {
      if (filter.maBN) {
        data = data.filter(item => item.maBienNhan.toLowerCase().includes(filter.maBN!.toLowerCase()));
      }
      if (filter.tenKhach) {
        data = data.filter(item => item.tenKhachHang.toLowerCase().includes(filter.tenKhach!.toLowerCase()));
      }
      if (filter.sdt) {
        data = data.filter(item => item.dienThoai.includes(filter.sdt!));
      }
      if (filter.cmnd) {
        data = data.filter(item => item.cmnd.includes(filter.cmnd!));
      }
      // Logic lọc ngày tháng đơn giản cho Mock
      if (filter.tuNgay) {
          data = data.filter(item => new Date(item.ngayCam) >= new Date(filter.tuNgay!));
      }
      if (filter.denNgay) {
          data = data.filter(item => new Date(item.ngayCam) <= new Date(filter.denNgay!));
      }
    }
    return data;
  },

  // 2. Lấy chi tiết biên nhận
  getBienNhanDetail: async (maBN: string): Promise<BienNhan | undefined> => {
    // Nếu dùng API thật, hãy gọi endpoint detail ở đây
    // Ví dụ: return await fetch(`${HOST}/api/thong-ke/${maBN}`).then(res => res.json());
    
    // Mock logic
    await delay(300);
    return MOCK_DATA.find(item => item.maBienNhan === maBN);
  },

  // 3. Lấy số liệu thống kê Dashboard
  getDashboardStats: async (): Promise<ThongKeTongQuan> => {
    await delay(500);
    // Mock Data cho Dashboard
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