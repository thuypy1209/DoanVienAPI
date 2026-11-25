'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chungNhanApi } from '@/api/chungNhanApi';
import type { VerifyCertificateResponse } from '@/types';
import {
  ShieldCheck,
  AlertCircle,
  QrCode,
  Calendar,
  Building2,
  Award,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifyCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || '';

  const [result, setResult] = useState<VerifyCertificateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState(code);

  const fetchVerify = async (certCode: string) => {
    if (!certCode) return;
    try {
      setLoading(true);
      const res = await chungNhanApi.verify(certCode);
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        message: err.response?.data?.message || 'Giấy chứng nhận không tồn tại hoặc đã bị thu hồi.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      setInputCode(code);
      fetchVerify(code);
    }
  }, [code]);

  const handleSearchNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      router.push(`/verify/${encodeURIComponent(inputCode.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Cổng Đoàn Viên HUTECH</span>
        </Link>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSearchNew} className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập mã chứng nhận (VD: CN-2026-HD1-XXXX)..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Kiểm tra
            </button>
          </form>
        </div>

        {/* Result Card */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3" />
            <p className="font-medium text-slate-700">Đang tra cứu cơ sở dữ liệu Đoàn Trường...</p>
          </div>
        ) : result?.valid && result.data ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Success */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-white/20 backdrop-blur-sm text-white mb-1 shadow-inner">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Giấy Chứng Nhận Hợp Lệ
              </h1>
              <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                Chứng nhận điện tử chính thức được cấp và lưu trữ trong hệ thống Đoàn TNCS Hồ Chí Minh
              </p>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl text-center font-mono font-bold text-xs text-blue-900 border border-slate-100">
                MÃ TRA CỨU: {result.data.maChungNhan}
              </div>

              {/* Thông tin sinh viên */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đoàn viên được cấp</span>
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900 text-sm">{result.data.hoTen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã số sinh viên:</span>
                    <span className="font-mono text-slate-800">{result.data.mssv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chi đoàn / Lớp:</span>
                    <span className="font-medium text-slate-800">{result.data.lop || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khoa / Viện:</span>
                    <span className="font-medium text-slate-800">{result.data.khoa || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin hoạt động */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoạt động tham gia</span>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-blue-950 text-sm">{result.data.tenHoatDong}</div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Điểm rèn luyện tích lũy:</span>
                    <span className="font-bold text-emerald-700">+{result.data.diemCong} điểm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày cấp chứng nhận:</span>
                    <span className="font-medium text-slate-700">
                      {new Date(result.data.ngayCap).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Đơn vị cấp */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1 text-center">
                <p className="font-bold">{result.data.donViCap}</p>
                <p className="text-[11px] text-amber-800/80">Ký duyệt bởi: {result.data.nguoiKy}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 mb-1">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Chứng Nhận Không Hợp Lệ</h1>
            <p className="text-xs text-rose-600 max-w-sm mx-auto font-medium">
              {result?.message || 'Không tìm thấy thông tin chứng nhận tương ứng trên hệ thống.'}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Vui lòng kiểm tra lại chính xác ký tự trên mã chứng nhận hoặc liên hệ Văn phòng Đoàn trường để được hỗ trợ.
            </p>
          </div>
        )}
      </div>

      <div className="text-center pt-8 text-xs text-slate-400">
        Hệ thống Tra Cứu Chứng Nhận Điện Tử &copy; Đoàn TNCS Hồ Chí Minh HUTECH
      </div>
    </div>
  );
}
