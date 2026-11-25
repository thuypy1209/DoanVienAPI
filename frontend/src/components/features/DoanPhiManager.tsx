'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { doanPhiApi, type DoanPhiQueryParams, type TaoDotThuPayload } from '../../api/doanPhiApi';
import type { DoanPhi, DoanPhiStats, DoanPhiFilters } from '../../types';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Search,
  RotateCcw,
  Check,
  X,
  CreditCard,
  Users,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DoanPhiManager: React.FC = () => {
  const [items, setItems] = useState<DoanPhi[]>([]);
  const [stats, setStats] = useState<DoanPhiStats>({
    tongSo: 0,
    soLuongDaNop: 0,
    soLuongChuaNop: 0,
    tongTienDaThu: 0,
    tongTienChuaThu: 0,
    tyLeHoanThanh: 0,
  });
  const [filtersData, setFiltersData] = useState<DoanPhiFilters>({
    danhSachNamHoc: [],
    danhSachHocKy: [],
    danhSachKhoa: [],
    danhSachLop: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter States
  const [filterNamHoc, setFilterNamHoc] = useState<string>('');
  const [filterHocKy, setFilterHocKy] = useState<string>('');
  const [filterKhoa, setFilterKhoa] = useState<string>('');
  const [filterLop, setFilterLop] = useState<string>('');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('TatCa');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Notification Banner
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Tạo đợt thu mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<TaoDotThuPayload>({
    namHoc: '2025-2026',
    hocKy: 'HK2',
    soTien: 24000,
    khoa: '',
    lop: '',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Modal Xác nhận thu tiền nhanh
  const [confirmingItem, setConfirmingItem] = useState<DoanPhi | null>(null);
  const [customNguoiThu, setCustomNguoiThu] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const params: DoanPhiQueryParams = {};
      if (filterNamHoc) params.namHoc = filterNamHoc;
      if (filterHocKy) params.hocKy = filterHocKy;
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterTrangThai && filterTrangThai !== 'TatCa') params.trangThai = filterTrangThai;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await doanPhiApi.getAll(params);
      setItems(res.items || []);
      setStats(res.stats);
      if (res.filters) {
        setFiltersData(res.filters);
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu đoàn phí:', err);
      showAlert('error', 'Không thể kết nối đến máy chủ lấy dữ liệu đoàn phí.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNamHoc, filterHocKy, filterKhoa, filterLop, filterTrangThai]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilters = () => {
    setFilterNamHoc('');
    setFilterHocKy('');
    setFilterKhoa('');
    setFilterLop('');
    setFilterTrangThai('TatCa');
    setSearchTerm('');
  };

  // Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 1-Click Thu tiền
  const handleOpenConfirm = (dp: DoanPhi) => {
    setConfirmingItem(dp);
    setCustomNguoiThu('');
  };

  const handleConfirmPayment = async () => {
    if (!confirmingItem) return;
    try {
      setSubmittingAction(true);
      await doanPhiApi.xacNhan(confirmingItem.id, customNguoiThu.trim() || undefined);
      showAlert('success', `Đã xác nhận thu đoàn phí cho ${confirmingItem.hoTen || confirmingItem.mssv}`);
      setConfirmingItem(null);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Không thể xác nhận thu tiền.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Undo Payment
  const handleUndoPayment = async (dp: DoanPhi) => {
    if (!confirm(`Bạn có chắc muốn hủy trạng thái nộp tiền của ${dp.hoTen || dp.mssv}?`)) return;
    try {
      await doanPhiApi.huyXacNhan(dp.id);
      showAlert('success', `Đã hủy xác nhận nộp đoàn phí cho ${dp.hoTen || dp.mssv}`);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Không thể hủy xác nhận.');
    }
  };

  // Batch Payment
  const handleBatchConfirm = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xác nhận thu đoàn phí cho ${selectedIds.length} đoàn viên đã chọn?`)) return;
    try {
      setSubmittingAction(true);
      const res = await doanPhiApi.xacNhanHangLoat(selectedIds);
      showAlert('success', res.message || `Đã xác nhận ${res.soLuong} đoàn viên.`);
      setSelectedIds([]);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi xác nhận hàng loạt.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Create Collection Period
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingCreate(true);
      const res = await doanPhiApi.taoDotThu(createForm);
      showAlert('success', `${res.message} (Đã thêm: ${res.soLuongTaoMoi}, Đã có: ${res.soLuongBoQua})`);
      setShowCreateModal(false);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi tạo đợt thu mới.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      showAlert('success', 'Đang kết xuất file Excel...');
      const params: DoanPhiQueryParams = {};
      if (filterNamHoc) params.namHoc = filterNamHoc;
      if (filterHocKy) params.hocKy = filterHocKy;
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterTrangThai && filterTrangThai !== 'TatCa') params.trangThai = filterTrangThai;

      const blob = await doanPhiApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Doan_Phi_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showAlert('error', 'Lỗi xuất file Excel.');
    }
  };

  // Role Badge Helper
  const renderChucVuBadge = (chucVu?: string) => {
    switch (chucVu) {
      case 'BiThu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
            <ShieldCheck className="w-3 h-3 text-red-600" /> Bí thư
          </span>
        );
      case 'PhoBiThu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            <ShieldCheck className="w-3 h-3 text-amber-600" /> Phó Bí thư
          </span>
        );
      case 'UyVienBCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-3 h-3 text-indigo-600" /> UV BCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Đoàn viên
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 ${
            alert.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
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
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Thu Nộp Đoàn Phí</h1>
              <p className="text-sm text-slate-500">
                Theo dõi, xác nhận và thống kê tiến độ thu nộp đoàn phí toàn trường
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchConfirm}
              disabled={submittingAction}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              Xác nhận ({selectedIds.length})
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel Báo Cáo
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Tạo Đợt Thu Mới
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng tiền đã thu */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã thu về</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.tongTienDaThu.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.soLuongDaNop} đoàn viên đã hoàn tất</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tiền còn nợ / Chưa thu */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chưa thu / Còn nợ</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-700">
              {stats.tongTienChuaThu.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{stats.soLuongChuaNop} đoàn viên chưa đóng</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tổng số lượt thu */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng đoàn viên trong đợt</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.tongSo} <span className="text-sm font-normal text-slate-500">bản ghi</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Mức thu tiêu chuẩn: 24.000 đ / kỳ
            </p>
          </div>
        </div>

        {/* Card 4: Tỷ lệ hoàn thành */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tỷ lệ hoàn thành</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-700">
              {stats.tyLeHoanThanh} <span className="text-sm font-normal text-slate-500">%</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.tyLeHoanThanh, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo MSSV, Họ tên đoàn viên..."
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

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Năm học */}
          <select
            value={filterNamHoc}
            onChange={(e) => setFilterNamHoc(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Năm học: Tất cả</option>
            {filtersData.danhSachNamHoc.map((nh) => (
              <option key={nh} value={nh}>
                {nh}
              </option>
            ))}
          </select>

          {/* Học kỳ */}
          <select
            value={filterHocKy}
            onChange={(e) => setFilterHocKy(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Học kỳ: Tất cả</option>
            <option value="HK1">Học kỳ 1</option>
            <option value="HK2">Học kỳ 2</option>
            <option value="HK3">Học kỳ hè</option>
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

          {/* Lớp / Chi đoàn */}
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

          {/* Trạng thái */}
          <div className="flex items-center gap-1">
            <select
              value={filterTrangThai}
              onChange={(e) => setFilterTrangThai(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TatCa">Trạng thái: Tất cả</option>
              <option value="DaNop">Đã nộp</option>
              <option value="ChuaNop">Chưa nộp</option>
            </select>

            <button
              onClick={handleResetFilters}
              title="Đặt lại bộ lọc"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-4 h-4" />
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
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Đoàn viên</th>
                <th className="p-4">Chi đoàn / Khoa</th>
                <th className="p-4">Đợt thu</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Thông tin thu</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2" />
                    <p>Đang tải dữ liệu đoàn phí...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Wallet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy bản ghi đoàn phí nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hãy thay đổi bộ lọc hoặc bấm "Tạo Đợt Thu Mới" để phát sinh đoàn phí
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((dp) => {
                  const isSelected = selectedIds.includes(dp.id);
                  const isDaNop = dp.trangThai === 'DaNop';

                  return (
                    <tr
                      key={dp.id}
                      className={`hover:bg-blue-50/40 transition ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(dp.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Thông tin đoàn viên */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{dp.hoTen || 'Chưa có tên'}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-slate-500">{dp.mssv}</span>
                          {renderChucVuBadge(dp.chucVuDoan)}
                        </div>
                      </td>

                      {/* Chi đoàn / Khoa */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{dp.lop || '-'}</div>
                        <div className="text-xs text-slate-400">{dp.khoa || '-'}</div>
                      </td>

                      {/* Đợt thu */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {dp.hocKy}
                        </span>
                        <div className="text-xs text-slate-500 mt-0.5">{dp.namHoc}</div>
                      </td>

                      {/* Số tiền */}
                      <td className="p-4 text-right font-semibold text-slate-900">
                        {dp.soTien.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Trạng thái */}
                      <td className="p-4 text-center">
                        {isDaNop ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đã nộp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            Chưa nộp
                          </span>
                        )}
                      </td>

                      {/* Thông tin thu */}
                      <td className="p-4 text-xs">
                        {isDaNop ? (
                          <div>
                            <div className="text-slate-700 font-medium">
                              {dp.ngayNop ? new Date(dp.ngayNop).toLocaleDateString('vi-VN') : '-'}
                            </div>
                            <div className="text-slate-400">Thu: {dp.nguoiThu || 'BCH Đoàn'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa ghi nhận</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-center">
                        {isDaNop ? (
                          <button
                            onClick={() => handleUndoPayment(dp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hủy xác nhận thu tiền"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Hủy
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenConfirm(dp)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Thu tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Xác nhận thu tiền nhanh */}
      {confirmingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Xác Nhận Thu Đoàn Phí
              </div>
              <button
                onClick={() => setConfirmingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Đoàn viên:</span>
                  <span className="font-bold text-slate-900">{confirmingItem.hoTen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MSSV:</span>
                  <span className="font-mono text-slate-700">{confirmingItem.mssv}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chi đoàn / Lớp:</span>
                  <span className="font-medium text-slate-800">{confirmingItem.lop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kỳ thu nộp:</span>
                  <span className="font-semibold text-blue-700">
                    {confirmingItem.hocKy} - {confirmingItem.namHoc}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-emerald-700 text-base">
                    {confirmingItem.soTien.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người thu / Cán bộ xác nhận
                </label>
                <input
                  type="text"
                  placeholder="Để trống sẽ ghi nhận tài khoản hiện tại"
                  value={customNguoiThu}
                  onChange={(e) => setCustomNguoiThu(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingItem(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={submittingAction}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Xác nhận đã thu tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tạo đợt thu mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Plus className="w-5 h-5 text-blue-600" />
                Khởi Tạo Đợt Thu Đoàn Phí Mới
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Năm học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2025-2026"
                      value={createForm.namHoc}
                      onChange={(e) => setCreateForm({ ...createForm, namHoc: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Học kỳ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={createForm.hocKy}
                      onChange={(e) => setCreateForm({ ...createForm, hocKy: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="HK1">Học kỳ 1</option>
                      <option value="HK2">Học kỳ 2</option>
                      <option value="HK3">Học kỳ hè</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức thu đoàn phí (VNĐ / kỳ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={createForm.soTien}
                    onChange={(e) => setCreateForm({ ...createForm, soTien: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mức chuẩn Điều lệ Đoàn TNCS Hồ Chí Minh: 2.000đ - 4.000đ/tháng (24.000đ/kỳ)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giới hạn Khoa (Tùy chọn)
                    </label>
                    <select
                      value={createForm.khoa || ''}
                      onChange={(e) => setCreateForm({ ...createForm, khoa: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Áp dụng tất cả các Khoa</option>
                      {filtersData.danhSachKhoa.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giới hạn Chi đoàn (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 22DTHC1"
                      value={createForm.lop || ''}
                      onChange={(e) => setCreateForm({ ...createForm, lop: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  Hệ thống sẽ tự động quét danh sách sinh viên phù hợp và tạo bản ghi ở trạng thái{' '}
                  <span className="font-semibold text-amber-900">"Chưa nộp"</span>. Những sinh viên đã có bản ghi trong kỳ này sẽ được tự động bỏ qua.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {submittingCreate ? 'Đang tạo...' : 'Tạo đợt thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoanPhiManager;
