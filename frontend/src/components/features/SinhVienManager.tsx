'use client';

import React, { useEffect, useState } from 'react';
import { sinhVienApi } from '../../api/sinhVienApi';
import type { User } from '../../types';
import {
  GraduationCap,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  X,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Award,
  Star,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const SinhVienManager: React.FC = () => {
  const [sinhViens, setSinhViens] = useState<User[]>([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedKhoa, setSelectedKhoa] = useState('');
  const [selectedChucVu, setSelectedChucVu] = useState('');
  const [filterLop, setFilterLop] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Thêm mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSv, setNewSv] = useState({
    mssv: '',
    hoTen: '',
    lop: '',
    khoa: '',
    email: '',
    password: '',
    diemRenLuyenTichLuy: 0,
    chucVuDoan: 'DoanVien',
    trangThaiDoan: 'ChinhThuc',
    laDoanVienUuTu: false,
    ngayVaoDoan: '',
    noiVaoDoan: '',
    soDoanVien: '',
  });

  // Modal Chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSv, setEditSv] = useState<{
    id?: number;
    mssv: string;
    hoTen: string;
    lop?: string;
    khoa?: string;
    email?: string;
    password?: string;
    diemRenLuyenTichLuy?: number;
    chucVuDoan?: string;
    trangThaiDoan?: string;
    laDoanVienUuTu?: boolean;
    ngayVaoDoan?: string;
    noiVaoDoan?: string;
    soDoanVien?: string;
  } | null>(null);

  // Import Excel state
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Load danh sách sinh viên
  const fetchSinhViens = async () => {
    try {
      setLoading(true);
      const res = await sinhVienApi.getAll({
        khoa: selectedKhoa || undefined,
        lop: filterLop || undefined,
        search: searchTerm || undefined,
      });
      setSinhViens(res.sinhViens);
      if (res.danhSachKhoa && res.danhSachKhoa.length > 0) {
        setDanhSachKhoa(res.danhSachKhoa);
      }
    } catch (err: any) {
      console.error('Lỗi lấy danh sách sinh viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSinhViens();
  }, [selectedKhoa]);

  // Tìm kiếm khi gõ
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSinhViens();
  };

  const handleResetFilters = () => {
    setSelectedKhoa('');
    setSelectedChucVu('');
    setFilterLop('');
    setSearchTerm('');
    sinhVienApi.getAll().then((res) => {
      setSinhViens(res.sinhViens);
      setDanhSachKhoa(res.danhSachKhoa || []);
    });
  };

  // Filter sinh viên theo Chức vụ trên Client
  const filteredSinhViens = sinhViens.filter((sv) => {
    if (!selectedChucVu) return true;
    if (selectedChucVu === 'UuTu') return sv.laDoanVienUuTu === true;
    return sv.chucVuDoan === selectedChucVu;
  });

  // 1. Thêm mới sinh viên
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSv.mssv || !newSv.hoTen) {
      alert('Vui lòng nhập đầy đủ MSSV và Họ tên!');
      return;
    }

    try {
      setSubmitting(true);
      await sinhVienApi.create({
        ...newSv,
        diemRenLuyenTichLuy: Number(newSv.diemRenLuyenTichLuy),
        ngayVaoDoan: newSv.ngayVaoDoan ? new Date(newSv.ngayVaoDoan).toISOString() : undefined,
      });
      setShowAddModal(false);
      setNewSv({
        mssv: '',
        hoTen: '',
        lop: '',
        khoa: '',
        email: '',
        password: '',
        diemRenLuyenTichLuy: 0,
        chucVuDoan: 'DoanVien',
        trangThaiDoan: 'ChinhThuc',
        laDoanVienUuTu: false,
        ngayVaoDoan: '',
        noiVaoDoan: '',
        soDoanVien: '',
      });
      await fetchSinhViens();
      alert('Thêm đoàn viên mới thành công!');
    } catch (err: any) {
      alert('Không thể thêm sinh viên: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Chỉnh sửa sinh viên
  const openEditModal = (sv: User) => {
    setEditSv({
      id: sv.id,
      mssv: sv.mssv,
      hoTen: sv.hoTen,
      lop: sv.lop || '',
      khoa: sv.khoa || '',
      email: sv.email || '',
      diemRenLuyenTichLuy: sv.diemRenLuyenTichLuy || 0,
      password: '',
      chucVuDoan: sv.chucVuDoan || 'DoanVien',
      trangThaiDoan: sv.trangThaiDoan || 'ChinhThuc',
      laDoanVienUuTu: sv.laDoanVienUuTu || false,
      ngayVaoDoan: sv.ngayVaoDoan ? sv.ngayVaoDoan.slice(0, 10) : '',
      noiVaoDoan: sv.noiVaoDoan || '',
      soDoanVien: sv.soDoanVien || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSv || !editSv.id) return;

    try {
      setSubmitting(true);
      await sinhVienApi.update(editSv.id, {
        ...editSv,
        diemRenLuyenTichLuy: Number(editSv.diemRenLuyenTichLuy),
        ngayVaoDoan: editSv.ngayVaoDoan ? new Date(editSv.ngayVaoDoan).toISOString() : undefined,
      });
      setShowEditModal(false);
      setEditSv(null);
      await fetchSinhViens();
      alert('Cập nhật đoàn viên thành công!');
    } catch (err: any) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Xóa sinh viên
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa đoàn viên này? Toàn bộ dữ liệu liên quan sẽ bị xóa.')) return;

    try {
      await sinhVienApi.delete(id);
      setSinhViens((prev) => prev.filter((s) => s.id !== id));
      alert('Đã xóa đoàn viên thành công!');
    } catch (err: any) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // 4. Import Excel
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportMsg(null);
      const res = await sinhVienApi.importExcel(file);
      setImportMsg({ type: 'success', text: res.message || 'Import danh sách sinh viên thành công!' });
      await fetchSinhViens();
    } catch (err: any) {
      setImportMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Lỗi khi import file Excel.',
      });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Helper render huy hiệu Chức vụ Đoàn
  const renderChucVuBadge = (chucVu?: string, laUuTu?: boolean) => {
    let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    let label = 'Đoàn viên';

    switch (chucVu) {
      case 'BiThu':
        colorClass = 'bg-red-50 text-red-700 border-red-200 font-bold';
        label = 'Bí thư Chi đoàn';
        break;
      case 'PhoBiThu':
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
        label = 'Phó Bí thư';
        break;
      case 'UyVienBCH':
        colorClass = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
        label = 'Ủy viên BCH';
        break;
      default:
        colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
        label = 'Đoàn viên';
        break;
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${colorClass}`}>
          {label}
        </span>
        {laUuTu && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] bg-yellow-50 text-yellow-800 border border-yellow-300 font-semibold shadow-2xs" title="Đoàn viên ưu tú phát triển Đảng">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-600" />
            <span>Ưu tú</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span>Quản Lý Danh Sách Đoàn Viên</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi hồ sơ chi đoàn, chức vụ, điểm rèn luyện và nghiệp vụ Đoàn Thanh niên
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Đoàn Viên</span>
        </button>
      </div>

      {/* ACTION BAR: EXPORT, TEMPLATE & IMPORT EXCEL */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/SinhVien/export"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </a>

          <a
            href="/api/SinhVien/template"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50/70 px-4 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition shadow-xs"
          >
            <Download className="h-4 w-4 text-sky-600" />
            <span>Tải Template Mẫu</span>
          </a>
        </div>

        {/* Form Import Excel */}
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition">
            <Upload className="h-4 w-4" />
            <span>{importing ? 'Đang Import...' : 'Import File Excel'}</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              disabled={importing}
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Thông báo kết quả Import */}
      {importMsg && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl p-4 text-xs font-semibold shadow-xs ${
            importMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {importMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{importMsg.text}</span>
        </div>
      )}

      {/* BỘ LỌC VÀ TÌM KIẾM */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Lọc theo Khoa */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Khoa / Viện:
            </label>
            <select
              value={selectedKhoa}
              onChange={(e) => setSelectedKhoa(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Tất cả khoa --</option>
              {danhSachKhoa.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo Chức vụ Đoàn */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Chức vụ / Ưu tú:
            </label>
            <select
              value={selectedChucVu}
              onChange={(e) => setSelectedChucVu(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Tất cả chức vụ --</option>
              <option value="BiThu">Bí thư Chi đoàn</option>
              <option value="PhoBiThu">Phó Bí thư</option>
              <option value="UyVienBCH">Ủy viên BCH</option>
              <option value="DoanVien">Đoàn viên</option>
              <option value="UuTu">⭐ Đoàn viên ưu tú</option>
            </select>
          </div>

          {/* Lọc theo Lớp */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Chi đoàn / Lớp:
            </label>
            <input
              type="text"
              value={filterLop}
              onChange={(e) => setFilterLop(e.target.value)}
              placeholder="VD: 22DTHC1"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Tìm kiếm từ khóa */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo MSSV, Họ tên..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
            >
              Lọc
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-100 transition shrink-0"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* BẢNG DỮ LIỆU ĐOÀN VIÊN */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-2" />
            <p>Đang tải danh sách đoàn viên...</p>
          </div>
        ) : filteredSinhViens.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <UserIcon className="mx-auto h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold">Chưa có dữ liệu đoàn viên nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 w-28">MSSV</th>
                  <th className="py-3.5 px-4">Họ tên & Thẻ Đoàn</th>
                  <th className="py-3.5 px-4">Chức vụ & Hồ sơ</th>
                  <th className="py-3.5 px-4">Chi Đoàn / Khoa</th>
                  <th className="py-3.5 px-4 text-center w-24">Điểm RL</th>
                  <th className="py-3.5 px-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSinhViens.map((item) => (
                  <tr key={item.id || item.mssv} className="hover:bg-slate-50/80 transition">
                    {/* MSSV */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {item.mssv}
                    </td>

                    {/* Họ tên & Mã thẻ đoàn */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase overflow-hidden border border-blue-100 shrink-0">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl.startsWith('http') ? item.avatarUrl : `http://localhost:5000${item.avatarUrl}`}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.hoTen ? item.hoTen.charAt(0) : 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{item.hoTen}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>Thẻ: {item.soDoanVien || 'Chưa cấp'}</span>
                            {item.email && <span>• {item.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chức vụ & Ưu tú */}
                    <td className="py-3.5 px-4">
                      {renderChucVuBadge(item.chucVuDoan, item.laDoanVienUuTu)}
                      {item.ngayVaoDoan && (
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vào Đoàn: {new Date(item.ngayVaoDoan).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </td>

                    {/* Lớp / Khoa */}
                    <td className="py-3.5 px-4 text-xs">
                      <div>Chi đoàn: <span className="font-bold text-slate-800">{item.lop || 'N/A'}</span></div>
                      <div className="text-slate-400 text-[11px]">{item.khoa || 'N/A'}</div>
                    </td>

                    {/* Điểm RL */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          (item.diemRenLuyenTichLuy || 0) >= 80
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        {item.diemRenLuyenTichLuy ?? 0}
                      </span>
                    </td>

                    {/* Hành động (Sửa, Xóa) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 shadow-xs overflow-hidden">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 transition border-r border-slate-100"
                          title="Sửa đoàn viên"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa đoàn viên"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: THÊM MỚI ĐOÀN VIÊN */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                <span>Thêm Hồ Sơ Đoàn Viên Mới</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Mã số sinh viên (MSSV) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSv.mssv}
                    onChange={(e) => setNewSv({ ...newSv, mssv: e.target.value })}
                    placeholder="Ví dụ: 2280603134"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSv.hoTen}
                    onChange={(e) => setNewSv({ ...newSv, hoTen: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Thông tin Chi đoàn & Chức vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Chi đoàn / Lớp
                  </label>
                  <input
                    type="text"
                    value={newSv.lop}
                    onChange={(e) => setNewSv({ ...newSv, lop: e.target.value })}
                    placeholder="Ví dụ: 22DTHC1"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Khoa / Viện
                  </label>
                  <input
                    type="text"
                    value={newSv.khoa}
                    onChange={(e) => setNewSv({ ...newSv, khoa: e.target.value })}
                    placeholder="Ví dụ: CNTT"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Chức vụ Đoàn
                  </label>
                  <select
                    value={newSv.chucVuDoan}
                    onChange={(e) => setNewSv({ ...newSv, chucVuDoan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DoanVien">Đoàn viên</option>
                    <option value="BiThu">Bí thư Chi đoàn</option>
                    <option value="PhoBiThu">Phó Bí thư</option>
                    <option value="UyVienBCH">Ủy viên BCH</option>
                  </select>
                </div>
              </div>

              {/* Thông tin nghiệp vụ Đoàn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Số thẻ Đoàn viên
                  </label>
                  <input
                    type="text"
                    value={newSv.soDoanVien}
                    onChange={(e) => setNewSv({ ...newSv, soDoanVien: e.target.value })}
                    placeholder="DV-2280603134"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Ngày vào Đoàn
                  </label>
                  <input
                    type="date"
                    value={newSv.ngayVaoDoan}
                    onChange={(e) => setNewSv({ ...newSv, ngayVaoDoan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Nơi vào Đoàn
                  </label>
                  <input
                    type="text"
                    value={newSv.noiVaoDoan}
                    onChange={(e) => setNewSv({ ...newSv, noiVaoDoan: e.target.value })}
                    placeholder="VD: THPT Gia Định"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={newSv.email}
                    onChange={(e) => setNewSv({ ...newSv, email: e.target.value })}
                    placeholder="sinhvien@example.com"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Điểm RL tích lũy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSv.diemRenLuyenTichLuy}
                    onChange={(e) => setNewSv({ ...newSv, diemRenLuyenTichLuy: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSv.laDoanVienUuTu}
                      onChange={(e) => setNewSv({ ...newSv, laDoanVienUuTu: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span>Đoàn viên ưu tú</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Mật khẩu ban đầu (Để trống sẽ mặc định là MSSV)
                </label>
                <input
                  type="password"
                  value={newSv.password}
                  onChange={(e) => setNewSv({ ...newSv, password: e.target.value })}
                  placeholder="Mặc định: trùng MSSV"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Đang thêm...' : 'Lưu Đoàn Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CHỈNH SỬA ĐOÀN VIÊN */}
      {/* ============================================================ */}
      {showEditModal && editSv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-500" />
                <span>Chỉnh Sửa Thông Tin Đoàn Viên</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Mã số sinh viên (MSSV) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSv.mssv}
                    onChange={(e) => setEditSv({ ...editSv, mssv: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSv.hoTen}
                    onChange={(e) => setEditSv({ ...editSv, hoTen: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Thông tin Chi đoàn & Chức vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Chi đoàn / Lớp
                  </label>
                  <input
                    type="text"
                    value={editSv.lop}
                    onChange={(e) => setEditSv({ ...editSv, lop: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Khoa / Viện
                  </label>
                  <input
                    type="text"
                    value={editSv.khoa}
                    onChange={(e) => setEditSv({ ...editSv, khoa: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Chức vụ Đoàn
                  </label>
                  <select
                    value={editSv.chucVuDoan}
                    onChange={(e) => setEditSv({ ...editSv, chucVuDoan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DoanVien">Đoàn viên</option>
                    <option value="BiThu">Bí thư Chi đoàn</option>
                    <option value="PhoBiThu">Phó Bí thư</option>
                    <option value="UyVienBCH">Ủy viên BCH</option>
                  </select>
                </div>
              </div>

              {/* Thông tin nghiệp vụ Đoàn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Số thẻ Đoàn viên
                  </label>
                  <input
                    type="text"
                    value={editSv.soDoanVien}
                    onChange={(e) => setEditSv({ ...editSv, soDoanVien: e.target.value })}
                    placeholder="DV-2280603134"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Ngày vào Đoàn
                  </label>
                  <input
                    type="date"
                    value={editSv.ngayVaoDoan}
                    onChange={(e) => setEditSv({ ...editSv, ngayVaoDoan: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Nơi vào Đoàn
                  </label>
                  <input
                    type="text"
                    value={editSv.noiVaoDoan}
                    onChange={(e) => setEditSv({ ...editSv, noiVaoDoan: e.target.value })}
                    placeholder="VD: THPT Gia Định"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editSv.email}
                    onChange={(e) => setEditSv({ ...editSv, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Điểm RL tích lũy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editSv.diemRenLuyenTichLuy}
                    onChange={(e) => setEditSv({ ...editSv, diemRenLuyenTichLuy: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSv.laDoanVienUuTu}
                      onChange={(e) => setEditSv({ ...editSv, laDoanVienUuTu: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span>Đoàn viên ưu tú</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Đổi mật khẩu mới (Bỏ trống nếu không muốn đổi)
                </label>
                <input
                  type="password"
                  value={editSv.password || ''}
                  onChange={(e) => setEditSv({ ...editSv, password: e.target.value })}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinhVienManager;
