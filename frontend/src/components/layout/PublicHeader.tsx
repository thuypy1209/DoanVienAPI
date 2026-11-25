'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, LogIn, UserPlus, Shield, ArrowRight } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
              ĐOÀN THANH NIÊN
            </span>
            <span className="block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Cổng Đăng Ký Hoạt Động & Rèn Luyện
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link href="/" className="text-blue-600 hover:text-blue-700 transition">
            Trang Chủ
          </Link>
          <a href="#hoat-dong" className="hover:text-blue-600 transition">
            Hoạt Động Mới
          </a>
          <a href="#ve-chung-toi" className="hover:text-blue-600 transition">
            Quy Định Điểm Rèn Luyện
          </a>
        </nav>

        {/* Auth action buttons */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                Chào, {user?.hoTen || user?.mssv}
              </span>
              <button
                onClick={() => router.push(isAdmin ? '/admin' : '/portal')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>{isAdmin ? 'Vào Trang Quản Trị' : 'Cổng Sinh Viên'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={logout}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition hidden sm:inline-block cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-500" />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Đăng Ký Đoàn Viên</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
