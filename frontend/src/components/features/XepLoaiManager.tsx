'use client';

import React, { useEffect, useState } from 'react';
import { xepLoaiApi, type XepLoaiQueryParams, type KhoiTaoDotPayload } from '../../api/xepLoaiApi';
import type { XepLoaiDoanVien, XepLoaiStats, XepLoaiFilters } from '../../types';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Search,
  RotateCcw,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Star,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCheck,
  Edit3,
} from 'lucide-react';

export const XepLoaiManager: React.FC = () => {
  const [items, setItems] = useState<XepLoaiDoanVien[]>([]);
  const [stats, setStats] = useState<XepLoaiStats>({
    tongSo: 0,
    soLuongXuatSac: 0,
    soLuongKha: 0,
    soLuongTrungBinh: 0,
    soLuongYeu: 0,
    soLuongDaDuyet: 0,
    soLuongChoDuyet: 0,
    soLuongUuTu: 0,
    tyLeDuyet: 0,
  });
  const [filtersData, setFiltersData] = useState<XepLoaiFilters>({
    danhSachNamHoc: [],
    danhSachKhoa: [],
    danhSachLop: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter States
  const [filterNamHoc, setFilterNamHoc] = useState<string>('');
  const [filterKhoa, setFilterKhoa] = useState<string>('');
  const [filterLop, setFilterLop] = useState<string>('');
  const [filterXepLoai, setFilterXepLoai] = useState<string>('TatCa');
  const [filterDuyet, setFilterDuyet] = useState<string>('TatCa');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Toast Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Chi Đoàn Bình Xét
  const [evaluatingItem, setEvaluatingItem] = useState<XepLoaiDoanVien | null>(null);
  const [chiDoanXepLoai, setChiDoanXepLoai] = useState<string>('Kha');
  const [chiDoanNhanXet, setChiDoanNhanXet] = useState<string>('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Modal Khởi Tạo Đợt Đánh Giá
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<KhoiTaoDotPayload>({
    namHoc: '2025-2026',
    khoa: '',
    lop: '',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: XepLoaiQueryParams = {};
      if (filterNamHoc) params.namHoc = filterNamHoc;
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterXepLoai && filterXepLoai !== 'TatCa') params.xepLoai = filterXepLoai;
      if (filterDuyet !== 'TatCa') params.doanKhoaDuyet = filterDuyet === 'true';
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await xepLoaiApi.getAll(params);
      setItems(res.items || []);
      setStats(res.stats);
      if (res.filters) setFiltersData(res.filters);
    } catch (err) {
      console.error('Lỗi tải dữ liệu phân loại đoàn viên:', err);
      showAlert('error', 'Không thể kết nối máy chủ để tải dữ liệu phân loại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNamHoc, filterKhoa, filterLop, filterXepLoai, filterDuyet]);

  // Checkbox selection
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

  // 1-Click Duyệt / Hủy Duyệt
  const handleToggleDuyet = async (item: XepLoaiDoanVien) => {
    try {
      const nextDuyet = !item.doanKhoaDuyet;
      const res = await xepLoaiApi.duyet(item.id, { doanKhoaDuyet: nextDuyet });
      showAlert('success', res.message || 'Đã cập nhật trạng thái phê duyệt.');
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi cập nhật phê duyệt.');
    }
  };

  // Duyệt hàng loạt
  const handleBatchDuyet = async (doanKhoaDuyet: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await xepLoaiApi.duyetHangLoat({ ids: selectedIds, doanKhoaDuyet });
      showAlert('success', res.message || `Đã phê duyệt ${res.soLuong} đoàn viên.`);
      setSelectedIds([]);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi phê duyệt hàng loạt.');
    }
  };

  // Xét Đoàn Viên Ưu Tú
  const handleToggleUuTu = async (item: XepLoaiDoanVien) => {
    const nextUuTu = !item.laDoanVienUuTu;
    try {
      const res = await xepLoaiApi.duyet(item.id, {
        doanKhoaDuyet: true,
        setDoanVienUuTu: nextUuTu,
      });
      showAlert(
        'success',
        nextUuTu
          ? `Đã công nhận Đoàn viên Ưu tú cho ${item.hoTen}!`
          : `Đã thu hồi danh hiệu Đoàn viên Ưu tú của ${item.hoTen}.`
      );
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khi xét Đoàn viên Ưu tú.');
    }
  };

  // Mở modal Chi đoàn bình xét
  const handleOpenEval = (item: XepLoaiDoanVien) => {
    setEvaluatingItem(item);
    setChiDoanXepLoai(item.xepLoai || 'Kha');
    setChiDoanNhanXet(item.chiDoanDanhGia || '');
  };

  const handleSaveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingItem) return;
    try {
      setSubmittingEval(true);
      const res = await xepLoaiApi.chiDoanDanhGia(evaluatingItem.id, {
        xepLoai: chiDoanXepLoai,
        chiDoanDanhGia: chiDoanNhanXet.trim(),
      });
      showAlert('success', res.message || 'Lưu đánh giá chi đoàn thành công.');
      setEvaluatingItem(null);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi lưu đánh giá chi đoàn.');
    } finally {
      setSubmittingEval(false);
    }
  };

  // Khởi tạo đợt đánh giá mới
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingCreate(true);
      const res = await xepLoaiApi.khoiTaoDot(createForm);
      showAlert('success', `${res.message} (Tạo mới: ${res.soLuongTaoMoi}, Đã có: ${res.soLuongBoQua})`);
      setShowCreateModal(false);
      await fetchData();
    } catch (err: any) {
      showAlert('error', err.response?.data || 'Lỗi khởi tạo đợt đánh giá.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    try {
      showAlert('success', 'Đang kết xuất file Excel phân loại đoàn viên...');
      const params: XepLoaiQueryParams = {};
      if (filterNamHoc) params.namHoc = filterNamHoc;
      if (filterKhoa) params.khoa = filterKhoa;
      if (filterLop) params.lop = filterLop;
      if (filterXepLoai && filterXepLoai !== 'TatCa') params.xepLoai = filterXepLoai;
      if (filterDuyet !== 'TatCa') params.doanKhoaDuyet = filterDuyet === 'true';

      const blob = await xepLoaiApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Phan_Loai_Doan_Vien_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('error', 'Lỗi xuất file Excel.');
    }
  };

  const handleResetFilters = () => {
    setFilterNamHoc('');
    setFilterKhoa('');
    setFilterLop('');
    setFilterXepLoai('TatCa');
    setFilterDuyet('TatCa');
    setSearchTerm('');
  };

  // Xếp loại badge helper
  const renderXepLoaiBadge = (xl: string) => {
    switch (xl) {
      case 'XuatSac':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Xuất sắc
          </span>
        );
      case 'Kha':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Khá
          </span>
        );
      case 'TrungBinh':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            Trung bình
          </span>
        );
      case 'Yeu':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Yếu
          </span>
        );
      default:
        return <span>{xl}</span>;
    }
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
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-xl text-white shadow-md shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bình Bầu & Phân Loại Đoàn Viên</h1>
            <p className="text-sm text-slate-500">
              Quy trình 3 bước: Đoàn viên tự nhận xét, Chi đoàn họp bình xét và Đoàn Khoa / Trường phê duyệt
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => handleBatchDuyet(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition"
            >
              <CheckCheck className="w-4 h-4" />
              Duyệt ({selectedIds.length})
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-md shadow-amber-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Khởi Tạo Đợt Đánh Giá
          </button>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Xuất sắc */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Xuất sắc</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800">
            {stats.soLuongXuatSac} <span className="text-xs font-normal text-slate-500">đoàn viên</span>
          </div>
        </div>

        {/* Card 2: Khá */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Khá</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">
            {stats.soLuongKha} <span className="text-xs font-normal text-slate-500">đoàn viên</span>
          </div>
        </div>

        {/* Card 3: Trung bình & Yếu */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">TB & Yếu</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-800">
            {stats.soLuongTrungBinh + stats.soLuongYeu}{' '}
            <span className="text-xs font-normal text-slate-500">cần rèn luyện</span>
          </div>
        </div>

        {/* Card 4: Đoàn viên Ưu tú */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ĐV Ưu Tú</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-800">
            {stats.soLuongUuTu} <span className="text-xs font-normal text-slate-500">được xét</span>
          </div>
        </div>

        {/* Card 5: Tỷ lệ duyệt */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã phê duyệt</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800">
            {stats.tyLeDuyet}%
          </div>
          <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.tyLeDuyet, 100)}%` }}
            />
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
              placeholder="Tìm theo MSSV, Họ tên đoàn viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Năm học */}
          <select
            value={filterNamHoc}
            onChange={(e) => setFilterNamHoc(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Năm học: Tất cả</option>
            {filtersData.danhSachNamHoc.map((nh) => (
              <option key={nh} value={nh}>
                {nh}
              </option>
            ))}
          </select>

          {/* Khoa */}
          <select
            value={filterKhoa}
            onChange={(e) => setFilterKhoa(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Chi đoàn: Tất cả</option>
            {filtersData.danhSachLop.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Xếp loại */}
          <select
            value={filterXepLoai}
            onChange={(e) => setFilterXepLoai(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="TatCa">Xếp loại: Tất cả</option>
            <option value="XuatSac">Xuất sắc</option>
            <option value="Kha">Khá</option>
            <option value="TrungBinh">Trung bình</option>
            <option value="Yeu">Yếu</option>
          </select>

          {/* Trạng thái duyệt */}
          <div className="flex items-center gap-1">
            <select
              value={filterDuyet}
              onChange={(e) => setFilterDuyet(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TatCa">Phê duyệt: Tất cả</option>
              <option value="true">Đã phê duyệt</option>
              <option value="false">Chờ phê duyệt</option>
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
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Đoàn viên</th>
                <th className="p-4">Chi đoàn / Năm học</th>
                <th className="p-4 text-center">Điểm RL</th>
                <th className="p-4">Đoàn viên tự đánh giá</th>
                <th className="p-4">Chi đoàn họp bình xét</th>
                <th className="p-4 text-center">Mức xếp loại</th>
                <th className="p-4 text-center">Trạng thái duyệt</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-2" />
                    <p>Đang tải danh sách phân loại đoàn viên...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy bản ghi phân loại nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Bấm nút "Khởi Tạo Đợt Đánh Giá" để phát sinh đợt bình bầu cho năm học mới
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isDuyet = item.doanKhoaDuyet;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-amber-50/30 transition ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Thông tin đoàn viên */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{item.hoTen}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-slate-500">{item.mssv}</span>
                          {item.laDoanVienUuTu && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                              <Sparkles className="w-2.5 h-2.5" /> ĐV Ưu tú
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Chi đoàn / Năm học */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{item.lop || '-'}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.namHoc}</div>
                      </td>

                      {/* Điểm Rèn Luyện */}
                      <td className="p-4 text-center font-bold text-slate-900">
                        {item.diemRenLuyenTichLuy ?? 0}
                      </td>

                      {/* Tự đánh giá */}
                      <td className="p-4 text-xs max-w-xs">
                        {item.tuDanhGia ? (
                          <span className="text-slate-700 italic">"{item.tuDanhGia}"</span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa tự đánh giá</span>
                        )}
                      </td>

                      {/* Chi đoàn nhận xét */}
                      <td className="p-4 text-xs max-w-xs">
                        <div className="flex items-start gap-1">
                          {item.chiDoanDanhGia ? (
                            <span className="text-slate-800 font-medium">{item.chiDoanDanhGia}</span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa họp bình xét</span>
                          )}
                          <button
                            onClick={() => handleOpenEval(item)}
                            title="Chỉnh sửa đánh giá của Chi đoàn"
                            className="p-1 text-slate-400 hover:text-amber-600 rounded transition shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Mức xếp loại */}
                      <td className="p-4 text-center">
                        {renderXepLoaiBadge(item.xepLoai)}
                      </td>

                      {/* Trạng thái duyệt */}
                      <td className="p-4 text-center">
                        {isDuyet ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Check className="w-3.5 h-3.5" />
                            Đã duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3.5 h-3.5" />
                            Chờ duyệt
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleDuyet(item)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              isDuyet
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                            title={isDuyet ? 'Thu hồi phê duyệt' : 'Phê duyệt chính thức'}
                          >
                            {isDuyet ? 'Hủy' : 'Duyệt'}
                          </button>

                          {/* Xét Đoàn viên Ưu tú nếu Xuất sắc */}
                          {item.xepLoai === 'XuatSac' && (
                            <button
                              onClick={() => handleToggleUuTu(item)}
                              className={`p-1 rounded-lg text-xs transition ${
                                item.laDoanVienUuTu
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                              }`}
                              title={item.laDoanVienUuTu ? 'Đang là ĐV Ưu tú' : 'Xét tặng ĐV Ưu tú'}
                            >
                              <Sparkles className="w-4 h-4" />
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

      {/* Modal 1: Chi đoàn họp bình xét */}
      {evaluatingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Award className="w-5 h-5 text-amber-600" />
                Chi Đoàn Họp Bình Xét
              </div>
              <button
                onClick={() => setEvaluatingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEval}>
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đoàn viên:</span>
                    <span className="font-bold text-slate-900">{evaluatingItem.hoTen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MSSV:</span>
                    <span className="font-mono text-slate-700">{evaluatingItem.mssv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chi đoàn / Năm học:</span>
                    <span className="font-medium text-slate-800">
                      {evaluatingItem.lop} ({evaluatingItem.namHoc})
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Đoàn viên tự nhận xét:</span>
                    <span className="font-medium text-slate-800 italic">
                      {evaluatingItem.tuDanhGia || 'Chưa gửi nhận xét'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức xếp loại Chi đoàn đề xuất <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={chiDoanXepLoai}
                    onChange={(e) => setChiDoanXepLoai(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="XuatSac">Đoàn viên Xuất sắc</option>
                    <option value="Kha">Đoàn viên Khá</option>
                    <option value="TrungBinh">Đoàn viên Trung bình</option>
                    <option value="Yeu">Đoàn viên Yếu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhận xét & Đánh giá của tập thể Chi đoàn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ghi nhận xét của Chi đoàn (VD: Tích cực tham gia các phong trào, chấp hành tốt Điều lệ Đoàn...)"
                    value={chiDoanNhanXet}
                    onChange={(e) => setChiDoanNhanXet(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submittingEval ? 'Đang lưu...' : 'Lưu kết quả bình xét'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Khởi tạo đợt đánh giá mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Plus className="w-5 h-5 text-amber-600" />
                Khởi Tạo Đợt Đánh Giá Năm Học
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm học đánh giá <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025-2026"
                    value={createForm.namHoc}
                    onChange={(e) => setCreateForm({ ...createForm, namHoc: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giới hạn Khoa (Tùy chọn)
                    </label>
                    <select
                      value={createForm.khoa || ''}
                      onChange={(e) => setCreateForm({ ...createForm, khoa: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Tất cả các Khoa</option>
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
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  Hệ thống sẽ dựa vào Điểm rèn luyện tích lũy của sinh viên để đề xuất mức xếp loại sơ bộ ban đầu và mở cổng tự đánh giá cho đoàn viên.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {submittingCreate ? 'Đang khởi tạo...' : 'Khởi tạo đợt đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default XepLoaiManager;
