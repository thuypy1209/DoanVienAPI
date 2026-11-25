'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { sinhVienApi } from '../../api/sinhVienApi';
import {
  User,
  Award,
  Mail,
  GraduationCap,
  Building2,
  Upload,
  CheckCircle2,
  Star,
  ShieldCheck,
  Calendar,
  CreditCard,
  QrCode,
  MapPin,
  Sparkles,
  Wallet,
  ArrowRight,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setSuccessMsg(null);
      await sinhVienApi.uploadAvatar(file);
      await refreshProfile();
      setSuccessMsg('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'BiThu':
        return 'Bí thư Chi đoàn';
      case 'PhoBiThu':
        return 'Phó Bí thư';
      case 'UyVienBCH':
        return 'Ủy viên Ban Chấp Hành';
      default:
        return 'Đoàn viên';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-red-600" />
          <span>Hồ Sơ & Thẻ Đoàn Viên Điện Tử</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Thông tin thẻ đoàn chính thức, chi đoàn sinh hoạt và điểm rèn luyện tích lũy
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* THẺ ĐOÀN VIÊN ĐIỆN TỬ (DIGITAL YOUTH UNION CARD) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white shadow-xl p-6 sm:p-8 border border-red-500/30">
        {/* Họa tiết trang trí nền */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
          <Star className="h-48 w-48 fill-white" />
        </div>

        {/* Card Header */}
        <div className="flex items-start justify-between border-b border-white/20 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
              <ShieldCheck className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-yellow-300">
                ĐOÀN TNCS HỒ CHÍ MINH
              </p>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                THẺ ĐOÀN VIÊN ĐIỆN TỬ
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-md border border-white/30 text-white shadow-sm">
              <Sparkles className="h-3 w-3 text-yellow-300" />
              <span>Chính thức</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-6 items-center relative z-10">
          {/* Avatar Section */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-start">
            <div className="relative group">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-2 border-white/40 overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                {user?.avatarUrl ? (
                  <img
                    src={
                      user.avatarUrl.startsWith('http')
                        ? user.avatarUrl
                        : `http://localhost:5000${user.avatarUrl}`
                    }
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white/50" />
                )}
              </div>

              <label
                className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-white text-red-600 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition"
                title="Thay đổi ảnh chân dung thẻ đoàn"
              >
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[11px] text-white/70 mt-3 text-center sm:text-left">
              Số thẻ: <span className="font-mono font-bold text-yellow-300">{user?.soDoanVien || `DV-${user?.mssv}`}</span>
            </p>
          </div>

          {/* Member Info */}
          <div className="sm:col-span-8 space-y-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {user?.hoTen || 'Đoàn viên thanh niên'}
                </h3>
                {user?.laDoanVienUuTu && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-950 shadow-sm">
                    <Star className="h-3 w-3 fill-yellow-950" />
                    <span>Đoàn viên Ưu tú</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 font-mono mt-0.5">MSSV: {user?.mssv}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/15">
              <div>
                <span className="text-white/60 text-[11px] block">Chi đoàn / Lớp:</span>
                <span className="font-bold text-white text-sm">{user?.lop || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-white/60 text-[11px] block">Khoa / Viện:</span>
                <span className="font-bold text-white text-sm">{user?.khoa || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-white/60 text-[11px] block">Chức vụ Đoàn:</span>
                <span className="font-bold text-yellow-300 text-sm">
                  {getRoleTitle(user?.chucVuDoan)}
                </span>
              </div>
              <div>
                <span className="text-white/60 text-[11px] block">Ngày vào Đoàn:</span>
                <span className="font-bold text-white text-sm">
                  {user?.ngayVaoDoan ? new Date(user.ngayVaoDoan).toLocaleDateString('vi-VN') : '26/03/2021'}
                </span>
              </div>
            </div>

            {user?.noiVaoDoan && (
              <p className="text-[11px] text-white/70 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-3 w-3 text-yellow-300 shrink-0" />
                <span>Nơi kết nạp: {user.noiVaoDoan}</span>
              </p>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/80 gap-2 relative z-10">
          <span className="text-[11px]">Đoàn Trường Đại học Công nghệ TP.HCM - HUTECH</span>
          <span className="font-mono text-[11px] text-yellow-300">Xác thực số: {user?.mssv ? `HUTECH-VN-${user.mssv}` : 'VERIFIED'}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KHỐI CHI TIẾT THÔNG TIN HỌC TẬP & RÈN LUYỆN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Điểm rèn luyện & Xếp loại */}
        <Link
          href="/portal/xep-loai"
          className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xs flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0 group-hover:scale-105 transition">
            <Award className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Điểm RL & Xếp Loại</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {user?.diemRenLuyenTichLuy ?? 0}
              <span className="text-xs font-semibold text-emerald-600 ml-1.5">
                {(user?.diemRenLuyenTichLuy ?? 0) >= 90 ? 'Xuất sắc' : (user?.diemRenLuyenTichLuy ?? 0) >= 80 ? 'Tốt' : 'Khá'}
              </span>
            </div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">
              Xem kết quả bình bầu thi đua
            </div>
          </div>
        </Link>

        {/* Đoàn phí học kỳ */}
        <Link
          href="/portal/doan-phi"
          className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs flex items-center gap-4 hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Đoàn Phí</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              24.000 đ / kỳ
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Xem lịch sử đóng</span>
            </div>
          </div>
        </Link>

        {/* Email */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-400 uppercase">Hòm thư điện tử</span>
            <div className="text-sm font-bold text-slate-800 truncate mt-0.5">
              {user?.email || `${user?.mssv}@sinhvien.hutech.edu.vn`}
            </div>
          </div>
        </div>

        {/* Tình trạng hồ sơ Sổ Đoàn */}
        <Link
          href="/portal/so-doan"
          className="rounded-2xl border border-purple-100 bg-white p-5 shadow-xs flex items-center gap-4 hover:border-purple-300 hover:shadow-md transition group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0 group-hover:scale-105 transition">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Sổ Đoàn & Hồ sơ</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Đang lưu trữ tại trường</span>
            </div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">
              Xem vị trí tủ & giấy hè
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentProfile;
