'use client';

import React, { useEffect, useState } from 'react';
import { chungNhanApi } from '../../api/chungNhanApi';
import type { StudentChungNhanResponse, ChungNhan } from '../../types';
import {
  Award,
  Calendar,
  Sparkles,
  Printer,
  ExternalLink,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  FileCheck,
  Info,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

export const StudentChungNhan: React.FC = () => {
  const [data, setData] = useState<StudentChungNhanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<ChungNhan | null>(null);

  useEffect(() => {
    const fetchMyCerts = async () => {
      try {
        setLoading(true);
        const res = await chungNhanApi.getMe();
        setData(res);
      } catch (err) {
        console.error('Lỗi tải danh sách chứng nhận cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCerts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3" />
        <p className="font-medium text-slate-600">Đang tải thư viện chứng nhận điện tử...</p>
      </div>
    );
  }

  const { sinhVien, tongChungNhan, items } = data || {
    sinhVien: { mssv: '', hoTen: '' },
    tongChungNhan: 0,
    items: [],
  };

  const tongDiemCert = items.reduce((sum, item) => sum + (item.diemCong || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md shadow-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chứng Nhận Điện Tử Của Tôi</h1>
            <p className="text-sm text-slate-500">
              Thư viện lưu trữ các Giấy chứng nhận tham gia hoạt động, phong trào Đoàn và tra cứu mã xác thực
            </p>
          </div>
        </div>

        <Link
          href="/portal"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition self-start md:self-auto"
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          Đăng Ký Thêm Hoạt Động
        </Link>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giấy chứng nhận</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{tongChungNhan}</div>
              <div className="text-xs text-slate-500">Đã cấp chính thức</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Điểm rèn luyện từ hoạt động</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">+{tongDiemCert} đ</div>
              <div className="text-xs text-slate-500">Đã cộng vào hồ sơ rèn luyện</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giá trị pháp lý</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-purple-800">Xác thực mã QR</div>
              <div className="text-xs text-slate-500">Xét Sinh viên 5 Tốt & Học bổng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Danh Sách Giấy Chứng Nhận Đã Nhận</h2>
          <span className="text-xs font-medium text-slate-500">{items.length} chứng nhận</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-xs">
            <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Bạn chưa có Giấy chứng nhận nào</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Hãy tham gia các hoạt động tình nguyện, phong trào thanh niên và thực hiện Check-in để được cấp giấy chứng nhận điện tử.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      <QrCode className="w-3 h-3 text-blue-600" />
                      {cert.maChungNhan}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{cert.diemCong} điểm RL
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2" title={cert.tenHoatDong}>
                    {cert.tenHoatDong}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày cấp: {new Date(cert.ngayCap).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {cert.diaDiem && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{cert.diaDiem}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/verify/${cert.maChungNhan}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Tra cứu công khai</span>
                  </Link>

                  <button
                    onClick={() => setPreviewItem(cert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Xem & In</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Guide */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed space-y-1">
          <p className="font-bold text-blue-950">Quy định về Giấy chứng nhận điện tử:</p>
          <p>
            • Mỗi Giấy chứng nhận đều mang một <strong>Mã số duy nhất</strong> và mã QR xác thực. Bất kỳ cơ quan, nhà tuyển dụng hay hội đồng xét duyệt nào cũng có thể quét mã để kiểm tra tính hợp lệ trực tiếp trên hệ thống của Đoàn Trường.
          </p>
          <p>
            • Chứng nhận được tự động lưu vĩnh viễn trong hồ sơ đoàn viên của bạn, có thể in ra giấy hoặc xuất file PDF bất kỳ lúc nào để bổ sung hồ sơ xét học bổng và danh hiệu thi đua.
          </p>
        </div>
      </div>

      {/* Modal View & Print Certificate */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Actions */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-sm font-bold text-slate-700">Giấy Chứng Nhận Điện Tử Chính Thức</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In / Lưu PDF
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="p-8 md:p-12 bg-gradient-to-br from-amber-50/20 via-white to-blue-50/20 relative">
              <div className="border-4 border-double border-amber-500/80 p-8 rounded-2xl relative bg-white shadow-inner">
                {/* Decorative Corners */}
                <div className="absolute top-2 left-2 text-amber-500 font-serif text-xl select-none">❖</div>
                <div className="absolute top-2 right-2 text-amber-500 font-serif text-xl select-none">❖</div>
                <div className="absolute bottom-2 left-2 text-amber-500 font-serif text-xl select-none">❖</div>
                <div className="absolute bottom-2 right-2 text-amber-500 font-serif text-xl select-none">❖</div>

                <div className="text-center space-y-4">
                  {/* Header Quốc hiệu */}
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase font-extrabold tracking-widest text-slate-600">
                      Đoàn TNCS Hồ Chí Minh
                    </p>
                    <p className="text-xs uppercase font-bold tracking-wider text-blue-900">
                      Đoàn Trường Đại học Công nghệ TP.HCM - HUTECH
                    </p>
                    <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-1" />
                  </div>

                  {/* Title */}
                  <div className="pt-2">
                    <h2 className="text-2xl md:text-3xl font-black text-amber-700 tracking-tight uppercase font-serif">
                      Giấy Chứng Nhận
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
                      Certificate of Participation
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 italic">
                    Ban Chấp Hành Đoàn Trường Đại học Công nghệ TP.HCM Chứng Nhận:
                  </p>

                  {/* Sinh viên vinh danh */}
                  <div className="space-y-1 pt-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase">
                      {sinhVien.hoTen}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                      <span>MSSV: <strong className="font-mono text-slate-900">{sinhVien.mssv}</strong></span>
                      <span>Chi đoàn: <strong>{sinhVien.lop || '-'}</strong></span>
                      <span>Khoa: <strong>{sinhVien.khoa || '-'}</strong></span>
                    </div>
                  </div>

                  {/* Nội dung hoạt động */}
                  <div className="py-2 px-4 bg-slate-50 rounded-xl border border-slate-100 max-w-lg mx-auto text-xs text-slate-700 leading-relaxed">
                    Đã tích cực tham gia và hoàn thành xuất sắc hoạt động:
                    <div className="font-bold text-blue-950 text-sm mt-1">
                      "{previewItem.tenHoatDong}"
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Điểm rèn luyện tích lũy: <strong className="text-emerald-700">+{previewItem.diemCong} điểm</strong>
                    </div>
                  </div>

                  {/* Footer & Signature */}
                  <div className="pt-6 grid grid-cols-2 items-end text-xs">
                    {/* QR Code & Code */}
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 border border-slate-200 rounded-lg bg-white shadow-xs">
                          <QrCode className="w-10 h-10 text-slate-800" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Mã tra cứu điện tử:</p>
                          <p className="font-mono font-bold text-xs text-blue-800">{previewItem.maChungNhan}</p>
                          <p className="text-[9px] text-emerald-600 font-semibold">✓ Xác thực chính thức</p>
                        </div>
                      </div>
                    </div>

                    {/* Con dấu & Người ký */}
                    <div className="text-center space-y-1">
                      <p className="text-slate-500 italic">
                        TP. Hồ Chí Minh, ngày {new Date(previewItem.ngayCap).getDate()} tháng {new Date(previewItem.ngayCap).getMonth() + 1} năm {new Date(previewItem.ngayCap).getFullYear()}
                      </p>
                      <p className="font-bold text-slate-800 uppercase text-[11px]">
                        TM. Ban Thường Vụ Đoàn Trường
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        Bí Thư
                      </p>
                      {/* Giả lập con dấu đỏ */}
                      <div className="inline-block p-1 text-[10px] font-bold text-rose-700 border-2 border-rose-600 rounded-full px-3 py-1 rotate-[-4deg] opacity-90 mt-1 select-none">
                        ★ ĐOÀN TNCS HỒ CHÍ MINH HUTECH ★
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChungNhan;
