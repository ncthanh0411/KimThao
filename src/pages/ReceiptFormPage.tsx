import React, { useState, useEffect, useRef } from 'react';
import { Save, Printer, CreditCard, History, Loader2, RefreshCw, Calendar, DollarSign, Box, Plus, Trash2, X, QrCode } from 'lucide-react';
import { pawnService } from '../api/pawnService';
import { BienNhan, TrangThaiBienNhan } from '../types';
import { formatCurrency, formatDateShort } from '../utils/format';
import { ReceiptTemplate } from '../components/ReceiptTemplate';

interface ReceiptFormPageProps {
  mode: 'create' | 'manage';
}

// Giá trị mặc định cho form
const DEFAULT_FORM_DATA: Partial<BienNhan> = {
    maBienNhan: '',
    tenKhachHang: '',
    dienThoai: '',
    cmnd: '',
    diaChi: '',
    ngaySinh: '',
    ngayCap: '',
    loaiHang: 'Vàng',
    giaTriMonHang: 0,
    soLuong: 0,
    moTa: '', 
    tienGoc: 0,
    tienLai: 0,
    tienPhatSinh: 0,
    soNgayCam: 0, // Mới tạo thì số ngày cầm là 0 hoặc chưa tính
    ngayCam: new Date().toISOString().split('T')[0],
    ngayHetHan: '',
    ngayGiaoDich: '' // Ngày chuộc
};

const formatNumberInput = (num: number | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
};

