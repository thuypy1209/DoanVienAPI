'use client';

import React, { useEffect, useState } from 'react';
import { soDoanApi, type SoDoanQueryParams, type TiepNhanSoDoanPayload } from '../../api/soDoanApi';
import { sinhVienApi } from '../../api/sinhVienApi';
import type { SoDoan, SoDoanStats, SoDoanFilters, User } from '../../types';
import {
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Search,
  RotateCcw,
  Check,
  X,
  FileText,
  MapPin,
  ShieldCheck,
  Sun,
  Archive,
  Sparkles,
  ArrowRightLeft,
  Edit2,
  RefreshCw,
} from 'lucide-react';

export const SoDoanManager: React.FC = () => {
  const [items, setItems] = useState<SoDoan[]>([]);
  const [stats, setStats] = useState<SoDoanStats>({
    tongSo: 0,
    soLuongDaNop: 0,
    soLuongChuaNop: 0,
    soLuongDaRut: 0,
    soLuongGiayGioiThieuHe: 0,
    tyLeNop: 0,
  });
  const [filtersData, setFiltersData] = useState<SoDoanFilters>({
    danhSachKhoa: [],
    danhSachLop: [],
    danhSachViTri: [],
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterKhoa, setFilterKhoa] = useState<string>('');
  const [filterLop, setFilterLop] = useState<string>('');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('TatCa');
  const [filterGiayHe, setFilterGiayHe] = useState<string>('TatCa');
  const [filterViTri, setFilterViTri] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Tiếp Nhận Sổ Đoàn
  const [showTiepNhanModal, setShowTiepNhanModal] = useState(false);
  const [sinhVienList, setSinhVienList] = useState<User[]>([]);
  const [selectedSvId, setSelectedSvId] = useState<number | ''>('');
  const [tiepNhanViTri, setTiepNhanViTri] = useState('Tủ A - Ngăn Khoa CNTT');
  const [tiepNhanGiayHe, setTiepNhanGiayHe] = useState(true);
  const [submittingTiepNhan, setSubmittingTiepNhan] = useState(false);

  // Modal Đổi Vị Trí Lưu Trữ
  const [editingItem, setEditingItem] = useState<SoDoan | null>(null);
  const [newViTri, setNewViTri] = useState('');
  const [submittingViTri, setSubmittingViTri] = useState(false);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterTrangThai && filterTrangThai !== 'TatCa') params.trangThai = filterTrangThai;
      if (filterGiayHe !== 'TatCa') params.giayGioiThieuHe = filterGiayHe === 'true';
      if (filterViTri) params.viTriLuuTru = filterViTri;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await soDoanApi.getAll(params);
      setItems(res.items || []);
      setStats(res.stats);
      if (res.filters) setFiltersData(res.filters);
    } catch (err) {
      console.error('Lỗi tải dữ liệu sổ đoàn:', err);
      showAlert('error', 'Không thể kết nối đến máy chủ lấy dữ liệu sổ đoàn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKhoa, filterLop, filterTrangThai, filterGiayHe, filterViTri]);

  // Load student list for modal
  const handleOpenTiepNhan = async (defaultItem?: SoDoan) => {
    try {
      const res = await sinhVienApi.getAll();
      setSinhVienList(res.sinhViens || []);
      if (defaultItem) {
        setSelectedSvId(defaultItem.sinhVienId);
        setTiepNhanViTri(defaultItem.viTriLuuTru || `Tủ A - Ngăn Khoa ${defaultItem.khoa || 'CNTT'}`);
      } else {
        setSelectedSvId('');
        setTiepNhanViTri('Tủ A - Ngăn Khoa CNTT');
      }
      setTiepNhanGiayHe(true);
      setShowTiepNhanModal(true);
    } catch (err) {
      showAlert('error', 'Lỗi khi tải danh sách sinh viên.');
    }
  };

  const handleTiepNhanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSvId) {
      showAlert('error', 'Vui lòng chọn đoàn viên cần tiếp nhận sổ đoàn.');
      return;
    }

    try {
      setSubmittingTiepNhan(true);
      const res = await soDoanApi.tiepNhan({
        sinhVienId: Number(selectedSvId),
        viTriLuuTru: tiepNhanViTri.trim(),
        giayGioiThieuHe: tiepNhanGiayHe,
      });
      showAlert('success', res.message || 'Tiếp nhận sổ đoàn thành công.');
      setShowTiepNhanModal(false);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi tiếp nhận sổ đoàn.');
    } finally {
      setSubmittingTiepNhan(false);
    }
  };

  // Rút sổ đoàn
  const handleRutSo = async (item: SoDoan) => {
    if (!confirm(`Xác nhận rút sổ đoàn cho sinh viên ${item.hoTen} (${item.mssv})?`)) return;
    try {
      const res = await soDoanApi.rutSo(item.id);
      showAlert('success', res.message || 'Đã xác nhận rút sổ đoàn.');
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi rút sổ đoàn.');
    }
  };

  // Toggle Giấy Giới Thiệu Hè
  const handleToggleGiayHe = async (item: SoDoan) => {
    const nextVal = !item.giayGioiThieuHe;
    try {
      const res = await soDoanApi.capGiayGioiThieuHe(item.id, nextVal);
      showAlert('success', res.message || 'Đã cập nhật giấy giới thiệu hè.');
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi cập nhật giấy giới thiệu hè.');
    }
  };

  // Đổi Vị Trí Lưu Trữ
  const handleOpenViTri = (item: SoDoan) => {
    setEditingItem(item);
    setNewViTri(item.viTriLuuTru || '');
  };

  const handleViTriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setSubmittingViTri(true);
      const res = await soDoanApi.capNhatViTri(editingItem.id, newViTri.trim());
      showAlert('success', res.message || 'Cập nhật vị trí thành công.');
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi cập nhật vị trí.');
    } finally {
      setSubmittingViTri(false);
    }
  };

  // Đồng bộ danh sách
  const handleDongBo = async () => {
    try {
      const res = await soDoanApi.dongBo();
      showAlert('success', res.message || 'Đồng bộ danh sách sổ đoàn thành công.');
      await fetchData();
    } catch (err: any) {
      showAlert('error', 'Lỗi đồng bộ danh sách.');
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    try {
      showAlert('success', 'Đang kết xuất file Excel...');
      const params: any = {};
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterTrangThai && filterTrangThai !== 'TatCa') params.trangThai = filterTrangThai;
      if (filterGiayHe !== 'TatCa') params.giayGioiThieuHe = filterGiayHe === 'true';

      const blob = await soDoanApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Danh_Sach_So_Doan_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('error', 'Lỗi xuất file Excel.');
    }
  };

  const handleResetFilters = () => {
    setFilterKhoa('');
    setFilterLop('');
    setFilterTrangThai('TatCa');
    setFilterGiayHe('TatCa');
    setFilterViTri('');
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
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-500/20">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý & Lưu Trữ Sổ Đoàn</h1>
            <p className="text-sm text-slate-500">
              Quản lý vị trí tủ hồ sơ, thủ tục tiếp nhận / rút sổ đoàn và cấp Giấy giới thiệu hè
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDongBo}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition"
            title="Tự động thêm sinh viên mới chưa có bản ghi sổ đoàn"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            Đồng Bộ
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel
          </button>

          <button
            onClick={() => handleOpenTiepNhan()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Tiếp Nhận Sổ Đoàn
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Đang lưu trữ */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đang lưu trữ</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Archive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.soLuongDaNop} <span className="text-sm font-normal text-slate-500">cuốn</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tỷ lệ nộp sổ: {stats.tyLeNop}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Chưa nộp */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chưa nộp sổ</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-700">
              {stats.soLuongChuaNop} <span className="text-sm font-normal text-slate-500">đoàn viên</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Cần đôn đốc nộp về trường</p>
          </div>
        </div>

        {/* Card 3: Đã rút sổ */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã rút sổ</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats.soLuongDaRut} <span className="text-sm font-normal text-slate-500">hồ sơ</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Đã tốt nghiệp / chuyển sinh hoạt</p>
          </div>
        </div>

        {/* Card 4: Giấy giới thiệu hè */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Giấy giới thiệu hè</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700">
              {stats.soLuongGiayGioiThieuHe} <span className="text-sm font-normal text-slate-500">đã cấp</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Sinh hoạt Đoàn tại nơi cư trú</p>
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
              placeholder="Tìm theo MSSV, Họ tên, Số sổ đoàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Khoa */}
          <select
            value={filterKhoa}
            onChange={(e) => setFilterKhoa(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Chi đoàn: Tất cả</option>
            {filtersData.danhSachLop.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Trạng thái sổ */}
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="TatCa">Trạng thái: Tất cả</option>
            <option value="DaNop">Đang lưu trữ</option>
            <option value="ChuaNop">Chưa nộp</option>
            <option value="DaRut">Đã rút sổ</option>
          </select>

          {/* Giấy giới thiệu hè */}
          <select
            value={filterGiayHe}
            onChange={(e) => setFilterGiayHe(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="TatCa">Giấy hè: Tất cả</option>
            <option value="true">Đã cấp giấy hè</option>
            <option value="false">Chưa cấp giấy hè</option>
          </select>

          {/* Vị trí lưu trữ & Reset */}
          <div className="flex items-center gap-1">
            <select
              value={filterViTri}
              onChange={(e) => setFilterViTri(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Vị trí: Tất cả tủ/ngăn</option>
              {filtersData.danhSachViTri.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
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
                <th className="p-4">Đoàn viên</th>
                <th className="p-4">Chi đoàn / Khoa</th>
                <th className="p-4">Số đoàn viên</th>
                <th className="p-4 text-center">Trạng thái sổ</th>
                <th className="p-4">Vị trí lưu trữ</th>
                <th className="p-4 text-center">Giấy giới thiệu hè</th>
                <th className="p-4">Ngày tiếp nhận</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-2" />
                    <p>Đang tải dữ liệu sổ đoàn...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <FolderArchive className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy bản ghi sổ đoàn nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Bấm nút "Đồng Bộ" để tự động tạo bản ghi cho các đoàn viên trong hệ thống
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDaNop = item.trangThaiSoDoan === 'DaNop';
                  const isChuaNop = item.trangThaiSoDoan === 'ChuaNop';
                  const isDaRut = item.trangThaiSoDoan === 'DaRut';

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition">
                      {/* Đoàn viên */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{item.hoTen || 'Chưa cập nhật'}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-slate-500">{item.mssv}</span>
                          {item.chucVuDoan === 'BiThu' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              Bí thư
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Chi đoàn / Khoa */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{item.lop || '-'}</div>
                        <div className="text-xs text-slate-400">{item.khoa || '-'}</div>
                      </td>

                      {/* Số đoàn viên */}
                      <td className="p-4 font-mono text-xs text-slate-700">
                        {item.soDoanVien || <span className="text-slate-300 italic">Chưa cấp</span>}
                      </td>

                      {/* Trạng thái sổ */}
                      <td className="p-4 text-center">
                        {isDaNop && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đang lưu trữ
                          </span>
                        )}
                        {isChuaNop && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Chưa nộp
                          </span>
                        )}
                        {isDaRut && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                            Đã rút sổ
                          </span>
                        )}
                      </td>

                      {/* Vị trí lưu trữ */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="text-xs font-medium text-slate-800">
                            {item.viTriLuuTru || <span className="text-slate-400 italic">Chưa xếp tủ</span>}
                          </span>
                          <button
                            onClick={() => handleOpenViTri(item)}
                            title="Đổi vị trí"
                            className="p-1 text-slate-400 hover:text-purple-600 rounded transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Giấy giới thiệu hè */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleGiayHe(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            item.giayGioiThieuHe
                              ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Bấm để bật/tắt cấp giấy giới thiệu sinh hoạt hè"
                        >
                          <Sun className={`w-3.5 h-3.5 ${item.giayGioiThieuHe ? 'text-amber-600' : 'text-slate-400'}`} />
                          {item.giayGioiThieuHe ? 'Đã cấp' : 'Chưa cấp'}
                        </button>
                      </td>

                      {/* Ngày tiếp nhận */}
                      <td className="p-4 text-xs text-slate-600">
                        {item.ngayNop ? new Date(item.ngayNop).toLocaleDateString('vi-VN') : '-'}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isChuaNop ? (
                            <button
                              onClick={() => handleOpenTiepNhan(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition"
                            >
                              Tiếp nhận
                            </button>
                          ) : isDaNop ? (
                            <button
                              onClick={() => handleRutSo(item)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
                            >
                              Rút sổ
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenTiepNhan(item)}
                              className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                            >
                              Nhận lại
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Tiếp nhận sổ đoàn */}
      {showTiepNhanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <FolderArchive className="w-5 h-5 text-purple-600" />
                Tiếp Nhận Sổ Đoàn Viên
              </div>
              <button
                onClick={() => setShowTiepNhanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTiepNhanSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đoàn viên nộp sổ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedSvId}
                    onChange={(e) => setSelectedSvId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Chọn đoàn viên --</option>
                    {sinhVienList.map((sv) => (
                      <option key={sv.id} value={sv.id}>
                        {sv.mssv} - {sv.hoTen} ({sv.lop || 'Chưa rõ lớp'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vị trí lưu trữ trong kho hồ sơ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tủ A - Ngăn Khoa CNTT"
                    value={tiepNhanViTri}
                    onChange={(e) => setTiepNhanViTri(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Tủ A - Ngăn CNTT', 'Tủ A - Ngăn QTKD', 'Tủ B - Ngăn KTQT', 'Tủ C - Hồ Sơ Mới'].map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setTiepNhanViTri(tag)}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tiepNhanGiayHe}
                      onChange={(e) => setTiepNhanGiayHe(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Cấp Giấy giới thiệu sinh hoạt Đoàn nơi cư trú (Giấy hè)</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTiepNhanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingTiepNhan}
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submittingTiepNhan ? 'Đang lưu...' : 'Xác nhận tiếp nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Đổi vị trí lưu trữ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <MapPin className="w-5 h-5 text-purple-600" />
                Cập Nhật Vị Trí Lưu Trữ
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleViTriSubmit}>
              <div className="p-5 space-y-3">
                <div className="text-xs text-slate-500">
                  Đoàn viên: <strong className="text-slate-800">{editingItem.hoTen}</strong> ({editingItem.mssv})
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vị trí tủ / ngăn mới
                  </label>
                  <input
                    type="text"
                    required
                    value={newViTri}
                    onChange={(e) => setNewViTri(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingViTri}
                  className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoDoanManager;
