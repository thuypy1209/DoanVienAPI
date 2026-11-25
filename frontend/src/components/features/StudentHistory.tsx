'use client';

import React, { useEffect, useState } from 'react';
import { hoatDongApi } from '../../api/hoatDongApi';
import type { DangKyHoatDong } from '../../types';
import { CheckCircle2, Clock, Award, QrCode } from 'lucide-react';

export const StudentHistory: React.FC = () => {
  const [history, setHistory] = useState<DangKyHoatDong[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInCode, setCheckInCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await hoatDongApi.getLichSu();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelfCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(checkInCode.trim(), 10);
    if (isNaN(id)) {
      alert('Vui lòng nhập mã ID số của hoạt động.');
      return;
    }

    try {
      setCheckingIn(true);
      const res = await hoatDongApi.checkInByActivity(id);
      alert(res.message || 'Check-in thành công!');
      setCheckInCode('');
      fetchHistory();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const totalPoints = history
    .filter((h) => h.trangThai === 'DaThamGia')
    .reduce((sum, h) => sum + (h.diemCong || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Lịch Sử Tham Gia Hoạt Động</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tình trạng điểm danh và tổng số điểm rèn luyện đã được cộng
          </p>
        </div>

        {/* Quick Points badge */}
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-amber-800 font-bold text-sm shadow-sm">
          <Award className="h-5 w-5 text-amber-600" />
          <span>+{totalPoints} Điểm ĐRL từ các hoạt động</span>
        </div>
      </div>

      {/* Điểm danh thủ công qua ID hoạt động */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-600" />
          <span>Điểm danh trực tiếp (Nhập mã ID hoạt động)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Nếu không quét được mã QR qua camera, bạn có thể nhập trực tiếp mã số hoạt động bên dưới để điểm danh:
        </p>
        <form onSubmit={handleSelfCheckIn} className="flex gap-2 max-w-md">
          <input
            type="number"
            value={checkInCode}
            onChange={(e) => setCheckInCode(e.target.value)}
            placeholder="Nhập ID hoạt động (Ví dụ: 1)"
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={checkingIn}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {checkingIn ? 'Đang gửi...' : 'Điểm danh'}
          </button>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Đang tải lịch sử...</div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Bạn chưa đăng ký tham gia hoạt động nào. Hãy chuyển sang tab "Trang chủ" để đăng ký!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Tên hoạt động</th>
                  <th className="py-3.5 px-4">Địa điểm</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Điểm</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{item.tenHoatDong}</td>
                    <td className="py-3.5 px-4 text-xs">{item.diaDiem || 'Chưa cập nhật'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {item.thoiGian ? new Date(item.thoiGian).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-600">+{item.diemCong}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.trangThai === 'DaThamGia' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã điểm danh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Clock className="h-3.5 w-3.5" />
                          Chờ tham gia
                        </span>
                      )}
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
};

export default StudentHistory;