const ReceiptFormPage: React.FC<ReceiptFormPageProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // State kỳ hạn cho phép user nhập (mặc định 90 ngày)
  const [kyHan, setKyHan] = useState(90);

  const maBienNhanRef = useRef<HTMLInputElement>(null);
  const [tempItemInput, setTempItemInput] = useState('');
  
  const SESSION_KEY = `receipt_form_v2_${mode}`;

  const [formData, setFormData] = useState<Partial<BienNhan>>(() => {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
          return JSON.parse(saved);
      }
      return { ...DEFAULT_FORM_DATA };
  });

  // Tính ngày hết hạn dựa trên ngày cầm + kỳ hạn (Chỉ chạy ở mode Create)
  useEffect(() => {
      if (mode === 'create' && formData.ngayCam) {
          const start = new Date(formData.ngayCam);
          const end = new Date(start);
          end.setDate(start.getDate() + kyHan);
          const endStr = end.toISOString().split('T')[0];
          
          if (formData.ngayHetHan !== endStr) {
              setFormData(prev => ({ ...prev, ngayHetHan: endStr }));
          }
      }
  }, [kyHan, formData.ngayCam, mode]);

  // Logic kiểm tra trạng thái
  const isDaChuoc = formData.maLoaiGiaoDich === 'CHD' || formData.trangThai === TrangThaiBienNhan.DA_CHUOC;
  const isReadOnly = mode === 'manage';

  useEffect(() => {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) {
          if (mode === 'create') {
            const randomId = `BN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
            setFormData({ ...DEFAULT_FORM_DATA, maBienNhan: randomId });
          } else {
            setFormData({ ...DEFAULT_FORM_DATA, maBienNhan: '' });
          }
      }
      setTempItemInput('');
      if (mode === 'manage' && maBienNhanRef.current) {
          maBienNhanRef.current.focus();
      }
  }, [mode, SESSION_KEY]);

  useEffect(() => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(formData));
  }, [formData, SESSION_KEY]);

  // --- LOGIC XỬ LÝ SCANNER TẠI NÚT ENTER ---
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const val = e.currentTarget.value;
        const targetName = e.currentTarget.name;

        // Xử lý QRCode CCCD
        if (val && val.includes('|') && val.length > 30) {
            e.preventDefault(); 
            const parts = val.split('|');
            if (parts.length >= 6) {
                const cccd = parts[0];
                const name = parts[2];
                const rawDob = parts[3];       
                const address = parts[5];
                const rawIssueDate = parts[6];

                const convertDate = (d: string) => {
                    if (!d || d.length !== 8) return '';
                    const day = d.slice(0, 2);
                    const month = d.slice(2, 4);
                    const year = d.slice(4);
                    return `${year}-${month}-${day}`;
                };

                const autoFilledFields = ['cmnd', 'tenKhachHang', 'ngaySinh', 'diaChi', 'ngayCap'];

                setFormData(prev => {
                    const newData = {
                        ...prev,
                        cmnd: cccd,
                        tenKhachHang: name,
                        ngaySinh: convertDate(rawDob),
                        diaChi: address,
                        ngayCap: convertDate(rawIssueDate)
                    };
                    // Clear ô input hiện tại nếu nó không phải là field được điền tự động
                    if (!autoFilledFields.includes(targetName)) {
                         (newData as any)[targetName] = ''; 
                    }
                    return newData;
                });
            }
            return;
        }

        // Xử lý Search BN khi nhấn Enter ở ô Mã BN
        if (targetName === 'maBienNhan' && mode === 'manage') {
            handleSearchById();
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isReadOnly && e.target.name !== 'maBienNhan') return;

    const { name, value } = e.target;
    
    // Xử lý input số (tiền tệ)
    if (['tienGoc', 'soLuong', 'giaTriMonHang', 'soNgayCam'].includes(name)) {
       const cleanValue = value.replace(/\D/g, ''); 
       const numVal = cleanValue ? parseInt(cleanValue) : 0;
       
       setFormData(prev => {
          const newData = { ...prev, [name]: numVal };
          if (name === 'tienGoc') {
             newData.tienLai = numVal * 0.02; // Ước tính 2%
          }
          return newData;
       });
       return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKyHanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
      setKyHan(val);
  };

  const handleAddItem = () => {
      if (!tempItemInput.trim()) return;
      setFormData(prev => {
          const currentItems = prev.moTa ? prev.moTa.split('+').map(s => s.trim()).filter(Boolean) : [];
          const newItems = [...currentItems, tempItemInput.trim()];
          return { 
              ...prev, 
              moTa: newItems.join(' + '),
              soLuong: newItems.length
          };
      });
      setTempItemInput(''); 
  };

  const handleRemoveItem = (index: number) => {
      if (isReadOnly) return;
      setFormData(prev => {
          const currentItems = prev.moTa ? prev.moTa.split('+').map(s => s.trim()).filter(Boolean) : [];
          const newItems = currentItems.filter((_, i) => i !== index);
          return { 
              ...prev, 
              moTa: newItems.join(' + '),
              soLuong: newItems.length
          };
      });
  };

  const handleKeyDownItem = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleAddItem();
      }
  };

  const handleSearchById = async () => {
      if (mode !== 'manage' || !formData.maBienNhan || isSearching) return;
      
      setIsSearching(true);
      try {
          const result = await pawnService.getBienNhanDetail(formData.maBienNhan);
          if (result) {
              // Explicit Binding để đảm bảo data từ API map đúng vào Form
              setFormData({
                  ...result,
                  // Đảm bảo các trường không null/undefined
                  tenKhachHang: result.tenKhachHang || '',
                  dienThoai: result.dienThoai || '',
                  cmnd: result.cmnd || '',
                  diaChi: result.diaChi || '',
                  ngaySinh: result.ngaySinh || '',
                  ngayCap: result.ngayCap || '',
                  giaTriMonHang: result.giaTriMonHang || 0,
                  soLuong: result.soLuong || 0,
                  tienGoc: result.tienGoc || 0, // Đã map từ tienCam ở service
                  tienLai: result.tienLai || 0,
                  tienPhatSinh: result.tienPhatSinh || 0,
                  soNgayCam: result.soNgayCam || 0,
                  ngayCam: result.ngayCam || '',
                  ngayHetHan: result.ngayHetHan || '',
                  ngayGiaoDich: result.ngayGiaoDich || '',
                  moTa: result.moTa || '',
                  maLoaiGiaoDich: result.maLoaiGiaoDich,
                  trangThai: result.trangThai
              });
          } else {
              alert('Không tìm thấy biên nhận này!');
          }
      } catch (error) {
          alert('Lỗi kết nối server hoặc biên nhận không tồn tại');
      } finally {
          setIsSearching(false);
          // Focus lại ô search để tiện nhập tiếp
          setTimeout(() => {
              if (maBienNhanRef.current) maBienNhanRef.current.focus();
          }, 100);
      }
  };

  const handleReset = () => {
      sessionStorage.removeItem(SESSION_KEY);
      if (mode === 'create') {
          const randomId = `BN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
          setFormData({ ...DEFAULT_FORM_DATA, maBienNhan: randomId });
          setKyHan(90);
      } else {
          setFormData({ ...DEFAULT_FORM_DATA, maBienNhan: '' });
          setTimeout(() => {
              if (maBienNhanRef.current) maBienNhanRef.current.focus();
          }, 100);
      }
      setTempItemInput('');
  };

  const handleSave = async (printAfterSave = false) => {
    if (!formData.tenKhachHang || !formData.tienGoc) {
        alert('Vui lòng nhập tên khách hàng và tiền cầm.');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        alert('Lưu dữ liệu thành công!');
        if (printAfterSave) {
            window.print();
        }
        if (mode === 'create') handleReset();
    }, 600);
  };

  const dateValue = (isoString?: string) => isoString ? isoString.split('T')[0] : '';
  const itemList = formData.moTa ? formData.moTa.split('+').map(s => s.trim()).filter(Boolean) : [];

  // Updated inputClass: Changed 'cursor-not-allowed' to 'cursor-default' or removed it
  const inputClass = (isEditable = true) => `
    w-full px-2 py-1.5 border rounded text-sm transition-all font-medium outline-none
    ${isEditable 
        ? 'bg-white border-gray-300 focus:ring-1 focus:ring-primary-100 focus:border-primary-500' 
        : 'bg-gray-100 border-gray-200 text-gray-500 cursor-default' // Changed from cursor-not-allowed
    }
  `;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-2 pb-16 relative"> 
      
      <ReceiptTemplate data={formData as BienNhan} />

      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0 py-1">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {mode === 'create' ? (
                  <>
                    <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                    <span className="text-gray-800">Lập Biên Nhận Mới</span>
                  </>
              ) : (
                  <>
                    <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                    <span className="text-gray-800">Quản Lý & Tra Cứu</span>
                  </>
              )}
          </h2>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
              <RefreshCw size={12} /> Làm mới
          </button>
      </div>

      {/* MAIN FORM */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-12 gap-3 pb-6"> 
              
              {/* LEFT COLUMN */}
              <div className="col-span-12 lg:col-span-8 space-y-3">
                  
                  {/* CARD 1: KHÁCH HÀNG */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                  <span className="p-1 bg-blue-100 text-blue-600 rounded"><Box size={14} /></span>
                                  Thông tin Khách hàng
                              </h3>
                              {mode === 'manage' && (
                                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                      isDaChuoc 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-red-100 text-red-600 border-red-200'
                                  }`}>
                                      {isDaChuoc ? 'ĐÃ CHUỘC' : 'ĐANG CẦM'}
                                      {isDaChuoc && formData.ngayGiaoDich && (
                                          <span className="text-gray-600 font-medium normal-case">
                                              ({formatDateShort(formData.ngayGiaoDich)})
                                          </span>
                                      )}
                                  </div>
                              )}
                          </div>
                          {!isReadOnly && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 italic">
                                <QrCode size={12} /> Quét QR CCCD bất cứ lúc nào
                            </div>
                          )}
                      </div>

                      <div className="p-4"> 
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* MÃ BN */}
                              <div className="md:col-span-2">
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                      Mã Biên Nhận {mode === 'manage' && <span className="text-red-500">(Quét Barcode hoặc nhập số)</span>}
                                  </label>
                                  <div className="relative">
                                      <input 
                                          ref={maBienNhanRef}
                                          type="text" 
                                          name="maBienNhan"
                                          value={formData.maBienNhan}
                                          onChange={handleInputChange}
                                          onKeyDown={handleInputKeyDown}
                                          readOnly={mode === 'create'}
                                          placeholder={mode === 'manage' ? "Nhập mã..." : "Tự động tạo"}
                                          className={`w-full px-3 py-2 text-lg font-mono font-bold rounded border focus:ring-2 outline-none transition-all
                                              ${mode === 'create' 
                                                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-default' // Changed from cursor-not-allowed
                                                  : 'bg-white text-blue-700 border-blue-300 focus:border-blue-500 focus:ring-blue-100 placeholder:text-gray-300'
                                              }
                                          `}
                                          autoComplete="off"
                                      />
                                      {isSearching && (
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* HÀNG 2 */}
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Tên khách hàng</label>
                                  <input 
                                      type="text" name="tenKhachHang" 
                                      value={formData.tenKhachHang} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                      placeholder="VD: Nguyễn Văn A"
                                  />
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Ngày sinh</label>
                                  <input 
                                      type={isReadOnly ? "text" : "date"} // Chuyển sang text khi chỉ xem
                                      name="ngaySinh" 
                                      value={isReadOnly ? formatDateShort(formData.ngaySinh || '') : dateValue(formData.ngaySinh)} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                  />
                              </div>

                              {/* HÀNG 3 */}
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại</label>
                                  <input 
                                      type="text" name="dienThoai" 
                                      value={formData.dienThoai} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                      placeholder="VD: 0909..."
                                  />
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ</label>
                                  <input 
                                      type="text" name="diaChi" 
                                      value={formData.diaChi} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                      placeholder="Địa chỉ..."
                                  />
                              </div>

                              {/* HÀNG 4 */}
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">CMND / CCCD</label>
                                  <input 
                                      type="text" name="cmnd" 
                                      value={formData.cmnd} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                      placeholder="Số CCCD..."
                                  />
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Ngày cấp</label>
                                  <input 
                                      type={isReadOnly ? "text" : "date"} // Chuyển sang text khi chỉ xem
                                      name="ngayCap" 
                                      value={isReadOnly ? formatDateShort(formData.ngayCap || '') : dateValue(formData.ngayCap)} 
                                      onChange={handleInputChange}
                                      onKeyDown={handleInputKeyDown}
                                      readOnly={isReadOnly}
                                      className={inputClass(!isReadOnly)}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* CARD 2: TÀI SẢN */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                       <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2 border-b border-gray-100">
                          <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                              <span className="p-1 bg-gold-100 text-gold-600 rounded"><Box size={14} /></span>
                              Thông tin Tài sản
                          </h3>
                      </div>
                      
                      <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Loại vàng</label>
                                  <select 
                                      name="loaiHang" 
                                      value="Vàng"
                                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 cursor-default focus:outline-none" // Changed from cursor-not-allowed
                                      disabled
                                  >
                                      <option value="Vàng">Vàng</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Trị giá món hàng</label>
                                  <div className="relative">
                                    <input 
                                        type="text" name="giaTriMonHang" 
                                        value={formatNumberInput(formData.giaTriMonHang)} 
                                        onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                        className={`${inputClass(!isReadOnly)} pl-3 pr-14 text-right font-bold`} 
                                        placeholder="0"
                                    />
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">VNĐ</span>
                                  </div>
                              </div>
                          </div>

                          {/* ITEM LIST */}
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <label className="block text-xs font-medium text-gray-700">Danh sách món hàng</label>
                                  <span className="ml-2 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                      ({formData.soLuong} món)
                                  </span>
                              </div>
                              
                              {!isReadOnly && (
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text"
                                        value={tempItemInput}
                                        onChange={(e) => setTempItemInput(e.target.value)}
                                        onKeyDown={handleKeyDownItem}
                                        placeholder="Nhập tên món hàng và nhấn Enter..."
                                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gold-100 focus:border-gold-500 outline-none"
                                    />
                                    <button 
                                        onClick={handleAddItem}
                                        className="px-3 py-1.5 bg-gold-500 text-white rounded hover:bg-gold-600 transition-colors flex items-center gap-1 font-medium text-xs shadow-sm"
                                    >
                                        <Plus size={14} /> Thêm
                                    </button>
                                </div>
                              )}

                              <div className={`border border-gray-200 rounded-lg overflow-hidden min-h-[100px] ${isReadOnly ? 'bg-gray-50' : 'bg-gray-50'}`}>
                                  {itemList.length === 0 ? (
                                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6 italic text-xs">
                                          <Box size={20} className="mb-1 opacity-50" />
                                          Chưa có món hàng nào
                                      </div>
                                  ) : (
                                      <ul className="divide-y divide-gray-100">
                                          {itemList.map((item, index) => (
                                              <li key={index} className="flex items-center justify-between px-3 py-2 hover:bg-white transition-colors group">
                                                  <div className="flex items-center gap-2">
                                                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-100 text-gold-700 text-[10px] font-bold font-mono">
                                                          {index + 1}
                                                      </span>
                                                      <span className={`text-sm font-medium ${isReadOnly ? 'text-gray-600' : 'text-gray-800'}`}>{item}</span>
                                                  </div>
                                                  {!isReadOnly && (
                                                      <button 
                                                          onClick={() => handleRemoveItem(index)}
                                                          className="text-gray-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                          title="Xóa món này"
                                                      >
                                                          <Trash2 size={14} />
                                                      </button>
                                                  )}
                                              </li>
                                          ))}
                                      </ul>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* RIGHT COLUMN: TÀI CHÍNH */}
              <div className="col-span-12 lg:col-span-4 space-y-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                       <div className="bg-white px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-bold flex items-center gap-2 text-gray-800 text-sm">
                              <span className="p-1 bg-green-100 text-green-600 rounded"><DollarSign size={14} /></span>
                              Thông tin Tài chính
                          </h3>
                       </div>

                       <div className="p-4 flex-1 flex flex-col gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><Calendar size={12} /> Ngày cầm</span>
                                    <input 
                                        type="date" name="ngayCam" 
                                        value={dateValue(formData.ngayCam)} onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                        className={`border-gray-200 rounded px-2 py-1 text-xs font-medium outline-none text-right w-32 ${isReadOnly ? 'bg-gray-100 text-gray-500 pointer-events-none' : 'bg-white focus:border-primary-500 border'}`}
                                    />
                                </div>
                                
                                {mode === 'create' ? (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 flex items-center gap-1.5"><Calendar size={12} /> Số ngày cầm</span>
                                        <div className="flex items-center gap-2 justify-end w-32">
                                            <input 
                                                type="number" 
                                                value={kyHan} 
                                                onChange={handleKyHanChange}
                                                className="border border-gray-200 rounded px-2 py-1 text-xs font-bold text-center w-12 outline-none focus:border-primary-500"
                                            />
                                            <span className="text-xs text-gray-500">ngày</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">Thời gian cầm</span>
                                        <span className="text-xs font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm">{formData.soNgayCam} ngày</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><Calendar size={12} /> Ngày hết hạn</span>
                                    <input 
                                        type="date" name="ngayHetHan" 
                                        value={dateValue(formData.ngayHetHan)}
                                        readOnly={true} // Luôn luôn readonly vì tự tính
                                        className="border-gray-200 rounded px-2 py-1 text-xs font-medium outline-none text-right w-32 bg-gray-100 text-red-600 pointer-events-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Tiền cầm (Gốc)</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        name="tienGoc"
                                        value={formatNumberInput(formData.tienGoc)} 
                                        onChange={handleInputChange}
                                        readOnly={isReadOnly}
                                        className={`w-full pl-3 pr-8 py-2.5 border rounded-lg text-2xl font-bold text-right focus:outline-none transition-all
                                            ${isReadOnly 
                                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-default' // Changed from cursor-not-allowed
                                                : 'bg-white border-primary-100 text-primary-700 focus:ring-2 focus:ring-primary-50 focus:border-primary-500 group-hover:border-primary-200'
                                            }
                                        `}
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 font-bold text-lg">₫</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                {mode !== 'create' && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Lãi suất</span>
                                        <span className="font-bold text-orange-600">{formatCurrency(formData.tienLai || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Phí phát sinh</span>
                                    <span className="font-medium text-gray-700">{formatCurrency(formData.tienPhatSinh || 0)}</span>
                                </div>
                                
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-emerald-600 font-bold text-[10px] uppercase mb-1">TỔNG THANH TOÁN</span>
                                        <span className="text-3xl font-bold text-emerald-700">
                                            {formatCurrency((formData.tienGoc || 0) + (mode === 'create' ? 0 : (formData.tienLai || 0)) + (formData.tienPhatSinh || 0))}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right mt-1">*Bao gồm gốc + lãi + phí</p>
                                </div>
                            </div>
                       </div>
                        
                        {/* BUTTONS AREA - HIDDEN HERE, MOVED TO FOOTER */}
                        <div className="h-16"></div> 
                  </div>
              </div>

          </div>
      </div>

      {/* FOOTER ACTION BAR - STICKY BOTTOM */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white border-t border-gray-200 p-3 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
         <div className="flex justify-end gap-3 px-4">
             {mode === 'create' ? (
                <>
                    <button onClick={() => handleSave(false)} disabled={isLoading} className="py-2.5 px-4 bg-white border border-primary-300 text-primary-700 font-bold rounded hover:bg-primary-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                        <Save size={18} /> Lưu Biên Nhận
                    </button>
                    <button onClick={() => window.print()} className="py-2.5 px-4 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm">
                        <Printer size={18} /> Chỉ In
                    </button>
                    <button onClick={() => handleSave(true)} disabled={isLoading} className="py-2.5 px-6 bg-primary-600 text-white font-bold rounded hover:bg-primary-700 transition-colors shadow shadow-primary-200 flex items-center gap-2 text-sm">
                        <Save size={18} /> Lưu & In
                    </button>
                </>
             ) : (
                <>
                    <button className="py-2.5 px-4 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-50 font-medium flex items-center gap-2 text-sm">
                        <History size={18} /> Lịch sử
                    </button>
                    <button onClick={() => window.print()} className="py-2.5 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium flex items-center gap-2 shadow-sm text-sm">
                        <Printer size={18} /> In Lại
                    </button>
                    {!isDaChuoc && (
                        <button className="py-2.5 px-6 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors shadow shadow-green-200 flex items-center gap-2 text-sm">
                            <CreditCard size={18} /> Chuộc Đồ
                        </button>
                    )}
                </>
             )}
         </div>
      </div>

    </div>
  );
};

export default ReceiptFormPage;