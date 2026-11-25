'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Shield, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  bellCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ bellCount = 0 }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Đoàn Viên Portal
          </span>
        </Link>
        <span className="hidden md:inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {isAdmin ? 'Quản trị viên' : 'Đoàn viên'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Nút xem Trang Chủ Công Khai */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          title="Xem trang chủ công khai"
        >
          <Globe className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Xem Trang Chủ</span>
        </Link>

        {/* Chuông thông báo Realtime */}
        <Link
          href="/chat"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title="Tin nhắn & Thông báo"
        >
          <Bell className="h-5 w-5" />
          {bellCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {bellCount > 99 ? '99+' : bellCount}
            </span>
          )}
        </Link>

        {/* Thông tin tài khoản */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.hoTen || user?.mssv || 'Người dùng'}
            </span>
            <span className="text-xs text-slate-500">
              {isAdmin ? 'Quyền: Hệ thống' : `MSSV: ${user?.mssv || 'N/A'}`}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl.startsWith('http') ? user.avatarUrl : user.avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : isAdmin ? (
              <Shield className="h-5 w-5 text-blue-600" />
            ) : (
              <UserIcon className="h-5 w-5 text-slate-500" />
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Thoát</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
