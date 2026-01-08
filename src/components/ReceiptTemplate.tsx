import React from 'react';
import Barcode from 'react-barcode';
import { BienNhan } from '../types';
import { formatDateShort, formatCurrency } from '../utils/format';
import { readMoney } from '../utils/readMoney';

interface ReceiptTemplateProps {
  data: BienNhan;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ data }) => {
  // Lấy ngày hiện tại cho phần "Ngày... tháng... năm..."
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();

  // Định dạng số tiền
  const moneyInWords = readMoney(data.tienGoc);

  // Style cho phần in
  // Chúng ta sử dụng CSS in-line và class Tailwind để tạo bố cục
  return (
    <div id="receipt-print-area" className="hidden print:block bg-white text-black p-8 font-sans text-sm leading-relaxed max-w-[210mm] mx-auto">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-print-area, #receipt-print-area * {
              visibility: visible;
            }
            #receipt-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 20px;
              background: white;
            }
          }
        `}
      </style>

      {/* --- PHẦN TRÊN (GIAO CHO KHÁCH) --- */}
      <div className="mb-8">
        {/* Header: Thông tin khách & Barcode */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 space-y-1.5">
            <div className="flex">
              <span className="font-bold w-24">Khách hàng:</span>
              <span className="font-bold text-lg">{data.tenKhachHang}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-24">Địa chỉ:</span>
               <span>{data.diaChi}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-24">Số CCCD:</span>
               <span className="font-bold">{data.cmnd}</span>
               <span className="ml-8 font-bold">Số điện thoại: {data.dienThoai}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-24">Món hàng:</span>
               <span className="font-bold uppercase">{data.moTa}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
             <div className="text-right font-bold text-lg mb-1">{data.maBienNhan}</div>
             <Barcode 
                value={data.maBienNhan} 
                width={1.5} 
                height={40} 
                fontSize={14} 
                displayValue={false}
                margin={0}
             />
          </div>
        </div>

        {/* Body: Tài chính */}
        <div className="space-y-1.5 mb-4">
             <div className="flex items-baseline">
               <span className="font-bold w-24">Tiền cầm:</span>
               <span className="font-bold text-xl">{formatCurrency(data.tienGoc).replace('₫', '')}</span>
            </div>
            <div className="flex items-baseline">
               <span className="font-bold w-24">Bằng chữ:</span>
               <span className="italic font-medium">{moneyInWords}</span>
            </div>
            <div className="font-bold mt-2">
                Thời gian vay kể từ ngày ..{formatDateShort(data.ngayCam)}.. Đến ngày ..{formatDateShort(data.ngayHetHan)}..
            </div>
        </div>

        {/* Terms */}
        <div className="text-sm mb-8 text-justify leading-snug">
           Lãi suất: 2% /tháng - Lãi ngày: 3% /tháng. Thời hạn cầm 3 tháng.
           <br/>
           Khách hàng đồng ý quá 3 tháng không đóng lãi thì mất đồ.
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-start mb-16">
            <div className="text-center w-40">
                <p className="font-bold mb-16">Khách hàng</p>
                <p className="font-bold uppercase">{data.tenKhachHang}</p>
            </div>
            <div className="text-center w-60">
                <p className="italic mb-1">Tân Hòa ngày {day} tháng {month} năm {year}</p>
                 {/* Khoảng trống để đóng dấu/ký tên chủ tiệm nếu cần */}
            </div>
        </div>
      </div>

      {/* --- ĐƯỜNG CẮT (DASHED LINE) --- */}
      <div className="border-t-2 border-dashed border-gray-400 my-8 relative">
         <span className="absolute left-1/2 -top-3 bg-white px-2 text-gray-500 text-xs italic">Cắt theo đường này</span>
      </div>

      {/* --- PHẦN DƯỚI (CUỐNG LƯU) --- */}
      <div className="pt-4">
         <div className="flex justify-between items-start">
             <div className="space-y-2 flex-1">
                <div className="flex">
                    <span className="font-bold w-24">Khách hàng:</span>
                    <span className="font-bold">{data.tenKhachHang}</span>
                </div>
                 <div className="flex">
                    <span className="font-bold w-24">Số ĐT:</span>
                    <span>{data.dienThoai}</span>
                </div>
                 <div className="flex">
                    <span className="font-bold w-24">Số CMND:</span>
                    <span>{data.cmnd}</span>
                </div>
                 <div className="flex">
                    <span className="font-bold w-24">Món hàng:</span>
                    <span className="uppercase text-xs font-bold break-words max-w-[300px]">{data.moTa}</span>
                </div>
             </div>

             <div className="flex flex-col items-end space-y-2">
                <div className="text-right font-bold text-lg">{data.maBienNhan}</div>
                 <Barcode 
                    value={data.maBienNhan} 
                    width={1.2} 
                    height={30} 
                    fontSize={12} 
                    displayValue={false}
                    margin={0}
                 />
                <div className="text-right text-sm">
                    <div>Tiền cầm: <span className="font-bold">{formatCurrency(data.tienGoc).replace('₫', '')}</span></div>
                    <div>Ngày cầm: {formatDateShort(data.ngayCam)}</div>
                    <div>Ngày đến hạn: {formatDateShort(data.ngayHetHan)}</div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};