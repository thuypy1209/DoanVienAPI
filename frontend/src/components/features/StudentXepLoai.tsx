'use client';

import React, { useEffect, useState } from 'react';
import { xepLoaiApi, type TuDanhGiaPayload } from '../../api/xepLoaiApi';
import type { StudentXepLoaiResponse, XepLoaiDoanVien } from '../../types';
import {
  Award,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Edit,
  Send,
  AlertCircle,
  BookOpen,
  Info,
} from 'lucide-react';

export const StudentXepLoai: React.FC = () => {
  const [data, setData] = useState<StudentXepLoaiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Tự Đánh Giá
  const [showForm, setShowForm] = useState(false);
  const [tuDanhGiaNamHoc, setTuDanhGiaNamHoc] = useState('2025-2026');
  const [tuDanhGiaXepLoai, setTuDanhGiaXepLoai] = useState('XuatSac');
  const [tuDanhGiaNoiDung, setTuDanhGiaNoiDung] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchMyRating = async () => {
    try {
      setLoading(true);
      const res = await xepLoaiApi.getMe();
      setData(res);

      if (res.currentRating) {
        setTuDanhGiaNamHoc(res.currentRating.namHoc);
        setTuDanhGiaXepLoai(res.currentRating.xepLoai);
        setTuDanhGiaNoiDung(res.currentRating.tuDanhGia || '');
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu phân loại cá nhân:', err);
      showAlert('error', 'Không thể kết nối máy chủ để tải thông tin xếp loại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRating();
  }, []);

  const handleSubmitSelfEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuDanhGiaNoiDung.trim()) {
      showAlert('error', 'Vui lòng nhập nội dung tự nhận xét ưu khuyết điểm.');
      return;
    }

    try {
      setSubmittingForm(true);
      const res = await xepLoaiApi.tuDanhGia({
        namHoc: tuDanhGiaNamHoc,
        xepLoai: tuDanhGiaXepLoai,
        tuDanhGia: tuDanhGiaNoiDung.trim(),
      });
      showAlert('success', res.message || 'Đã lưu bản tự đánh giá thành công.');
      setShowForm(false);
      await fetchMyRating();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Không thể lưu bản tự đánh giá.');
    } finally {
      setSubmittingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3" />
        <p className="font-medium text-slate-600">Đang tải hồ sơ xếp loại đoàn viên...</p>
      </div>
    );
  }

  const { sinhVien, currentRating, history } = data || {
    sinhVien: { mssv: '', hoTen: '' },
    currentRating: undefined,
    history: [],
  };

  const getXepLoaiTitle = (xl?: string) => {
    switch (xl) {
      case 'XuatSac':
        return 'Đoàn Viên Xuất Sắc';
      case 'Kha':
        return 'Đoàn Viên Khá';
      case 'TrungBinh':
        return 'Đoàn Viên Trung Bình';
      case 'Yeu':
        return 'Đoàn Viên Yếu';
      default:
        return 'Chưa Xếp Loại';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 ${
            alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-xl text-white shadow-md shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bình Bầu & Phân Loại Đoàn Viên</h1>
            <p className="text-sm text-slate-500">
              Tự đánh giá rèn luyện và theo dõi kết quả phân loại thi đua theo Điều lệ Đoàn TNCS Hồ Chí Minh
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          disabled={currentRating?.doanKhoaDuyet}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition self-start md:self-auto ${
            currentRating?.doanKhoaDuyet
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
          }`}
        >
          <Edit className="w-4 h-4" />
          {currentRating?.tuDanhGia ? 'Chỉnh sửa tự nhận xét' : 'Tự đánh giá năm học'}
        </button>
      </div>

      {/* Hero Banner: Danh hiệu & Xếp loại năm học gần nhất */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-yellow-400/20 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/20 text-white backdrop-blur-sm">
                Năm học {currentRating?.namHoc || '2025-2026'}
              </span>
              {sinhVien.laDoanVienUuTu && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-amber-900 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Đoàn Viên Ưu Tú
                </span>
              )}
            </div>

            <div>
              <div className="text-xs text-amber-100 uppercase tracking-widest font-semibold">
                Kết Quả Phân Loại Đoàn Viên
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-1">
                {getXepLoaiTitle(currentRating?.xepLoai)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-100/90 pt-1">
              <span>Đoàn viên: <strong>{sinhVien.hoTen}</strong></span>
              <span>Chi đoàn: <strong>{sinhVien.lop || '-'}</strong></span>
              <span>Điểm rèn luyện: <strong>{sinhVien.diemRenLuyenTichLuy ?? 0} đ</strong></span>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[260px] text-right md:text-left space-y-2">
            <span className="text-xs uppercase font-bold text-amber-200 tracking-wider">Trạng thái phê duyệt</span>
            <div className="flex items-center gap-2">
              {currentRating?.doanKhoaDuyet ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span className="text-sm font-bold text-white">Đoàn Trường đã duyệt chính thức</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-yellow-200 shrink-0" />
                  <span className="text-sm font-bold text-white">Chờ Đoàn Trường phê duyệt</span>
                </>
              )}
            </div>
            {currentRating?.chiDoanDanhGia && (
              <p className="text-xs text-amber-100/90 italic pt-1 border-t border-white/15">
                "Chi đoàn: {currentRating.chiDoanDanhGia}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Tự Đánh Giá */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Edit className="w-5 h-5 text-amber-600" />
              Bản Tự Đánh Giá & Nhận Xét Rèn Luyện Đoàn Viên
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium"
            >
              Đóng
            </button>
          </div>

          <form onSubmit={handleSubmitSelfEval} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Năm học đánh giá
                </label>
                <input
                  type="text"
                  disabled
                  value={tuDanhGiaNamHoc}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức đề xuất tự xếp loại <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tuDanhGiaXepLoai}
                  onChange={(e) => setTuDanhGiaXepLoai(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="XuatSac">Đoàn viên Xuất sắc</option>
                  <option value="Kha">Đoàn viên Khá</option>
                  <option value="TrungBinh">Đoàn viên Trung bình</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung tự nhận xét (Ưu điểm, hạn chế và phương hướng rèn luyện) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Ví dụ: Trong năm học qua, tôi luôn chấp hành tốt Điều lệ Đoàn, tích cực tham gia các hoạt động tình nguyện do Đoàn trường tổ chức, đạt điểm rèn luyện tốt. Phương hướng: Tiếp tục nâng cao kết quả học tập và rèn luyện..."
                value={tuDanhGiaNoiDung}
                onChange={(e) => setTuDanhGiaNoiDung(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submittingForm}
                className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submittingForm ? 'Đang gửi...' : 'Gửi bản tự đánh giá'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lịch Sử Đánh Giá Các Năm */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Lịch Sử Phân Loại Qua Các Năm Học</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{history.length} năm học</span>
        </div>

        <div className="divide-y divide-slate-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">Chưa có kết quả phân loại nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Bấm nút "Tự đánh giá năm học" ở trên để gửi nhận xét rèn luyện của bạn
              </p>
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{h.namHoc}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        h.xepLoai === 'XuatSac'
                          ? 'bg-amber-100 text-amber-800'
                          : h.xepLoai === 'Kha'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {h.xepLoai === 'XuatSac' && <Star className="w-3 h-3 fill-amber-500" />}
                      {getXepLoaiTitle(h.xepLoai)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    {h.tuDanhGia && (
                      <p>
                        <span className="font-semibold text-slate-700">Tự nhận xét:</span>{' '}
                        <span className="italic text-slate-500">"{h.tuDanhGia}"</span>
                      </p>
                    )}
                    {h.chiDoanDanhGia && (
                      <p>
                        <span className="font-semibold text-slate-700">Chi đoàn nhận xét:</span>{' '}
                        <span className="text-slate-600">{h.chiDoanDanhGia}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {h.doanKhoaDuyet ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Đoàn Trường đã duyệt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Chờ duyệt chính thức
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tiêu chí phân loại theo Điều lệ Đoàn info box */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-yellow-50/30 p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950/90 leading-relaxed space-y-1">
          <p className="font-bold text-amber-950">
            Tiêu chuẩn đánh giá và phân loại đoàn viên theo Hướng dẫn thực hiện Điều lệ Đoàn:
          </p>
          <p>
            • <strong>Đoàn viên Xuất sắc:</strong> Điểm rèn luyện từ 85 trở lên, tham gia đầy đủ các phong trào, hoàn thành 100% nghĩa vụ đoàn phí, được chi đoàn biểu quyết đạt trên 80% phiếu thuận. Được ưu tiên xét chọn <strong>Đoàn viên Ưu tú</strong> giới thiệu cho Đảng xem xét kết nạp.
          </p>
          <p>
            • <strong>Đoàn viên Khá:</strong> Điểm rèn luyện từ 70 - 84, hoàn thành tốt nhiệm vụ được giao, không vi phạm kỷ luật.
          </p>
          <p>
            • <strong>Đoàn viên Trung bình / Yếu:</strong> Chưa tích cực tham gia sinh hoạt chi đoàn hoặc còn nợ đoàn phí quá thời hạn quy định.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentXepLoai;
