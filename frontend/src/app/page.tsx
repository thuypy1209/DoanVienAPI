'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hoatDongApi } from '../api/hoatDongApi';
import { useAuth } from '../context/AuthContext';
import type { HoatDong } from '../types';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  Search,
  Sparkles,
  QrCode,
  CheckCircle2,
  X,
  ArrowRight,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export default function HomePage() {
  const [hoatDongs, setHoatDongs] = useState<HoatDong[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<HoatDong | null>(null);

  // Registration state
  const { isAuthenticated } = useAuth();
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [myRegisteredIds, setMyRegisteredIds] = useState<number[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const list = await hoatDongApi.getAll();
        setHoatDongs(list);

        if (isAuthenticated) {
          try {
            const history = await hoatDongApi.getLichSu();
            setMyRegisteredIds(history.map((h) => h.hoatDongId));
          } catch {
            // Not a student or error
          }
        }
      } catch (err) {
        console.error('Lỗi tải hoạt động:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleRegisterActivity = async (hd: HoatDong) => {
    if (!isAuthenticated) {
      setFeedbackMsg({
        type: 'error',
        text: 'Vui lòng đăng nhập bằng tài khoản đoàn viên để đăng ký tham gia hoạt động này!',
      });
      setTimeout(() => {
        router.push('/login');
      }, 1800);
      return;
    }

    try {
      setRegisteringId(hd.id);
      setFeedbackMsg(null);
      await hoatDongApi.dangKy(hd.id);
      setMyRegisteredIds((prev) => [...prev, hd.id]);
      setFeedbackMsg({
        type: 'success',
        text: `Đăng ký thành công hoạt động "${hd.tenHoatDong}"! Điểm rèn luyện sẽ được cộng khi bạn điểm danh.`,
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || err.response?.data || 'Đăng ký không thành công.',
      });
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredHoatDongs = hoatDongs.filter((hd) => {
    const matchSearch =
      hd.tenHoatDong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hd.diaDiem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hd.moTa?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicHeader />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-md border border-white/20 text-blue-200">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Năm Học Thanh Niên Tình Nguyện & Sáng Tạo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Cổng Đăng Ký Hoạt Động &<br />
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Quản Lý Rèn Luyện Đoàn Viên
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Khám phá các phong trào tình nguyện, hội thảo kỹ năng và hoạt động giao lưu.
            Đăng ký tham gia dễ dàng, quét mã QR điểm danh và tự động tích lũy điểm rèn luyện vào hồ sơ.
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#hoat-dong"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
            >
              <span>Xem các hoạt động đang mở</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            {!isAuthenticated && (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 backdrop-blur-sm transition"
              >
                <UserCheck className="h-4 w-4 text-sky-400" />
                <span>Đăng ký tài khoản đoàn viên</span>
              </Link>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <Award className="h-5 w-5 text-amber-400 mb-1" />
              <div className="text-xl font-bold text-white">Điểm Rèn Luyện</div>
              <p className="text-xs text-slate-300">Cộng điểm tức thì sau khi điểm danh</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <QrCode className="h-5 w-5 text-sky-400 mb-1" />
              <div className="text-xl font-bold text-white">QR Code</div>
              <p className="text-xs text-slate-300">Điểm danh thông minh qua App Android</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-emerald-400 mb-1" />
              <div className="text-xl font-bold text-white">{hoatDongs.length}+ Phong trào</div>
              <p className="text-xs text-slate-300">Được tổ chức trong năm học</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-purple-400 mb-1" />
              <div className="text-xl font-bold text-white">Realtime Chat</div>
              <p className="text-xs text-slate-300">Trao đổi trực tuyến với ban tổ chức</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="hoat-dong" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold shadow-sm ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Section Title & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Danh Sách Phong Trào
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Hoạt Động Đang Mở Đăng Ký
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lựa chọn hoạt động phù hợp và nhấn "Đăng ký tham gia" để ghi nhận danh sách
            </p>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 shadow-xs w-full md:w-80">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoạt động, địa điểm..."
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-500">Đang tải danh sách hoạt động từ máy chủ...</p>
          </div>
        ) : filteredHoatDongs.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy hoạt động nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc quay lại sau khi ban tổ chức đăng thêm hoạt động mới.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHoatDongs.map((hd) => {
              const isRegistered = myRegisteredIds.includes(hd.id);
              const isPast = new Date(hd.thoiGianKetThuc) < new Date();

              return (
                <div
                  key={hd.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {hd.imageUrl ? (
                      <img
                        src={hd.imageUrl.startsWith('http') ? hd.imageUrl : hd.imageUrl}
                        alt={hd.tenHoatDong}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                        <Calendar className="h-12 w-12 opacity-50" />
                      </div>
                    )}

                    {/* Point badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow-md">
                        <Award className="h-3.5 w-3.5" />
                        +{hd.diemCong} ĐRL
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                        {hd.tenHoatDong}
                      </h3>
                      {hd.moTa && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {hd.moTa}
                        </p>
                      )}

                      <div className="mt-4 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{hd.diaDiem || 'Địa điểm thông báo sau'}</span>
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
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedActivity(hd)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        Chi tiết
                      </button>

                      {isRegistered ? (
                        <div className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Đã đăng ký</span>
                        </div>
                      ) : isPast ? (
                        <button
                          disabled
                          className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
                        >
                          Đã hết hạn
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterActivity(hd)}
                          disabled={registeringId === hd.id}
                          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                        >
                          {registeringId === hd.id ? 'Đang gửi...' : 'Đăng Ký'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section: 3 Bước Tham Gia Hoạt Động */}
        <section id="ve-chung-toi" className="pt-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Quy Trình Hoạt Động
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                3 Bước Nhận Điểm Rèn Luyện Đoàn Viên
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Quy trình đăng ký và xác nhận điểm danh minh bạch, tự động hóa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-black text-lg mb-4">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-800">Đăng Ký Tài Khoản & Hoạt Động</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Đoàn viên tạo tài khoản bằng MSSV. Duyệt danh sách phong trào trên cổng và bấm "Đăng ký tham gia".
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-lg mb-4">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-800">Điểm Danh Bằng Mã QR</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tại buổi hoạt động, dùng ứng dụng Android hoặc nhập mã ID hoạt động trên cổng Web để hoàn tất check-in.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-black text-lg mb-4">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-800">Tự Động Cộng Điểm Tích Lũy</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Ngay sau khi điểm danh, hệ thống tự động cộng điểm rèn luyện vào hồ sơ cá nhân và xuất báo cáo cho nhà trường.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Chi Tiết Hoạt Động */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950">
                <Award className="h-3.5 w-3.5" />
                +{selectedActivity.diemCong} Điểm Rèn Luyện
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Mã số: #{selectedActivity.id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedActivity.tenHoatDong}
            </h2>

            <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">
                  Địa điểm: {selectedActivity.diaDiem || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Bắt đầu: {new Date(selectedActivity.thoiGianBatDau).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Kết thúc: {new Date(selectedActivity.thoiGianKetThuc).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {selectedActivity.moTa && (
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Kế hoạch & Nội dung chi tiết
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedActivity.moTa}
                </p>
              </div>
            )}

            {/* QR Check-in preview */}
            <div className="mt-6 p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Mã QR Điểm Danh</h4>
                <p className="text-[11px] text-slate-500">Mã điểm danh sự kiện này</p>
              </div>
              <img
                src={hoatDongApi.getQrCodeUrl(selectedActivity.id)}
                alt="QR Code"
                className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-1"
              />
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setSelectedActivity(null)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  handleRegisterActivity(selectedActivity);
                  setSelectedActivity(null);
                }}
                disabled={myRegisteredIds.includes(selectedActivity.id)}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:bg-emerald-600 cursor-pointer"
              >
                {myRegisteredIds.includes(selectedActivity.id)
                  ? 'Đã Đăng Ký'
                  : 'Đăng Ký Tham Gia'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
