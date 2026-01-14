import React from 'react';
import Barcode from 'react-barcode';
import { BienNhan } from '../types';
import { formatDateShort, formatCurrency } from '../utils/format';
import { readMoney } from '../utils/readMoney';

interface ReceiptTemplateProps {
  data: BienNhan;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ data }) => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  const moneyInWords = readMoney(data.tienGoc);

  return (
    <div id="receipt-print-area" className="hidden print:block bg-white text-black font-sans text-[12px] leading-snug mx-auto relative">
      <style>
        {`
          @media print {
            @page {
              margin: 0; /* XÓA HOÀN TOÀN Header/Footer của trình duyệt (URL, Ngày giờ, Tiêu đề) */
              size: auto; 
            }
            body {
              margin: 0;
              padding: 0;
            }
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
            }
          }
        `}
      </style>

      {/* 
         --- PHẦN 1: BIÊN NHẬN (KHÁCH GIỮ) --- 
         Yêu cầu: Trái 1.5cm, Phải 1.5cm, Trên 1.5cm
      */}
      <div style={{ padding: '15mm 15mm 2mm 15mm' }}>
        
        {/* Header Tiệm Vàng */}
        <div className="flex justify-between items-start mb-2">
            {/* Logo KT */}
            <div className="border-[3px] border-red-600 w-20 h-16 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-4xl font-serif">KT</span>
            </div>

            {/* Thông tin tiệm */}
            <div className="flex-1 text-center px-2">
                <h4 className="text-blue-700 font-bold uppercase text-[11px]">TIỆM VÀNG</h4>
                <h1 className="text-red-600 font-bold text-xl uppercase leading-none mb-1">KIM THẢO <span className="text-base">(TÂN HÒA)</span></h1>
                <p className="text-blue-700 text-[10px]">ĐC: 40 Tỉnh Lộ 862, Ấp Hòa Thơm 1, Xã Tân Hòa, Tỉnh Đồng Tháp</p>
                <p className="text-blue-700 text-[10px] font-bold">ĐT: 913 703 974</p>
            </div>
            
             {/* Mã vạch góc phải */}
             <div className="w-24 text-right">
                 <div className="font-bold text-[11px] mb-0.5">{data.maBienNhan}</div>
                 <div className="flex justify-end">
                    <Barcode 
                        value={data.maBienNhan} 
                        width={1} 
                        height={25} 
                        fontSize={0} 
                        displayValue={false}
                        margin={0}
                    />
                 </div>
             </div>
        </div>

        <h2 className="text-red-600 font-bold text-xl text-center uppercase mb-3">BIÊN NHẬN CẦM ĐỒ</h2>

        {/* Nội dung chi tiết */}
        <div className="space-y-1">
            <div className="flex">
                <span className="font-bold w-[90px] shrink-0">Khách hàng:</span>
                <span className="font-bold text-sm">{data.tenKhachHang}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-[90px] shrink-0">Địa chỉ:</span>
               <span className="truncate">{data.diaChi}</span>
            </div>
            <div className="flex items-center">
               <span className="font-bold w-[90px] shrink-0">Số CCCD:</span>
               <span className="font-bold w-[120px]">{data.cmnd}</span>
               <span className="font-bold mr-2">Số điện thoại:</span>
               <span className="font-bold">{data.dienThoai}</span>
            </div>
            <div className="flex">
               <span className="font-bold w-[90px] shrink-0">Món hàng:</span>
               <span className="font-bold font-mono text-[12px]">{data.moTa}</span>
            </div>
        </div>

        <div className="h-2"></div>

        <div className="space-y-1">
             <div className="flex items-baseline">
               <span className="font-bold w-[90px] shrink-0">Tiền cầm:</span>
               <span className="font-bold text-base">{formatCurrency(data.tienGoc).replace('₫', '')}</span>
            </div>
            <div className="flex items-baseline">
               <span className="font-bold w-[90px] shrink-0">Bằng chữ:</span>
               <span className="italic font-medium">{moneyInWords}</span>
            </div>
            <div className="font-bold mt-1">
                Thời gian vay kể từ ngày ..{formatDateShort(data.ngayCam)}.. Đến ngày ..{formatDateShort(data.ngayHetHan)}..
            </div>
        </div>

        <div className="mt-2 text-[11px] leading-tight font-bold text-black text-justify">
           Lãi suất: 2% /tháng - Lãi ngày: 3% /tháng. Thời hạn cầm 3 tháng.
           Khách hàng đồng ý quá 3 tháng không đóng lãi thì mất đồ.
        </div>

        <div className="flex justify-between items-start mt-2 px-4">
            <div className="text-center w-32">
                <p className="font-bold mb-6 text-[11px]">Khách hàng</p>
                <p className="font-bold uppercase text-[11px]">{data.tenKhachHang}</p>
            </div>
            <div className="text-center w-48">
                <p className="italic text-[10px] mb-1">Tân Hòa ngày {day} tháng {month} năm {year}</p>
                <p className="font-bold text-red-600 text-[11px] uppercase">CHỦ NHÂN</p>
            </div>
        </div>
      </div>


      {/* --- ĐƯỜNG KẺ PHÂN CÁCH (KHÔNG CÓ CHỮ CẮT) --- */}
      <div className="border-t border-dashed border-gray-400 mx-4 my-2"></div>


      {/* 
          --- PHẦN 2: CUỐNG LƯU --- 
          Yêu cầu: Trái 7cm, Phải 3cm
      */}
      <div style={{ paddingLeft: '70mm', paddingRight: '30mm', paddingBottom: '5mm' }} className="text-[11px]">
         
         <div className="flex justify-between items-start mb-2">
            {/* Logo nhỏ hoặc Tên tiệm lặp lại nếu cần, ở đây để trống để tiết kiệm không gian hoặc né logo in sẵn */}
             <div className="border-[2px] border-red-600 w-12 h-10 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-xl font-serif">KT</span>
            </div>

            {/* Mã vạch nhỏ ở phần cuống */}
             <div className="text-right">
                 <div className="font-bold text-[10px] mb-0.5">{data.maBienNhan}</div>
                 <Barcode 
                     value={data.maBienNhan} 
                     width={1} 
                     height={20} 
                     fontSize={0} 
                     displayValue={false} 
                     margin={0}
                />
             </div>
         </div>

         <div className="space-y-1">
            <div className="flex">
                <span className="font-bold w-16 shrink-0">Khách hàng:</span>
                <span className="font-bold">{data.tenKhachHang}</span>
            </div>
            <div className="flex">
                <span className="font-bold w-16 shrink-0">Số ĐT:</span>
                <span className="font-bold">{data.dienThoai}</span>
            </div>
             <div className="flex">
                <span className="font-bold w-16 shrink-0">Số CMND:</span>
                <span className="font-bold">{data.cmnd}</span>
            </div>
            <div className="flex">
                <span className="font-bold w-16 shrink-0">Món hàng:</span>
                <span className="truncate font-bold w-[80%]">{data.moTa}</span>
            </div>
            
            <div className="flex mt-1">
                 <div>
                    <span className="font-bold mr-2">Tiền cầm:</span>
                    <span className="font-bold text-sm">{formatCurrency(data.tienGoc).replace('₫', '')}</span>
                 </div>
            </div>
            
            <div className="flex justify-between text-[10px] font-semibold mt-1">
                <div>Ngày cầm: {formatDateShort(data.ngayCam)}</div>
                <div>Đến hạn: {formatDateShort(data.ngayHetHan)}</div>
            </div>
         </div>
      </div>

    </div>
  );
};