'use client';

import React, { useEffect, useState } from 'react';
import { soDoanApi } from '../../api/soDoanApi';
import type { StudentSoDoanResponse } from '../../types';
import {
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Sun,
  FileText,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Info,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export const StudentSoDoan: React.FC = () => {
  const [data, setData] = useState<StudentSoDoanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySoDoan = async () => {
      try {
        setLoading(true);
        const res = await soDoanApi.getMe();
        setData(res);
      } catch (err) {
        console.error('Lỗi tải dữ liệu sổ đoàn cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySoDoan();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-3" />
        <p className="font-medium text-slate-600">Đang tải thông tin hồ sơ sổ đoàn...</p>
      </div>
    );
  }

  const { sinhVien, soDoan, daNopSo } = data || {
    sinhVien: { mssv: '', hoTen: '' },
    soDoan: null,
    daNopSo: false,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-500/20">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sổ Đoàn & Hồ Sơ Đoàn Viên</h1>
            <p className="text-sm text-slate-500">
              Tra cứu vị trí lưu trữ hồ sơ sổ đoàn tại trường và tình trạng Giấy giới thiệu sinh hoạt hè
            </p>
          </div>
        </div>

        <Link
          href="/portal/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition self-start md:self-auto"
        >
          <BookOpen className="w-4 h-4 text-purple-600" />
          Xem Thẻ Đoàn Điện Tử
        </Link>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tình trạng tiếp nhận */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái hồ sơ</span>
          <div className="mt-2 flex items-center gap-2">
            {daNopSo ? (
              <>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-emerald-700">Đang lưu giữ tại trường</div>
                  <div className="text-xs text-slate-500">
                    Nộp ngày: {soDoan?.ngayNop ? new Date(soDoan.ngayNop).toLocaleDateString('vi-VN') : 'Đã nộp'}
                  </div>
                </div>
              </>
            ) : soDoan?.trangThaiSoDoan === 'DaRut' ? (
              <>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Đã rút sổ đoàn</div>
                  <div className="text-xs text-slate-500">Đã chuyển sinh hoạt Đoàn</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-rose-700">Chưa nộp sổ đoàn</div>
                  <div className="text-xs text-slate-500">Cần nộp về Văn phòng Đoàn</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vị trí ngăn tủ */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vị trí lưu trữ</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {soDoan?.viTriLuuTru || 'Chưa phân bổ ngăn tủ'}
              </div>
              <div className="text-xs text-slate-500">Văn phòng Đoàn trường</div>
            </div>
          </div>
        </div>

        {/* Giấy giới thiệu hè */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giấy giới thiệu hè</span>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                soDoan?.giayGioiThieuHe ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div
                className={`text-base font-bold ${
                  soDoan?.giayGioiThieuHe ? 'text-amber-800' : 'text-slate-600'
                }`}
              >
                {soDoan?.giayGioiThieuHe ? 'Đã được cấp' : 'Chưa được cấp'}
              </div>
              <div className="text-xs text-slate-500">Sinh hoạt tại nơi cư trú</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hồ sơ Sổ đoàn chi tiết */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Chi Tiết Hồ Sơ Đoàn Viên Bản Giấy</h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {sinhVien.soDoanVien || 'DV-CHUA-CAP'}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Họ và tên đoàn viên:</span>
              <span className="font-bold text-slate-900">{sinhVien.hoTen}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mã số sinh viên:</span>
              <span className="font-mono text-slate-800">{sinhVien.mssv}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Chi đoàn / Lớp:</span>
              <span className="font-medium text-slate-800">{sinhVien.lop || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Khoa / Viện:</span>
              <span className="font-medium text-slate-800">{sinhVien.khoa || '-'}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Chức vụ Đoàn:</span>
              <span className="font-semibold text-blue-700">
                {sinhVien.chucVuDoan === 'BiThu'
                  ? 'Bí thư Chi đoàn'
                  : sinhVien.chucVuDoan === 'PhoBiThu'
                  ? 'Phó Bí thư'
                  : 'Đoàn viên'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Ngày kết nạp Đoàn:</span>
              <span className="font-medium text-slate-800">
                {sinhVien.ngayVaoDoan ? new Date(sinhVien.ngayVaoDoan).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Nơi kết nạp Đoàn:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]" title={sinhVien.noiVaoDoan}>
                {sinhVien.noiVaoDoan || 'Đoàn trường THPT'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Địa điểm lưu hồ sơ:</span>
              <span className="font-semibold text-purple-700">{soDoan?.viTriLuuTru || 'Kho Lưu Trữ Đoàn'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quy trình nghiệp vụ Đoàn info box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hướng dẫn rút sổ đoàn */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ArrowRight className="w-4 h-4 text-purple-600" />
            Thủ tục Rút Sổ Đoàn (Khi tốt nghiệp / Chuyển trường)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            1. Hoàn tất nghĩa vụ đóng đoàn phí các năm học.<br />
            2. Xuất trình Thẻ sinh viên tại Văn phòng Đoàn trường.<br />
            3. Nhận lại Sổ đoàn và Giấy giới thiệu sinh hoạt về địa phương hoặc cơ quan mới.
          </p>
        </div>

        {/* Hướng dẫn giấy hè */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sun className="w-4 h-4 text-amber-600" />
            Sinh hoạt Đoàn hè tại nơi cư trú
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mỗi mùa hè, đoàn viên nhận Giấy giới thiệu hè về nộp cho Đoàn Phường/Xã nơi tạm trú hoặc thường trú. Khi kết thúc hè, xin nhận xét đánh giá nộp lại cho Bí thư Chi đoàn lớp để cộng điểm rèn luyện.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSoDoan;
