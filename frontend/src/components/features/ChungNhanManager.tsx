'use client';

import React, { useEffect, useState } from 'react';
import { chungNhanApi, type ChungNhanQueryParams } from '../../api/chungNhanApi';
import { hoatDongApi } from '../../api/hoatDongApi';
import { sinhVienApi } from '../../api/sinhVienApi';
import type { ChungNhan, ChungNhanStats, ChungNhanFilters, HoatDong, User } from '../../types';
import {
  Award,
  CalendarDays,
  Users,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Trash2,
  Printer,
  X,
  ExternalLink,
  QrCode,
  Sparkles,
  Check,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export const ChungNhanManager: React.FC = () => {
  const [items, setItems] = useState<ChungNhan[]>([]);
  const [stats, setStats] = useState<ChungNhanStats>({
    tongSo: 0,
    soHoatDong: 0,
    soSinhVien: 0,
  });
  const [filtersData, setFiltersData] = useState<ChungNhanFilters>({
    danhSachHoatDong: [],
    danhSachKhoa: [],
    danhSachLop: [],
  });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterHoatDongId, setFilterHoatDongId] = useState<number | ''>('');
  const [filterKhoa, setFilterKhoa] = useState<string>('');
  const [filterLop, setFilterLop] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Toast Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Cấp Hàng Loạt
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchHoatDongId, setBatchHoatDongId] = useState<number | ''>('');
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Modal Cấp Đơn Lẻ
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleSvId, setSingleSvId] = useState<number | ''>('');
  const [singleHoatDongId, setSingleHoatDongId] = useState<number | ''>('');
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allActivities, setAllActivities] = useState<HoatDong[]>([]);
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // Modal Xem & In Giấy Chứng Nhận
  const [previewItem, setPreviewItem] = useState<ChungNhan | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: ChungNhanQueryParams = {};
      if (filterHoatDongId) params.hoatDongId = Number(filterHoatDongId);
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await chungNhanApi.getAll(params);
      setItems(res.items || []);
      setStats(res.stats);
      if (res.filters) setFiltersData(res.filters);
    } catch (err) {
      console.error('Lỗi tải danh sách chứng nhận:', err);
      showAlert('error', 'Không thể kết nối máy chủ để tải danh sách chứng nhận.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterHoatDongId, filterKhoa, filterLop]);

  // Load danh sách sinh viên & hoạt động cho modal
  const handleOpenSingleModal = async () => {
    try {
      const [resSv, resHd] = await Promise.all([
        sinhVienApi.getAll(),
        hoatDongApi.getAll(),
      ]);
      setAllStudents(resSv.sinhViens || []);
      setAllActivities(resHd || []);
      setSingleSvId('');
      setSingleHoatDongId('');
      setShowSingleModal(true);
    } catch (err) {
      showAlert('error', 'Lỗi tải dữ liệu sinh viên/hoạt động.');
    }
  };

  const handleOpenBatchModal = async () => {
    try {
      const resHd = await hoatDongApi.getAll();
      setAllActivities(resHd || []);
      setBatchHoatDongId('');
      setShowBatchModal(true);
    } catch (err) {
      showAlert('error', 'Lỗi tải danh sách hoạt động.');
    }
  };

  // Submit Cấp Hàng Loạt
  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchHoatDongId) {
      showAlert('error', 'Vui lòng chọn hoạt động cần cấp chứng nhận.');
      return;
    }

    try {
      setSubmittingBatch(true);
      const res = await chungNhanApi.capHangLoat({ hoatDongId: Number(batchHoatDongId) });
      showAlert('success', `${res.message} (Cấp mới: ${res.soLuongCapMoi}, Đã có: ${res.soLuongDaCo})`);
      setShowBatchModal(false);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi cấp chứng nhận hàng loạt.');
    } finally {
      setSubmittingBatch(false);
    }
  };

  // Submit Cấp Đơn Lẻ
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleSvId || !singleHoatDongId) {
      showAlert('error', 'Vui lòng chọn đầy đủ đoàn viên và hoạt động.');
      return;
    }

    try {
      setSubmittingSingle(true);
      const res = await chungNhanApi.capDon({
        sinhVienId: Number(singleSvId),
        hoatDongId: Number(singleHoatDongId),
      });
      showAlert('success', res.message || 'Cấp giấy chứng nhận thành công.');
      setShowSingleModal(false);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi cấp chứng nhận đơn lẻ.');
    } finally {
      setSubmittingSingle(false);
    }
  };

  // Thu hồi chứng nhận
  const handleThuHoi = async (item: ChungNhan) => {
    if (!confirm(`Bạn có chắc muốn thu hồi giấy chứng nhận ${item.maChungNhan} của ${item.hoTen}?`)) return;

    try {
      const res = await chungNhanApi.thuHoi(item.id);
      showAlert('success', res.message || 'Đã thu hồi chứng nhận.');
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi thu hồi chứng nhận.');
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    try {
      showAlert('success', 'Đang kết xuất file Excel danh sách chứng nhận...');
      const params: ChungNhanQueryParams = {};
      if (filterHoatDongId) params.hoatDongId = Number(filterHoatDongId);
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;

      const blob = await chungNhanApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Danh_Sach_Chung_Nhan_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('error', 'Lỗi xuất file Excel.');
    }
  };

  const handleResetFilters = () => {
    setFilterHoatDongId('');
    setFilterKhoa('');
    setFilterLop('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md shadow-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Cấp Giấy Chứng Nhận Điện Tử</h1>
            <p className="text-sm text-slate-500">
              Cấp chứng nhận hoàn thành hoạt động tình nguyện, phong trào Đoàn và quản lý mã QR tra cứu
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel
          </button>

          <button
            onClick={handleOpenSingleModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Cấp Đơn Lẻ
          </button>

          <button
            onClick={handleOpenBatchModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            Cấp Hàng Loạt Theo Hoạt Động
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng chứng nhận */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã cấp chứng nhận</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.tongSo} <span className="text-sm font-normal text-slate-500">chứng nhận</span>
            </div>
            <p className="mt-1 text-xs text-blue-600 font-medium">Có thể tra cứu mã QR công khai</p>
          </div>
        </div>

        {/* Card 2: Hoạt động */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hoạt động đã có chứng nhận</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.soHoatDong} <span className="text-sm font-normal text-slate-500">chương trình</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Phong trào, tình nguyện & hội thảo</p>
          </div>
        </div>

        {/* Card 3: Số đoàn viên */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đoàn viên được vinh danh</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.soSinhVien} <span className="text-sm font-normal text-slate-500">sinh viên</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Hoàn thành nghĩa vụ check-in</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="flex flex-col md:flex-row md:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã chứng nhận, MSSV, Họ tên hoặc Tên hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Hoạt động */}
          <select
            value={filterHoatDongId}
            onChange={(e) => setFilterHoatDongId(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Hoạt động: Tất cả</option>
            {filtersData.danhSachHoatDong.map((hd) => (
              <option key={hd.id} value={hd.id}>
                {hd.tenHoatDong}
              </option>
            ))}
          </select>

          {/* Khoa */}
          <select
            value={filterKhoa}
            onChange={(e) => setFilterKhoa(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Khoa: Tất cả</option>
            {filtersData.danhSachKhoa.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* Chi đoàn */}
          <select
            value={filterLop}
            onChange={(e) => setFilterLop(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chi đoàn: Tất cả</option>
            {filtersData.danhSachLop.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Reset */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Mã chứng nhận</th>
                <th className="p-4">Đoàn viên</th>
                <th className="p-4">Chi đoàn / Khoa</th>
                <th className="p-4">Hoạt động được chứng nhận</th>
                <th className="p-4 text-center">Điểm cộng</th>
                <th className="p-4">Ngày cấp</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2" />
                    <p>Đang tải danh sách chứng nhận...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Chưa có Giấy chứng nhận nào được cấp</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hãy chọn "Cấp Hàng Loạt Theo Hoạt Động" để cấp cho sinh viên đã check-in
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition">
                    {/* Mã chứng nhận */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                        <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item.maChungNhan}</span>
                      </div>
                    </td>

                    {/* Đoàn viên */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{item.hoTen}</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">{item.mssv}</div>
                    </td>

                    {/* Chi đoàn / Khoa */}
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{item.lop || '-'}</div>
                      <div className="text-xs text-slate-400">{item.khoa || '-'}</div>
                    </td>

                    {/* Hoạt động */}
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={item.tenHoatDong}>
                        {item.tenHoatDong}
                      </div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mt-1">
                        {item.loaiHoatDong === 'TinhNguyen'
                          ? 'Tình nguyện'
                          : item.loaiHoatDong === 'HoiThao'
                          ? 'Hội thảo'
                          : 'Phong trào'}
                      </span>
                    </td>

                    {/* Điểm cộng */}
                    <td className="p-4 text-center font-bold text-emerald-600">
                      +{item.diemCong} đ
                    </td>

                    {/* Ngày cấp */}
                    <td className="p-4 text-xs text-slate-600">
                      {new Date(item.ngayCap).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                          title="Xem và in Giấy chứng nhận điện tử"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Xem & In
                        </button>

                        <button
                          onClick={() => handleThuHoi(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Thu hồi chứng nhận"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Cấp hàng loạt */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Cấp Chứng Nhận Hàng Loạt
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBatch}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn hoạt động cần cấp chứng nhận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={batchHoatDongId}
                    onChange={(e) => setBatchHoatDongId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {allActivities.map((hd) => (
                      <option key={hd.id} value={hd.id}>
                        {hd.tenHoatDong} ({hd.loaiHoatDong || 'Phong trào'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
                  <p className="font-semibold">Quy tắc cấp chứng nhận tự động:</p>
                  <p>• Hệ thống quét tất cả sinh viên đã có trạng thái <strong>"Đã tham gia" (Check-in thành công)</strong> trong hoạt động này.</p>
                  <p>• Tự động tạo mã chứng nhận duy nhất chuẩn format <code>CN-2026-HD[ID]-[MSSV]</code>.</p>
                  <p>• Những sinh viên đã có giấy chứng nhận sẽ được tự động bỏ qua để tránh trùng lặp.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingBatch}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submittingBatch ? 'Đang cấp...' : 'Xác nhận cấp hàng loạt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Cấp đơn lẻ */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Plus className="w-5 h-5 text-blue-600" />
                Cấp Giấy Chứng Nhận Đơn Lẻ
              </div>
              <button
                onClick={() => setShowSingleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSingle}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn đoàn viên <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={singleSvId}
                    onChange={(e) => setSingleSvId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Chọn đoàn viên / sinh viên --</option>
                    {allStudents.map((sv) => (
                      <option key={sv.id} value={sv.id}>
                        {sv.mssv} - {sv.hoTen} ({sv.lop || 'Chưa rõ lớp'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={singleHoatDongId}
                    onChange={(e) => setSingleHoatDongId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {allActivities.map((hd) => (
                      <option key={hd.id} value={hd.id}>
                        {hd.tenHoatDong} (+{hd.diemCong}đ)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingSingle}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submittingSingle ? 'Đang cấp...' : 'Cấp chứng nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Template Xem & In Giấy Chứng Nhận Điện Tử */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Actions */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-sm font-bold text-slate-700">Mẫu Giấy Chứng Nhận Điện Tử Chính Thức</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In / Lưu PDF
                </button>
                <Link
                  href={`/verify/${previewItem.maChungNhan}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  Trang Tra Cứu
                </Link>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas Frame */}
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
                      {previewItem.hoTen}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                      <span>MSSV: <strong className="font-mono text-slate-900">{previewItem.mssv}</strong></span>
                      <span>Chi đoàn: <strong>{previewItem.lop || '-'}</strong></span>
                      <span>Khoa: <strong>{previewItem.khoa || '-'}</strong></span>
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

export default ChungNhanManager;
