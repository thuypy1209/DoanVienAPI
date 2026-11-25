'use client';

import React, { useEffect, useState } from 'react';
import { hoatDongApi } from '../../api/hoatDongApi';
import type { HoatDong } from '../../types';
import { CalendarDays, Users, Award, PlusCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hoatDongApi
      .getAll()
      .then((data) => setHoatDongs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalActivities = hoatDongs.length;
  const activeActivities = hoatDongs.filter(
    (h) => new Date(h.thoiGianKetThuc) >= new Date()
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            Bảng điều khiển trung tâm
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Quản Trị Hệ Thống Đoàn Viên
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Theo dõi tình hình hoạt động phong trào, duyệt danh sách tham gia, quản lý sinh viên và tương tác thời gian thực.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/hoat-dong"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-md hover:bg-blue-50 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Thêm hoạt động</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng số hoạt động
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{totalActivities}</div>
          <p className="mt-1 text-xs text-slate-500">Đã đăng ký trong hệ thống</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hoạt động đang mở
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600">{activeActivities}</div>
          <p className="mt-1 text-xs text-slate-500">Chưa đến hạn kết thúc</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đoàn viên trực tuyến
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">SignalR</div>
          <p className="mt-1 text-xs text-slate-500">Sẵn sàng kết nối kênh Chat</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cơ chế cấp điểm
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600">QR Check-in</div>
          <p className="mt-1 text-xs text-slate-500">Tự động cộng điểm rèn luyện</p>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hoạt động Đoàn mới nhất</h2>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách phong trào gần đây của đơn vị</p>
          </div>
          <Link
            href="/admin/hoat-dong"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>Xem tất cả</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Đang tải dữ liệu hoạt động...</div>
        ) : hoatDongs.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Chưa có hoạt động nào được tạo. Hãy nhấn "Thêm hoạt động" để tạo mới!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Tên hoạt động</th>
                  <th className="py-3 px-4">Địa điểm</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Điểm cộng</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hoatDongs.slice(0, 6).map((hd) => (
                  <tr key={hd.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{hd.tenHoatDong}</td>
                    <td className="py-3.5 px-4">{hd.diaDiem || 'Chưa có'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(hd.thoiGianBatDau).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                        +{hd.diemCong} ĐRL
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/hoat-dong`}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                      >
                        Quản lý
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
