import React, { useState, useRef } from 'react';
import { X, Printer, Coins, History, CreditCard, Eye, ArrowLeft } from 'lucide-react';
import { BienNhan } from '../types';
import { formatCurrency, formatDate, formatDateShort } from '../utils/format';
import { ReceiptTemplate } from './ReceiptTemplate';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BienNhan | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Reset mode khi đóng modal
  React.useEffect(() => {
    if (!isOpen) setIsPreviewMode(false);
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Logic mới: maLoaiGiaoDich === "CHD" là đã chuộc
  const isDaChuoc = data.maLoaiGiaoDich === 'CHD';

  // Tách mô tả thành các dòng cho bảng
  const descriptionItems = data.moTa 
    ? data.moTa.split('+').map(item => item.trim()).filter(item => item.length > 0) 
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Ẩn ReceiptTemplate khỏi giao diện người dùng, chỉ hiện khi in (nhờ logic CSS trong component đó) 
          Tuy nhiên, để user xem trước (Preview), ta có thể render nó trong modal body khi isPreviewMode = true
      */}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDaChuoc ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {isDaChuoc ? 'Đã Chuộc' : 'Đang Cầm'}
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

        {/* Modal Body - Switch between Details and Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
           {isPreviewMode ? (
               <div className="flex justify-center p-8 bg-gray-200 min-h-full">
                   <div className="shadow-lg transform scale-90 origin-top">
                       {/* Hiển thị bản xem trước giống y hệt lúc in nhưng bỏ class hidden */}
                       <div className="bg-white text-black p-8 font-sans text-sm leading-relaxed w-[210mm] min-h-[148mm]">
                            {/* Copy logic render từ ReceiptTemplate nhưng bỏ style media print để hiện thị trên UI */}
                             <div className="mb-8">
                                <div className="flex justify-between items-start mb-6">
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex"><span className="font-bold w-24">Khách hàng:</span><span className="font-bold text-lg">{data.tenKhachHang}</span></div>
                                    <div className="flex"><span className="font-bold w-24">Địa chỉ:</span><span>{data.diaChi}</span></div>
                                    <div className="flex"><span className="font-bold w-24">Số CCCD:</span><span className="font-bold">{data.cmnd}</span><span className="ml-8 font-bold">Số điện thoại: {data.dienThoai}</span></div>
                                    <div className="flex"><span className="font-bold w-24">Món hàng:</span><span className="font-bold uppercase">{data.moTa}</span></div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-right font-bold text-lg mb-1">{data.maBienNhan}</div>
                                    <div className="w-[150px] h-[40px] bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-400">Barcode Placeholder</div>
                                </div>
                                </div>

                                <div className="space-y-1.5 mb-4">
                                    <div className="flex items-baseline"><span className="font-bold w-24">Tiền cầm:</span><span className="font-bold text-xl">{formatCurrency(data.tienGoc).replace('₫', '')}</span></div>
                                    <div className="flex items-baseline"><span className="font-bold w-24">Bằng chữ:</span><span className="italic font-medium">... (Hiển thị khi in)</span></div>
                                    <div className="font-bold mt-2">Thời gian vay kể từ ngày ..{formatDateShort(data.ngayCam)}.. Đến ngày ..{formatDateShort(data.ngayHetHan)}..</div>
                                </div>
                                
                                <div className="text-sm mb-8 text-justify leading-snug">Lãi suất: 2% /tháng - Lãi ngày: 3% /tháng. Thời hạn cầm 3 tháng.<br/>Khách hàng đồng ý quá 3 tháng không đóng lãi thì mất đồ.</div>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-400 my-8 relative"><span className="absolute left-1/2 -top-3 bg-white px-2 text-gray-500 text-xs italic">Cắt theo đường này</span></div>
                            <div className="pt-4 text-center text-gray-400 italic">... Phần cuống lưu (Hiển thị đầy đủ khi in) ...</div>
                       </div>
                   </div>
               </div>
           ) : (
               <div className="p-6">
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
                            <p className="font-medium text-gray-900">{formatCurrency(data.giaTriMonHang)}</p>
                            </div>
                            <div className="space-y-1">
                            <label className="text-xs text-gray-500">Số lượng</label>
                            <p className="font-medium text-gray-900">{data.soLuong}</p>
                            </div>
                        </div>
                        
                        {/* Mô tả chi tiết dạng bảng */}
                        <div className="space-y-1 mt-4">
                            <label className="text-xs text-gray-500 block mb-2">Mô tả chi tiết</label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-2 text-center w-12 border-r border-gray-200">STT</th>
                                            <th className="px-4 py-2 text-left">Diễn giải</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {descriptionItems.length > 0 ? (
                                            descriptionItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-center text-gray-500 border-r border-gray-100 font-mono text-xs">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-800 font-medium">
                                                        {item}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 text-center text-gray-400 italic">
                                                    Không có mô tả chi tiết
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
                        Thông tin
                        </h4>
                        
                        <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 text-sm">Ngày cầm</span>
                            <span className="font-medium">{formatDateShort(data.ngayCam)}</span>
                        </div>
                        
                        {isDaChuoc && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-green-50 px-2 -mx-2 rounded">
                                <span className="text-green-700 text-sm font-semibold">Ngày chuộc</span>
                                <span className="font-bold text-green-700">{formatDateShort(data.ngayGiaoDich)}</span>
                            </div>
                        )}

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