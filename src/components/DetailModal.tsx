import React, { useState } from 'react';
import { X, Printer, Coins, History, CreditCard, Eye, ArrowLeft, Box, DollarSign, Calendar } from 'lucide-react';
import { BienNhan, TrangThaiBienNhan } from '../types';
import { formatCurrency, formatDateShort } from '../utils/format';
import { ReceiptTemplate } from './ReceiptTemplate';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BienNhan | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  React.useEffect(() => {
    if (!isOpen) setIsPreviewMode(false);
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Logic kiểm tra Đã chuộc
  const isDaChuoc = data.maLoaiGiaoDich === 'CHD' || data.trangThai === TrangThaiBienNhan.DA_CHUOC;

  // Tách mô tả thành các dòng cho danh sách
  const descriptionItems = data.moTa 
    ? data.moTa.split('+').map(item => item.trim()).filter(item => item.length > 0) 
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Ẩn ReceiptTemplate khỏi giao diện người dùng, chỉ hiện khi in */}
      <ReceiptTemplate data={data} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative print:hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            {isPreviewMode && (
                <button onClick={() => setIsPreviewMode(false)} className="mr-2 text-gray-500 hover:text-gray-800 transition-colors" title="Quay lại">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div>
                <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">
                    {isPreviewMode ? 'Xem trước biên nhận' : 'Chi tiết biên nhận'}
                </h3>
                {!isPreviewMode && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        isDaChuoc ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {isDaChuoc ? 'Đã Chuộc' : 'Đang Cầm'}
                        {isDaChuoc && data.ngayGiaoDich && (
                            <span className="font-normal opacity-75">({formatDateShort(data.ngayGiaoDich)})</span>
                        )}
                    </span>
                )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Mã BN: <span className="font-mono font-medium text-gray-700">{data.maBienNhan}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
           {isPreviewMode ? (
               <div className="flex justify-center p-8 bg-gray-200 min-h-full">
                   {/* Preview Area - Just a visual representation */}
                   <div className="bg-white p-8 w-[210mm] shadow-lg text-sm">
                        <div className="text-center text-gray-400 italic">Nội dung xem trước (giống khi in)</div>
                   </div>
               </div>
           ) : (
               <div className="p-6">
                {/* 
                   LAYOUT GIỐNG HỆT TRANG QUẢN LÝ (RECEIPT FORM)
                */}
                <div className="grid grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        
                        {/* Customer Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                             <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                    <span className="p-1 bg-blue-100 text-blue-600 rounded"><Box size={14} /></span>
                                    Thông tin Khách hàng
                                </h3>
                             </div>
                             <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                 <div><label className="text-xs text-gray-500 block">Tên khách hàng</label><span className="font-medium text-gray-900">{data.tenKhachHang}</span></div>
                                 <div><label className="text-xs text-gray-500 block">Ngày sinh</label><span className="font-medium text-gray-900">{formatDateShort(data.ngaySinh || '')}</span></div>
                                 <div><label className="text-xs text-gray-500 block">Điện thoại</label><span className="font-medium text-gray-900">{data.dienThoai}</span></div>
                                 <div><label className="text-xs text-gray-500 block">Địa chỉ</label><span className="font-medium text-gray-900">{data.diaChi}</span></div>
                                 <div><label className="text-xs text-gray-500 block">CMND/CCCD</label><span className="font-medium text-gray-900">{data.cmnd}</span></div>
                                 <div><label className="text-xs text-gray-500 block">Ngày cấp</label><span className="font-medium text-gray-900">{formatDateShort(data.ngayCap || '')}</span></div>
                             </div>
                        </div>

                        {/* Asset Card */}
                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                             <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                    <span className="p-1 bg-gold-100 text-gold-600 rounded"><Box size={14} /></span>
                                    Thông tin Tài sản
                                </h3>
                             </div>
                             <div className="p-4 text-sm">
                                 <div className="grid grid-cols-2 gap-4 mb-4">
                                     <div><label className="text-xs text-gray-500 block">Loại vàng</label><span className="font-medium text-gray-900">{data.loaiHang}</span></div>
                                     <div><label className="text-xs text-gray-500 block">Trị giá</label><span className="font-medium text-gray-900">{formatCurrency(data.giaTriMonHang)}</span></div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2 mb-2">
                                    <label className="text-xs text-gray-500 block font-medium">Danh sách món hàng</label>
                                    <span className="ml-2 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                        ({data.soLuong} món)
                                    </span>
                                 </div>

                                 <div className="border border-gray-200 rounded-lg bg-gray-50 p-2 min-h-[100px]">
                                     <ul className="divide-y divide-gray-100">
                                         {descriptionItems.map((item, idx) => (
                                             <li key={idx} className="py-2 px-2 flex gap-2">
                                                 <span className="font-mono text-xs text-gray-500 bg-white border border-gray-200 rounded px-1.5">{idx + 1}</span>
                                                 <span className="text-gray-800 font-medium">{item}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                             <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                    <span className="p-1 bg-green-100 text-green-600 rounded"><DollarSign size={14} /></span>
                                    Thông tin Tài chính
                                </h3>
                             </div>
                             <div className="p-4 flex-1 space-y-4">
                                 <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-gray-500 flex items-center gap-1"><Calendar size={12}/> Ngày cầm</span>
                                         <span className="font-medium">{formatDateShort(data.ngayCam)}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-gray-500 flex items-center gap-1"><Calendar size={12}/> Hết hạn</span>
                                         <span className="font-medium text-red-600">{formatDateShort(data.ngayHetHan)}</span>
                                     </div>
                                     <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                         <span className="text-xs text-gray-400">Thời gian cầm</span>
                                         <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded">{data.soNgayCam} ngày</span>
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tiền cầm (Gốc)</label>
                                     <div className="w-full p-3 border rounded-lg bg-gray-50 text-2xl font-bold text-right text-primary-700">
                                         {formatCurrency(data.tienGoc)}
                                     </div>
                                 </div>

                                 <div className="space-y-2 pt-2 border-t border-gray-100">
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-500">Lãi suất</span>
                                         <span className="font-bold text-orange-600">{formatCurrency(data.tienLai)}</span>
                                     </div>
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-500">Phí phát sinh</span>
                                         <span className="font-medium text-gray-700">{formatCurrency(data.tienPhatSinh)}</span>
                                     </div>
                                     
                                     <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2">
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-600 font-bold text-[10px] uppercase mb-1">TỔNG THANH TOÁN</span>
                                            <span className="text-3xl font-bold text-emerald-700">
                                                {formatCurrency(data.tienGoc + data.tienLai + data.tienPhatSinh)}
                                            </span>
                                        </div>
                                    </div>

                                 </div>
                             </div>
                         </div>
                    </div>

                </div>
               </div>
           )}
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <div className="flex gap-2">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <History size={18} />
                Nhật ký
            </button>
          </div>

          <div className="flex gap-3">
            {isPreviewMode ? (
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-primary-200"
                >
                    <Printer size={18} />
                    Xác nhận & In ngay
                </button>
            ) : (
                <button 
                    onClick={() => setIsPreviewMode(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <Eye size={18} />
                    Xem trước biên nhận
                </button>
            )}
            
            {!isPreviewMode && !isDaChuoc && (
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