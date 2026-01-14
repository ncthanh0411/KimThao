
// Định nghĩa trạng thái biên nhận
export enum TrangThaiBienNhan {
  DANG_CAM = 'DANG_CAM',
  DA_CHUOC = 'DA_CHUOC',
  QUA_HAN = 'QUA_HAN',
  THANH_LY = 'THANH_LY'
}

// Interface cho Biên Nhận - Đã cập nhật mapping mới
export interface BienNhan {
  maBienNhan: string;     // Updated from maBN
  tenKhachHang: string;   // Updated from khachHang
  
  maLoaiGiaoDich: string; // New: Mã loại giao dịch (CHD = Chuộc)
  tenLoaiGiaoDich: string; // Updated from loaiGiaoDich
  
  ngayGiaoDich: string;   // Ngày giao dịch (ISO String)
  moTa: string;           // Mô tả (Chuỗi phân cách bởi dấu +)
  soLuong: number;        // New: Số lượng món hàng
  
  tienGoc: number;        // Tiền gốc
  tienPhatSinh: number;   // Tiền phát sinh
  tienLai: number;        // Tiền lãi
  tienGiam: number;       // Tiền giảm
  tienGiaoDich: number;   // Updated from daThanhToan
  
  soNgayCam: number;      // Số ngày cầm
  ngayCam: string;        // Ngày cầm (ISO String)
  
  giaTriMonHang: number;  // Updated from triGiaTaiSan
  diaChi: string;         // Địa chỉ
  dienThoai: string;      // Điện thoại
  cmnd: string;           // CMND
  
  // Các field phụ trợ
  ngaySinh?: string;      // New: Ngày sinh khách hàng
  ngayCap?: string;       // New: Ngày cấp CCCD
  loaiHang?: string;      
  ngayHetHan?: string;    
  trangThai?: TrangThaiBienNhan;
  nhanVien?: string;
}

// Interface cho Lịch sử giao dịch
export interface LichSuGiaoDich {
  id: string;
  ngay: string;
  loai: string;
  soTien: number;
  nhanVien: string;
  ghiChu?: string;
}

// Interface cho thống kê tổng quan
export interface ThongKeTongQuan {
  tongTienCam: number;
  tongTienChuoc: number;
  tongTienLai: number;
  soGiaoDich: number;
  soKhachHangCam: number;
  soKhachHangChuoc: number;
}

// Interface cho bộ lọc tìm kiếm (Giữ nguyên tên field input để không ảnh hưởng logic form)
export interface BienNhanFilter {
  maBN?: string;
  tenKhach?: string;
  sdt?: string;
  cmnd?: string;
  tuNgay?: string;
  denNgay?: string;
}
