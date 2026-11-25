'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  Award,
  UserCheck,
  CheckCircle2,
  Wallet,
  FolderArchive,
  Star,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const pathname = usePathname();

  const adminLinks = [
    { to: '/admin', label: 'Dashboard Thống kê', icon: LayoutDashboard },
    { to: '/admin/hoat-dong', label: 'Quản lý Hoạt động', icon: CalendarDays },
    { to: '/admin/sinh-vien', label: 'Quản lý Đoàn viên', icon: Users },
    { to: '/admin/doan-phi', label: 'Quản lý Đoàn phí', icon: Wallet },
    { to: '/admin/so-doan', label: 'Quản lý Sổ đoàn', icon: FolderArchive },
    { to: '/admin/xep-loai', label: 'Bình bầu & Phân loại', icon: Star },
    { to: '/admin/chung-nhan', label: 'Chứng nhận điện tử', icon: Award },
    { to: '/chat', label: 'Hỗ trợ Realtime', icon: MessageSquare },
  ];

  const studentLinks = [
    { to: '/portal', label: 'Trang chủ Hoạt động', icon: CalendarDays },
    { to: '/portal/lich-su', label: 'Lịch sử & Điểm danh', icon: CheckCircle2 },
    { to: '/portal/doan-phi', label: 'Đoàn phí của tôi', icon: Wallet },
    { to: '/portal/so-doan', label: 'Sổ đoàn của tôi', icon: FolderArchive },
    { to: '/portal/xep-loai', label: 'Xếp loại thi đua', icon: Star },
    { to: '/portal/chung-nhan', label: 'Chứng nhận của tôi', icon: Award },
    { to: '/portal/profile', label: 'Hồ sơ cá nhân', icon: UserCheck },
    { to: '/chat', label: 'Kênh Trò chuyện', icon: MessageSquare },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isAdmin ? 'Quản Trị Hệ Thống' : 'Cổng Đoàn Viên'}
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Thẻ điểm rèn luyện nhanh cho sinh viên */}
        {!isAdmin && (
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1">
              <Award className="h-4 w-4" />
              <span>Điểm rèn luyện</span>
            </div>
            <div className="text-2xl font-black text-blue-900">
              {user?.diemRenLuyenTichLuy ?? 0}
              <span className="text-xs font-normal text-slate-500 ml-1">điểm</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Lớp: <span className="font-medium text-slate-700">{user?.lop || 'Chưa cập nhật'}</span>
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Đoàn Thanh Niên &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
};

export default Sidebar;
