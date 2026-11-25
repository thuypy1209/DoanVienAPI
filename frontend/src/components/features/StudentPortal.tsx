'use client';

import React, { useEffect, useState } from 'react';
import { hoatDongApi } from '../../api/hoatDongApi';
import type { HoatDong } from '../../types';
import { Calendar, MapPin, Clock, Award, Check, Sparkles } from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [allList, historyList] = await Promise.all([
        hoatDongApi.getAll(),
        hoatDongApi.getLichSu().catch(() => []),
      ]);
      setHoatDongs(allList);
      setRegisteredIds(historyList.map((item) => item.hoatDongId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDangKy = async (hoatDongId: number) => {
    try {
      setRegisteringId(hoatDongId);
      await hoatDongApi.dangKy(hoatDongId);
      setRegisteredIds((prev) => [...prev, hoatDongId]);
      alert('Đăng ký tham gia hoạt động thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data || 'Đăng ký thất bại!');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 md:p-8 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Phong trào Đoàn Thanh Niên</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Hoạt Động Phong Trào Đoàn Viên
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Đăng ký tham gia các hoạt động tình nguyện, hội thảo và phong trào để tích lũy điểm rèn luyện.
          </p>
        </div>
      </div>

      {/* Activities Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Danh sách hoạt động mở đăng ký</h2>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Đang tải danh sách hoạt động...</div>
        ) : hoatDongs.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Hiện chưa có hoạt động nào được mở đăng ký.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hoatDongs.map((hd) => {
              const isRegistered = registeredIds.includes(hd.id);
              const isPast = new Date(hd.thoiGianKetThuc) < new Date();
              const isFull = hd.soLuongGioiHan ? (hd.soLuongDaDangKy || 0) >= hd.soLuongGioiHan : false;

              const getLoaiBadge = (loai?: string) => {
                switch (loai) {
                  case 'TinhNguyen':
                    return <span className="bg-emerald-600/90 text-white">🌱 Tình nguyện</span>;
                  case 'HocThuat':
                    return <span className="bg-blue-600/90 text-white">📚 Học thuật</span>;
                  case 'VanTheMy':
                    return <span className="bg-amber-600/90 text-white">⚽ Văn thể mỹ</span>;
                  case 'ChinhTriTuTuong':
                    return <span className="bg-red-600/90 text-white">⭐ Chính trị</span>;
                  default:
                    return <span className="bg-slate-700/90 text-white">🎯 Phong trào</span>;
                }
              };

              return (
                <div
                  key={hd.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Image banner or fallback */}
                  <div className="h-40 w-full bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                    {hd.imageUrl ? (
                      <img
                        src={hd.imageUrl.startsWith('http') ? hd.imageUrl : hd.imageUrl}
                        alt={hd.tenHoatDong}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-blue-400">
                        <Calendar className="h-12 w-12 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Phân loại hoạt động */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm">
                        {getLoaiBadge(hd.loaiHoatDong)}
                      </span>
                    </div>

                    {/* Điểm cộng */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm backdrop-blur-sm">
                        <Award className="h-3.5 w-3.5" />
                        +{hd.diemCong} Điểm
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {hd.tenHoatDong}
                      </h3>
                      {hd.moTa && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {hd.moTa}
                        </p>
                      )}

                      <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{hd.diaDiem || 'Chưa cập nhật địa điểm'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>
                            {new Date(hd.thoiGianBatDau).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        {/* Số lượng suất tham gia */}
                        {hd.soLuongGioiHan && hd.soLuongGioiHan > 0 && (
                          <div className="pt-1">
                            <div className="flex justify-between text-[11px] font-semibold mb-1">
                              <span className="text-slate-500">Tiến độ đăng ký:</span>
                              <span className={isFull ? 'text-rose-600 font-bold' : 'text-blue-600'}>
                                {hd.soLuongDaDangKy || 0} / {hd.soLuongGioiHan} suất
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(100, Math.round(((hd.soLuongDaDangKy || 0) / hd.soLuongGioiHan) * 100))}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer button */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {isRegistered ? (
                        <div className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700">
                          <Check className="h-4 w-4" />
                          <span>Đã đăng ký tham gia</span>
                        </div>
                      ) : isPast ? (
                        <button
                          disabled
                          className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                        >
                          Đã hết hạn đăng ký
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full rounded-xl bg-rose-50 border border-rose-200 py-2.5 text-xs font-bold text-rose-500 cursor-not-allowed"
                        >
                          Đã hết suất đăng ký
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDangKy(hd.id)}
                          disabled={registeringId === hd.id}
                          className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {registeringId === hd.id ? 'Đang gửi đăng ký...' : 'Đăng Ký Tham Gia'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
