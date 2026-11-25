'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Search, Award, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifyGeneralPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      router.push(`/verify/${encodeURIComponent(inputCode.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Cổng Đoàn Viên HUTECH</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-5">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tra Cứu Chứng Nhận Điện Tử
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Xác thực tính hợp lệ của Giấy chứng nhận tham gia hoạt động & phong trào Đoàn TNCS Hồ Chí Minh
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-3 pt-2">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhập mã chứng nhận
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CN-2026-HD1-XXXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Tra cứu xác thực
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Hệ thống cơ sở dữ liệu chính thức</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-8 text-xs text-slate-400">
        Đoàn Trường Đại học Công nghệ TP.HCM - HUTECH &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
