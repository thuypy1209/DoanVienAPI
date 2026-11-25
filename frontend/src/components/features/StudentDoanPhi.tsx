'use client';

import React, { useEffect, useState } from 'react';
import { doanPhiApi } from '../../api/doanPhiApi';
import type { StudentDoanPhiResponse } from '../../types';
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  CreditCard,
  QrCode,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export const StudentDoanPhi: React.FC = () => {
  const [data, setData] = useState<StudentDoanPhiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const fetchMyFees = async () => {
      try {
        setLoading(true);
        const res = await doanPhiApi.getMe();
        setData(res);
      } catch (err) {
        console.error('Lỗi tải dữ liệu đoàn phí cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyFees();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3" />
        <p className="font-medium text-slate-600">Đang tải thông tin nghĩa vụ đoàn phí...</p>
      </div>
    );
  }

  const { sinhVien, summary, records } = data || {
    sinhVien: { mssv: '', hoTen: '' },
    summary: { tongDaNop: 0, tongChuaNop: 0, soKyDaNop: 0, soKyChuaNop: 0, daHoanTatTatCa: false },
    records: [],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đoàn Phí Của Tôi</h1>
              <p className="text-sm text-slate-500">
                Theo dõi tình trạng thu nộp đoàn phí qua các học kỳ theo Điều lệ Đoàn TNCS Hồ Chí Minh
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <QrCode className="w-4 h-4" />
          Hướng dẫn nộp đoàn phí
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tình trạng chung */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tình trạng nghĩa vụ</span>
          <div className="mt-2 flex items-center gap-2">
            {summary.daHoanTatTatCa ? (
              <>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-emerald-700">Đã hoàn thành</div>
                  <div className="text-xs text-slate-500">Không nợ đoàn phí</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-amber-700">Còn {summary.soKyChuaNop} kỳ chưa nộp</div>
                  <div className="text-xs text-slate-500">Vui lòng hoàn tất nộp tiền</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tổng đã nộp */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng tiền đã đóng</span>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">
              {summary.tongDaNop.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">
              Đã nộp {summary.soKyDaNop} học kỳ
            </div>
          </div>
        </div>

        {/* Cần nộp thêm */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Số tiền còn nợ</span>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${summary.tongChuaNop > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {summary.tongChuaNop.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {summary.tongChuaNop > 0 ? 'Cần nộp trước đợt bình bầu' : 'Đã đủ điều kiện xếp loại'}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách học kỳ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Lịch Sử & Chi Tiết Các Kỳ Thu Đoàn Phí</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">{records.length} đợt thu</span>
        </div>

        <div className="divide-y divide-slate-100">
          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Chưa có thông tin đợt thu đoàn phí nào</p>
              <p className="text-xs text-slate-400 mt-1">Ban Chấp Hành Đoàn Trường chưa phát sinh đợt thu cho bạn</p>
            </div>
          ) : (
            records.map((r) => {
              const isDaNop = r.trangThai === 'DaNop';

              return (
                <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isDaNop ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                      }`}
                    >
                      {isDaNop ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.hocKy}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Năm học {r.namHoc}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          Mức đoàn phí: <strong className="text-slate-800">{r.soTien.toLocaleString('vi-VN')} đ</strong>
                        </span>
                        {isDaNop && r.ngayNop && (
                          <span>
                            Ngày nộp: <strong className="text-slate-800">{new Date(r.ngayNop).toLocaleDateString('vi-VN')}</strong>
                          </span>
                        )}
                        {isDaNop && r.nguoiThu && (
                          <span>
                            Người thu: <strong className="text-slate-800">{r.nguoiThu}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {isDaNop ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã nộp thành công
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          Chưa nộp
                        </span>
                        <button
                          onClick={() => setShowQrModal(true)}
                          className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                        >
                          Nộp ngay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Điều lệ Đoàn info box */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900/90 leading-relaxed space-y-1">
          <p className="font-bold text-blue-950">
            Quy định về đóng đoàn phí theo Điều lệ Đoàn TNCS Hồ Chí Minh:
          </p>
          <p>
            - Đóng đoàn phí là nghĩa vụ thiêng liêng và thường niên của mỗi đoàn viên nhằm xây dựng quỹ hoạt động, phục vụ các phong trào xung kích, tình nguyện của Đoàn trường.
          </p>
          <p>
            - Mức thu đoàn phí đối với sinh viên chính quy hiện nay là <strong>2.000đ - 4.000đ/tháng (24.000đ/học kỳ)</strong>.
          </p>
          <p>
            - Đoàn viên không đóng đoàn phí liên tục 3 tháng trở lên mà không có lý do chính đáng sẽ không đủ điều kiện xét danh hiệu <strong>Đoàn viên Xuất sắc</strong> và <strong>Đoàn viên Ưu tú</strong>.
          </p>
        </div>
      </div>

      {/* Modal Hướng dẫn nộp đoàn phí */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Hướng Dẫn Đóng Đoàn Phí
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-semibold text-slate-900">Cách 1: Nộp trực tiếp cho Chi đoàn</p>
                <p className="text-xs text-slate-600">
                  Bạn có thể đóng tiền mặt trực tiếp cho <strong>Bí thư Chi đoàn</strong> hoặc <strong>Cán bộ phụ trách thu</strong> trong các buổi sinh hoạt chi đoàn định kỳ.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-semibold text-slate-900">Cách 2: Chuyển khoản qua Ngân hàng số</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>• Ngân hàng: <strong>Vietcombank / TPBank</strong></p>
                  <p>• Số tài khoản: <strong>Đoàn Thanh Niên HUTECH (Liên hệ Bí thư lớp)</strong></p>
                  <p>• Số tiền: <strong>24.000 đ / kỳ</strong></p>
                  <p>• Nội dung chuyển khoản: <span className="font-mono font-semibold text-blue-700">DP [MSSV] [HoTen] [HocKy]</span></p>
                  <p className="italic text-slate-400 text-[11px] pt-1">
                    * Sau khi chuyển khoản, Bí thư Chi đoàn sẽ cập nhật xác nhận nộp thành công lên hệ thống trong vòng 24h.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDoanPhi;
