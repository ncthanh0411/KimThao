import React from 'react';
import Barcode from 'react-barcode';
import { BienNhan } from '../types';
import { formatDateShort, formatCurrency } from '../utils/format';
import { readMoney } from '../utils/readMoney';

interface ReceiptTemplateProps {
  data: BienNhan;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ data }) => {
  // Lấy ngày hiện tại
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();

  const moneyInWords = readMoney(data.tienGoc);

  return (
    <div id="receipt-print-area" className="hidden print:block bg-white text-black font-sans text-[13px] leading-snug mx-auto">
      <style>
        {`
          @media print {
            @page {
              size: 148mm 210mm; /* Khổ A5 hoặc tùy chỉnh gần với 20cm */
              margin: 0mm; 
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
              height: 100%;
            }
          }
        `}
      </style>

      {/* 
        LOGIC CANH CHỈNH CHO GIẤY IN SẴN (PRE-PRINTED):
        1. Top Padding (~35mm): Để chừa chỗ cho Header Tiệm Vàng in sẵn.
        2. Content: Chỉ in chữ đen.
        3. Bottom Padding: Căn chỉnh phần cuống.
      */}

      <div className="relative px-6 pt-[38mm]"> {/* Cách top 38mm để né Header in sẵn */}
        
        {/* MÃ VẠCH & SỐ BIÊN NHẬN (Góc phải trên cùng) */}
        <div className="absolute top-[30mm] right-6 text-right">
             <div className="font-bold text-sm mb-1">{data.maBienNhan}</div>
             <div className="h-8 overflow-hidden flex justify-end">
                <Barcode 
                    value={data.maBienNhan} 
                    width={1.2} 
                    height={35} 
                    fontSize={0} 
                    displayValue={false}
                    margin={0}
                />
             </div>
        </div>

        {/* --- PHẦN THÂN TRÊN --- */}
        <div className="space-y-1.5 mt-4">
            <div className="flex">
                <span className="font-bold w-[100px] shrink-0">Khách hàng:</span>
                <span className="font-bold text-base">{data.tenKhachHang}</span>
            </div>
            
            {/* Dòng Địa chỉ */}
            <div className="flex">
               <span className="font-bold w-[100px] shrink-0">Địa chỉ:</span>
               <span className="truncate">{data.diaChi}</span>
            </div>
            
            {/* Dòng CCCD & SĐT */}
            <div className="flex items-center">
               <span className="font-bold w-[100px] shrink-0">Số CCCD:</span>
               <span className="font-bold w-[140px]">{data.cmnd}</span>
               
               <span className="font-bold mr-2">Số điện thoại:</span>
               <span className="font-bold">{data.dienThoai}</span>
            </div>
            
            {/* Dòng Món hàng */}
            <div className="flex">
               <span className="font-bold w-[100px] shrink-0">Món hàng:</span>
               <span className="font-bold font-mono text-[13px]">{data.moTa}</span>
            </div>
        </div>

        {/* Khoảng cách nhỏ */}
        <div className="h-4"></div>

        {/* THÔNG TIN TIỀN & NGÀY */}
        <div className="space-y-1.5">
             <div className="flex items-baseline">
               <span className="font-bold w-[100px] shrink-0">Tiền cầm:</span>
               <span className="font-bold text-lg">{formatCurrency(data.tienGoc).replace('₫', '')}</span>
            </div>
            <div className="flex items-baseline">
               <span className="font-bold w-[100px] shrink-0">Bằng chữ:</span>
               <span className="italic font-medium">{moneyInWords}</span>
            </div>
            <div className="font-bold mt-1">
                Thời gian vay kể từ ngày ..{formatDateShort(data.ngayCam)}.. Đến ngày ..{formatDateShort(data.ngayHetHan)}..
            </div>
        </div>

        {/* ĐIỀU KHOẢN (Chữ đen, đậm) */}
        <div className="mt-2 text-[12px] leading-snug font-bold text-black text-justify">
           Lãi suất: 2% /tháng - Lãi ngày: 3% /tháng. Thời hạn cầm 3 tháng.
           Khách hàng đồng ý quá 3 tháng không đóng lãi thì mất đồ.
        </div>

        {/* CHỮ KÝ */}
        <div className="flex justify-between items-start mt-4 px-2">
            <div className="text-center w-32">
                <p className="font-bold mb-8 text-[12px]">Khách hàng</p>
                <p className="font-bold uppercase text-[12px]">{data.tenKhachHang}</p>
            </div>
            <div className="text-center w-48">
                <p className="italic text-[11px] mb-1">Tân Hòa ngày {day} tháng {month} năm {year}</p>
                <p className="font-bold text-red-600 text-[12px] uppercase hidden">CHỦ NHÂN</p> {/* Ẩn chữ Chủ Nhân vì giấy in có sẵn? Nếu giấy chưa có thì xóa class hidden */}
                <p className="font-bold text-[12px] uppercase">CHỦ NHÂN</p>
            </div>
        </div>
      </div>

      {/* --- PHẦN CUỐNG LƯU (DƯỚI CÙNG) --- */}
      {/* Sử dụng đường kẻ đứt nét nhẹ, bỏ chữ cắt */}
      <div className="border-t border-dashed border-gray-400 mx-4 my-2"></div>

      {/* 
         Margin left 24mm để né cái Logo KT đỏ in sẵn ở góc dưới trái 
      */}
      <div className="pl-[26mm] pr-4 text-[12px] relative">
         
         {/* Mã vạch nhỏ ở phần cuống (Góc phải) */}
         <div className="absolute top-0 right-0 text-right">
             <div className="font-bold text-[11px] mb-0.5">{data.maBienNhan}</div>
             <Barcode 
                 value={data.maBienNhan} 
                 width={1} 
                 height={25} 
                 fontSize={0} 
                 displayValue={false} 
                 margin={0}
            />
         </div>

         <div className="space-y-1 pt-1">
            <div className="flex">
                <span className="font-bold w-20 shrink-0">Khách hàng:</span>
                <span className="font-bold">{data.tenKhachHang}</span>
            </div>
             <div className="flex">
                <span className="font-bold w-20 shrink-0">Số ĐT:</span>
                <span className="font-bold">{data.dienThoai}</span>
            </div>
            <div className="flex">
                <span className="font-bold w-20 shrink-0">Số CMND:</span>
                <span className="font-bold">{data.cmnd}</span>
            </div>
            <div className="flex">
                <span className="font-bold w-20 shrink-0">Món hàng:</span>
                <span className="truncate font-bold w-[60%]">{data.moTa}</span>
            </div>
            
            <div className="flex mt-1">
                 <div className="w-1/2">
                    <span className="font-bold mr-1">Tiền cầm:</span>
                    <span className="font-bold">{formatCurrency(data.tienGoc).replace('₫', '')}</span>
                 </div>
            </div>
            
            <div className="flex text-[11px] font-semibold mt-1">
                <div className="mr-4">Ngày cầm: {formatDateShort(data.ngayCam)}</div>
                <div>Ngày đến hạn: {formatDateShort(data.ngayHetHan)}</div>
            </div>
         </div>
      </div>

    </div>
  );
};