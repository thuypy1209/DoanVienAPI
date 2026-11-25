'use client';

import React from 'react';
import { Sparkles, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-black text-slate-900 tracking-tight text-base">
                ĐOÀN THANH NIÊN - HỘI SINH VIÊN
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Hệ thống quản lý hoạt động phong trào, điểm danh quét mã QR thời gian thực và tự động cập nhật
              điểm rèn luyện cho toàn thể đoàn viên, thanh niên.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              Đồng bộ dữ liệu đa nền tảng: Web Quản trị • Ứng dụng Android • Backend API
            </div>
          </div>

          {/* Quy định */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Thông Tin Rèn Luyện
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>Hoạt động Tình nguyện</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>Hội thảo & Kỹ năng mềm</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>Giải thể thao truyền thống</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>Điểm danh bằng QR Code</span>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Văn Phòng Đoàn
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Văn phòng Đoàn Thanh niên - Tầng 1</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>doanthanhnien@university.edu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Hotline: (028) 3899 9999</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>&copy; {new Date().getFullYear()} Đoàn Thanh Niên. Tất cả các quyền được bảo lưu.</div>
          <div className="flex items-center gap-4">
            <span>Bảo mật dữ liệu</span>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
