import React from 'react';
import { X, Printer, Coins, History, CreditCard } from 'lucide-react';
import { BienNhan, TrangThaiBienNhan } from '../types';
import { formatCurrency, formatDate, formatDateShort } from '../utils/format';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BienNhan | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const isDaChuoc = data.trangThai === TrangThaiBienNhan.DA_CHUOC;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết biên nhận</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDaChuoc ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isDaChuoc ? 'Đã Chuộc' : 'Đang Cầm'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Mã BN: <span className="font-mono font-medium text-gray-700">{data.maBienNhan}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column: Customer & Item Info */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* Customer Info Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Họ và tên</label>
                    <p className="font-medium text-gray-900">{data.tenKhachHang}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Điện thoại</label>
                    <p className="font-medium text-gray-900">{data.dienThoai}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">CMND/CCCD</label>
                    <p className="font-medium text-gray-900">{data.cmnd}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Địa chỉ</label>
                    <p className="font-medium text-gray-900 truncate" title={data.diaChi}>{data.diaChi}</p>
                  </div>
                </div>
              </div>

              {/* Item Info Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                   <span className="w-1 h-4 bg-gold-500 rounded-full"></span>
                   Thông tin tài sản
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-1">
                      <label className="text-xs text-gray-500">Loại hàng</label>
                      <p className="font-medium text-gray-900">{data.loaiHang}</p>
                    </div>
                     <div className="space-y-1">
                      <label className="text-xs text-gray-500">Trị giá định giá</label>
                      <p className="font-medium text-gray-900">{formatCurrency(data.triGiaTaiSan)}</p>
                    </div>
                     <div className="space-y-1">
                      <label className="text-xs text-gray-500">Số lượng</label>
                      <p className="font-medium text-gray-900">1</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Mô tả chi tiết</label>
                    <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {data.moTa}
                    </p>
                  </div>
                   <div className="grid grid-cols-2 gap-4 mt-2">
                       {/* Placeholder for images */}
                       <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                         Hình ảnh món hàng
                       </div>
                       <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
                         Hình ảnh khách hàng
                       </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financials */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                <h4 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center gap-2">
                   <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                   Tài chính
                </h4>
                
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Ngày cầm</span>
                    <span className="font-medium">{formatDateShort(data.ngayCam)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Ngày hết hạn</span>
                    <span className="font-medium text-red-600">{formatDateShort(data.ngayHetHan)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Số ngày cầm</span>
                    <span className="font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{data.soNgayCam} ngày</span>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tiền gốc</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(data.tienGoc)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lãi suất (ước tính)</span>
                      <span className="font-bold text-lg text-orange-600">{formatCurrency(data.tienLai)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phát sinh</span>
                      <span className="font-medium text-gray-700">{formatCurrency(data.tienPhatSinh)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-600">TỔNG THANH TOÁN</span>
                   </div>
                   <div className="text-3xl font-bold text-primary-700">
                     {formatCurrency(data.tienGoc + data.tienLai + data.tienPhatSinh)}
                   </div>
                   <p className="text-xs text-gray-500 mt-1 italic">
                     *Đã bao gồm gốc, lãi và phí phát sinh đến thời điểm hiện tại.
                   </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <History size={18} />
            Nhật ký giao dịch
          </button>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <Printer size={18} />
              In biên nhận
            </button>
            
            {!isDaChuoc && (
              <>
                 <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-sm shadow-amber-200">
                  <Coins size={18} />
                  Thêm/Trả bớt
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-primary-200">
                  <CreditCard size={18} />
                  Chuộc đồ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;