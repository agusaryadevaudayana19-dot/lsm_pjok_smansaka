import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Calendar,
  Save,
  Users,
  Clock,
  Search,
  Check,
  Sparkles,
  LayoutList,
  Table as TableIcon,
  MessageSquare,
  X,
  Filter,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PresensiRecord, StatusPresensi, User, UserRole } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface AttendanceManagerProps {
  db: LMSDatabase;
  role: UserRole;
  currentUser: User;
}

interface StatusConfig {
  key: StatusPresensi;
  code: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  activeColor: string;
  ringColor: string;
}

const STATUS_LIST: StatusConfig[] = [
  {
    key: 'H',
    code: 'H',
    name: 'Hadir',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    activeColor: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/80',
    ringColor: 'border-emerald-500',
  },
  {
    key: 'S',
    code: 'S',
    name: 'Sakit',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    activeColor: 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/80',
    ringColor: 'border-sky-500',
  },
  {
    key: 'I',
    code: 'I',
    name: 'Izin',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    activeColor: 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300/80',
    ringColor: 'border-amber-500',
  },
  {
    key: 'A',
    code: 'A',
    name: 'Alpa',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    activeColor: 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/80',
    ringColor: 'border-rose-500',
  },
  {
    key: 'T',
    code: 'T',
    name: 'Terlambat',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    activeColor: 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/80',
    ringColor: 'border-purple-500',
  },
];

const DEFAULT_KETERANGAN: Record<StatusPresensi, string> = {
  H: 'Hadir',
  S: 'Sakit',
  I: 'Izin',
  A: 'Alpa',
  T: 'Terlambat',
};

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ db, role, currentUser }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    db.kelas.length > 0 ? db.kelas[0].id : 'cls-xi-1'
  );
  const [selectedTanggal, setSelectedTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusPresensi>('ALL');

  // Default to table mode with frozen status column
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [editingNoteMuridId, setEditingNoteMuridId] = useState<string | null>(null);

  const muridInKelas = useMemo(() => {
    return db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);
  }, [db.users, selectedKelasId]);

  // Attendance and notes maps for selected date & class
  const getInitialStatus = (): Record<string, StatusPresensi> => {
    const map: Record<string, StatusPresensi> = {};
    muridInKelas.forEach((m) => {
      const existing = (db.presensi || []).find(
        (p) => p.muridId === m.id && p.tanggal === selectedTanggal
      );
      map[m.id] = existing ? existing.status : 'H';
    });
    return map;
  };

  const getInitialNotes = (): Record<string, string> => {
    const map: Record<string, string> = {};
    muridInKelas.forEach((m) => {
      const existing = (db.presensi || []).find(
        (p) => p.muridId === m.id && p.tanggal === selectedTanggal
      );
      if (existing && existing.keterangan && existing.keterangan !== 'Presensi Pembelajaran PJOK') {
        map[m.id] = existing.keterangan;
      } else {
        const st = existing ? existing.status : 'H';
        map[m.id] = DEFAULT_KETERANGAN[st];
      }
    });
    return map;
  };

  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusPresensi>>(getInitialStatus());
  const [keteranganMap, setKeteranganMap] = useState<Record<string, string>>(getInitialNotes());

  // Sync attendance map when class or date changes
  useEffect(() => {
    const statusMap: Record<string, StatusPresensi> = {};
    const notesMap: Record<string, string> = {};

    muridInKelas.forEach((m) => {
      const existing = (db.presensi || []).find(
        (p) => p.muridId === m.id && p.tanggal === selectedTanggal
      );
      const st = existing ? existing.status : 'H';
      statusMap[m.id] = st;

      if (existing && existing.keterangan && existing.keterangan !== 'Presensi Pembelajaran PJOK') {
        notesMap[m.id] = existing.keterangan;
      } else {
        notesMap[m.id] = DEFAULT_KETERANGAN[st];
      }
    });

    setAttendanceMap(statusMap);
    setKeteranganMap(notesMap);
  }, [selectedKelasId, selectedTanggal, muridInKelas, db.presensi]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleChangeStatus = (muridId: string, status: StatusPresensi) => {
    setAttendanceMap((prev) => ({ ...prev, [muridId]: status }));

    // Automatically update default keterangan unless a custom note was typed
    setKeteranganMap((prev) => {
      const currentNote = prev[muridId] || '';
      const isDefault = Object.values(DEFAULT_KETERANGAN).includes(currentNote) || !currentNote;
      if (isDefault) {
        return { ...prev, [muridId]: DEFAULT_KETERANGAN[status] };
      }
      return prev;
    });
  };

  const handleUpdateKeterangan = (muridId: string, note: string) => {
    setKeteranganMap((prev) => ({ ...prev, [muridId]: note }));
  };

  const handleSetAllHadir = () => {
    const updatedStatus: Record<string, StatusPresensi> = {};
    const updatedNotes: Record<string, string> = {};

    muridInKelas.forEach((m) => {
      updatedStatus[m.id] = 'H';
      updatedNotes[m.id] = DEFAULT_KETERANGAN['H'];
    });

    setAttendanceMap(updatedStatus);
    setKeteranganMap(updatedNotes);
    showToast(`Semua (${muridInKelas.length} siswa) disetel Hadir (H)`, 'info');
  };

  const handleSavePresensi = () => {
    const currentKelasObj = (db.kelas || []).find((k) => k.id === selectedKelasId);
    const kelasNama = currentKelasObj?.nama || selectedKelasId;

    const newRecords: PresensiRecord[] = muridInKelas.map((m) => {
      const st = attendanceMap[m.id] || 'H';
      const note = keteranganMap[m.id] || DEFAULT_KETERANGAN[st];

      return {
        id: `prs-${m.id}-${selectedTanggal}`,
        muridId: m.id,
        muridNama: m.name,
        kelasId: selectedKelasId,
        kelasNama: `Kelas ${kelasNama}`,
        tanggal: selectedTanggal,
        status: st,
        keterangan: note,
        guruId: currentUser?.id,
        guruNama: currentUser?.name,
      };
    });

    dataStorage.updateDatabase((prev) => {
      const otherRecords = prev.presensi.filter(
        (p) => !(p.kelasId === selectedKelasId && p.tanggal === selectedTanggal)
      );
      return {
        ...prev,
        presensi: [...otherRecords, ...newRecords],
      };
    });

    showToast(`Presensi Kelas ${kelasNama} (${newRecords.length} siswa) berhasil disimpan!`, 'success');
  };

  const filteredMurid = useMemo(() => {
    return muridInKelas.filter((m) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesNis = m.nis && m.nis.toLowerCase().includes(q);
        if (!matchesName && !matchesNis) return false;
      }
      // Status filter
      if (statusFilter !== 'ALL') {
        const currentSt = attendanceMap[m.id] || 'H';
        if (currentSt !== statusFilter) return false;
      }
      return true;
    });
  }, [muridInKelas, searchQuery, statusFilter, attendanceMap]);

  // Stats calculation
  const total = muridInKelas.length || 1;
  const countH = Object.values(attendanceMap).filter((s) => s === 'H').length;
  const countS = Object.values(attendanceMap).filter((s) => s === 'S').length;
  const countI = Object.values(attendanceMap).filter((s) => s === 'I').length;
  const countA = Object.values(attendanceMap).filter((s) => s === 'A').length;
  const countT = Object.values(attendanceMap).filter((s) => s === 'T').length;
  const persentase = Math.round(((countH + countT) / total) * 100);

  const selectedKelasObj = (db.kelas || []).find((k) => k.id === selectedKelasId);

  return (
    <div className="space-y-4 pb-24 sm:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-top-3">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="flex-1">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Banner - Mobile-Optimized */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-semibold text-blue-200 backdrop-blur-xs">
              <CalendarCheck className="w-3 h-3 text-emerald-400" />
              <span>Presensi Guru PJOK • VERSI 2.4.0 - 2026 PJOK SMANSAKA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Presensi Siswa Harian
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xl hidden sm:block">
              Pencatatan kehadiran siswa dengan tombol cepat <strong>H, S, I, A, T</strong> yang responsif di layar ponsel untuk pengisian langsung di lapangan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleSetAllHadir}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold text-blue-100 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-xl transition text-center"
              title="Setel semua siswa menjadi Hadir (H)"
            >
              Semua Hadir (H)
            </button>
            <button
              type="button"
              onClick={handleSavePresensi}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition text-center"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-white/15">
          {/* Pilih Kelas */}
          <div>
            <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Rombel / Kelas
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full text-xs font-bold bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 focus:outline-hidden focus:bg-slate-900 cursor-pointer"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id} className="bg-slate-900 text-white">
                  Kelas {k.nama} ({k.jurusan || 'PJOK'})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full text-xs font-semibold bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 focus:outline-hidden focus:bg-slate-900"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
              Cari Nama / NIS
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-blue-200" />
              <input
                type="text"
                placeholder="Ketik nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 rounded-xl text-xs focus:outline-hidden focus:bg-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-blue-200 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats & Summary */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 uppercase tracking-wider text-xs">
              Kelas {selectedKelasObj?.nama || selectedKelasId}
            </span>
            <span className="text-slate-400 font-medium">
              ({muridInKelas.length} Siswa)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
              Kehadiran: {persentase}%
            </span>
            
            {/* View Mode Toggle */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu HP (Praktis di Ponsel)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu HP</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel Ringkas"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Status Quick Summary Counters (Clickable to Filter) */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 text-center">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'H' ? 'ALL' : 'H')}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition text-center cursor-pointer ${
              statusFilter === 'H'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
            }`}
          >
            <span className="text-base sm:text-xl font-black font-mono block leading-none">{countH}</span>
            <p className="text-[10px] sm:text-xs font-bold mt-1">H</p>
            <span className="text-[9px] opacity-80 hidden sm:block">Hadir</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'S' ? 'ALL' : 'S')}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition text-center cursor-pointer ${
              statusFilter === 'S'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-sky-50/80 hover:bg-sky-100 border-sky-200 text-sky-900'
            }`}
          >
            <span className="text-base sm:text-xl font-black font-mono block leading-none">{countS}</span>
            <p className="text-[10px] sm:text-xs font-bold mt-1">S</p>
            <span className="text-[9px] opacity-80 hidden sm:block">Sakit</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'I' ? 'ALL' : 'I')}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition text-center cursor-pointer ${
              statusFilter === 'I'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-amber-50/80 hover:bg-amber-100 border-amber-200 text-amber-900'
            }`}
          >
            <span className="text-base sm:text-xl font-black font-mono block leading-none">{countI}</span>
            <p className="text-[10px] sm:text-xs font-bold mt-1">I</p>
            <span className="text-[9px] opacity-80 hidden sm:block">Izin</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'A' ? 'ALL' : 'A')}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition text-center cursor-pointer ${
              statusFilter === 'A'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50/80 hover:bg-rose-100 border-rose-200 text-rose-900'
            }`}
          >
            <span className="text-base sm:text-xl font-black font-mono block leading-none">{countA}</span>
            <p className="text-[10px] sm:text-xs font-bold mt-1">A</p>
            <span className="text-[9px] opacity-80 hidden sm:block">Alpa</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'T' ? 'ALL' : 'T')}
            className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition text-center cursor-pointer ${
              statusFilter === 'T'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-purple-50/80 hover:bg-purple-100 border-purple-200 text-purple-900'
            }`}
          >
            <span className="text-base sm:text-xl font-black font-mono block leading-none">{countT}</span>
            <p className="text-[10px] sm:text-xs font-bold mt-1">T</p>
            <span className="text-[9px] opacity-80 hidden sm:block">Telat</span>
          </button>
        </div>

        {statusFilter !== 'ALL' && (
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl text-slate-600">
            <span>
              Menampilkan siswa dengan status: <strong>{statusFilter} ({DEFAULT_KETERANGAN[statusFilter]})</strong>
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${persentase}%` }}
          />
        </div>
      </div>

      {/* VIEW MODE 1: KARTU HP (RESPONSIF MOBILE-FIRST) */}
      {viewMode === 'card' && (
        <div className="space-y-3">
          {filteredMurid.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Tidak ada data siswa yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            filteredMurid.map((murid, idx) => {
              const currentStatus = attendanceMap[murid.id] || 'H';
              const currentNote = keteranganMap[murid.id] || DEFAULT_KETERANGAN[currentStatus];
              const activeConfig = STATUS_LIST.find((s) => s.key === currentStatus);
              const isEditingNote = editingNoteMuridId === murid.id;

              return (
                <div
                  key={murid.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs transition hover:shadow-xs space-y-3"
                >
                  {/* Baris 1: No, Avatar, Nama Siswa Lengkap, dan Keterangan Terpilih */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Nomor urut */}
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      {/* Avatar */}
                      <img
                        src={
                          murid.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${murid.name}`
                        }
                        alt={murid.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mt-0.5"
                      />

                      {/* Nama Murid & NIS - Jelas dan Terbuka */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug break-words">
                          {murid.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                          <span>NIS: {murid.nis || '-'}</span>
                          {murid.jenisKelamin && (
                            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">
                              {murid.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge Keterangan Terpilih */}
                    <div className="shrink-0 flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                          activeConfig?.badgeBg || 'bg-emerald-100'
                        } ${activeConfig?.badgeText || 'text-emerald-800'}`}
                      >
                        <span className="font-black text-xs font-mono">[{currentStatus}]</span>
                        <span className="font-bold">{activeConfig?.name || currentStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Baris 2: Tombol Status Presensi (H, S, I, A, T SAJA) */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Pilih Status Kehadiran:</span>
                      <span className="text-[11px] font-mono text-slate-600">
                        {activeConfig?.code} - {activeConfig?.name}
                      </span>
                    </div>

                    {/* 5 Tombol H, S, I, A, T - Ukuran nyaman di jari jempol hp */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {STATUS_LIST.map((st) => {
                        const isSelected = currentStatus === st.key;
                        return (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => handleChangeStatus(murid.id, st.key)}
                            className={`py-2.5 sm:py-2 text-sm sm:text-base font-black rounded-xl transition-all flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
                              isSelected
                                ? `${st.activeColor} scale-[1.02]`
                                : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200'
                            }`}
                            title={`Tandai ${murid.name} sebagai ${st.name} (${st.code})`}
                          >
                            <span className="font-black leading-none">{st.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Baris 3: Catatan Keterangan Detail (Bisa diedit jika sakit/izin tertentu) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">
                        Keterangan:
                      </span>
                      {isEditingNote ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={currentNote}
                            onChange={(e) => handleUpdateKeterangan(murid.id, e.target.value)}
                            placeholder="Tulis catatan (misal: Cedera kaki, Dispen)..."
                            className="flex-1 px-2.5 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setEditingNoteMuridId(null)}
                            className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => setEditingNoteMuridId(murid.id)}
                          className="text-slate-700 font-medium truncate cursor-pointer hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-100"
                          title="Klik untuk mengubah catatan keterangan detail"
                        >
                          {currentNote || DEFAULT_KETERANGAN[currentStatus]}
                        </span>
                      )}
                    </div>

                    {!isEditingNote && (
                      <button
                        type="button"
                        onClick={() => setEditingNoteMuridId(murid.id)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 flex items-center gap-0.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Catatan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABEL DENGAN KOLOM STATUS KEHADIRAN DIBEKUKAN DI SISI KIRI */}
      {viewMode === 'table' && (
        <div className="space-y-2.5">
          {/* Petunjuk Pembekuan Kolom & Versi Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-950 shadow-2xs">
            <div className="flex items-center gap-2 font-medium">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span>
                Kolom <strong>No</strong>, <strong>Nama Murid</strong>, dan <strong>STATUS KEHADIRAN</strong> dibekukan di sisi kiri. Geser tabel ke kanan untuk memilih tombol status kehadiran (H, S, I, A, T).
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-[10px] font-black tracking-wider text-blue-800 bg-blue-100/90 border border-blue-200 px-2.5 py-1 rounded-full uppercase">
                VERSI 2.4.0 - 2026 PJOK SMANSAKA
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto relative max-h-[640px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-slate-100/95 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
                    {/* Kolom 1 Dibekukan: No */}
                    <th className="py-3.5 px-2.5 w-12 min-w-[48px] max-w-[48px] text-center sticky left-0 z-50 bg-slate-100 border-r border-slate-200">
                      No
                    </th>

                    {/* Kolom 2 Dibekukan: Nama Murid & Identitas */}
                    <th className="py-3.5 px-3 w-52 min-w-[208px] max-w-[208px] sticky left-12 z-50 bg-slate-100 border-r border-slate-200">
                      Nama Murid & NIS
                    </th>

                    {/* Kolom 3 Dibekukan: STATUS KEHADIRAN */}
                    <th className="py-3.5 px-3 w-40 min-w-[160px] max-w-[160px] text-center sticky left-[256px] z-50 bg-slate-100 border-r-2 border-slate-300 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.12)]">
                      <div className="flex items-center justify-center gap-1.5 text-blue-950 font-black">
                        <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Status Kehadiran</span>
                      </div>
                    </th>

                    {/* Kolom Geser ke Kanan: Tombol Pilihan Status (H, S, I, A, T) - Kotak Huruf Saja */}
                    <th className="py-3.5 px-4 text-center min-w-[260px] bg-slate-50 border-r border-slate-200">
                      Pilihan Status (H, S, I, A, T)
                    </th>

                    {/* Kolom Keterangan / Alasan Lengkap */}
                    <th className="py-3.5 px-3 min-w-[220px] border-r border-slate-200">
                      Keterangan / Catatan Siswa
                    </th>

                    {/* Kolom Rekapitulasi Kehadiran */}
                    <th className="py-3.5 px-3 min-w-[140px] text-center">
                      Rekap Siswa
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMurid.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        Tidak ditemukan data murid yang sesuai filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredMurid.map((murid, idx) => {
                      const currentStatus = attendanceMap[murid.id] || 'H';
                      const currentNote = keteranganMap[murid.id] || DEFAULT_KETERANGAN[currentStatus];
                      const activeConfig = STATUS_LIST.find((s) => s.key === currentStatus);

                      // Summary stats for this student across all recorded sessions
                      const studentPresensi = (db.presensi || []).filter((p) => p.muridId === murid.id);
                      const sHadir = studentPresensi.filter((p) => p.status === 'H').length;
                      const sSakit = studentPresensi.filter((p) => p.status === 'S').length;
                      const sIzin = studentPresensi.filter((p) => p.status === 'I').length;
                      const sAlpa = studentPresensi.filter((p) => p.status === 'A').length;

                      return (
                        <tr key={murid.id} className="hover:bg-slate-50/90 transition-colors group">
                          {/* Kolom 1 Dibekukan: No */}
                          <td className="py-2.5 px-2.5 text-center font-bold text-slate-400 sticky left-0 z-30 bg-white group-hover:bg-slate-50 border-r border-slate-100">
                            {idx + 1}
                          </td>

                          {/* Kolom 2 Dibekukan: Nama Murid & Identitas */}
                          <td className="py-2.5 px-3 sticky left-12 z-30 bg-white group-hover:bg-slate-50 border-r border-slate-100">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  murid.avatar ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${murid.name}`
                                }
                                alt={murid.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              />
                              <div className="min-w-0">
                                <span className="font-extrabold text-slate-900 block truncate">
                                  {murid.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  NIS: {murid.nis || '-'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Kolom 3 Dibekukan: STATUS KEHADIRAN (DI SISI KIRI) */}
                          <td className="py-2.5 px-3 sticky left-[256px] z-30 bg-white group-hover:bg-slate-50 border-r-2 border-slate-300 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.12)] text-center">
                            <button
                              type="button"
                              onClick={() => {
                                // Siklus klik cepat status H -> S -> I -> A -> T -> H
                                const keys: StatusPresensi[] = ['H', 'S', 'I', 'A', 'T'];
                                const curIdx = keys.indexOf(currentStatus);
                                const nextStatus = keys[(curIdx + 1) % keys.length];
                                handleChangeStatus(murid.id, nextStatus);
                              }}
                              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-transform active:scale-95 shadow-2xs w-full cursor-pointer ${activeConfig?.badgeBg} ${activeConfig?.badgeText} border ${activeConfig?.ringColor}`}
                              title="Klik untuk mengganti status cepat (siklus H, S, I, A, T)"
                            >
                              <span className="font-black font-mono text-sm">[{currentStatus}]</span>
                              <span className="truncate">{activeConfig?.name}</span>
                            </button>
                          </td>

                          {/* Kolom Geser Kanan: 1 KOLOM PILIHAN STATUS (H, S, I, A, T) DENGAN KOTAK ISI HURUF SAJA & SENTUH LAPANG */}
                          <td className="py-2.5 px-4 text-center border-r border-slate-100">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
                              {STATUS_LIST.map((st) => {
                                const isSelected = currentStatus === st.key;
                                return (
                                  <button
                                    key={st.key}
                                    type="button"
                                    onClick={() => handleChangeStatus(murid.id, st.key)}
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 ${
                                      isSelected
                                        ? `${st.activeColor} ring-2 ring-offset-1 ring-blue-400`
                                        : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 border border-slate-200/90'
                                    }`}
                                    title={`Setel ${st.name} (${st.code})`}
                                  >
                                    <span>{st.code}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Kolom Keterangan / Alasan Lengkap */}
                          <td className="py-2.5 px-3 border-r border-slate-100">
                            <input
                              type="text"
                              value={currentNote}
                              onChange={(e) => handleUpdateKeterangan(murid.id, e.target.value)}
                              placeholder="Keterangan siswa..."
                              className="text-[11px] py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                            />
                          </td>

                          {/* Kolom Rekapitulasi Kehadiran Siswa */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold">
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {sHadir}H
                              </span>
                              <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                {sSakit}S
                              </span>
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {sIzin}I
                              </span>
                              <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                {sAlpa}A
                              </span>
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
        </div>
      )}

      {/* FLOATING / STICKY BOTTOM ACTION BAR FOR MOBILE PHONES */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5">
          {/* Status summary pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-mono font-bold">
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[11px]">
              {countH}H
            </span>
            <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded font-black text-[11px]">
              {countS}S
            </span>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-black text-[11px]">
              {countI}I
            </span>
            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-black text-[11px]">
              {countA}A
            </span>
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-black text-[11px]">
              {countT}T
            </span>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetAllHadir}
              className="px-2.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition whitespace-nowrap cursor-pointer"
              title="Setel semua Hadir"
            >
              Semua H
            </button>
            <button
              type="button"
              onClick={handleSavePresensi}
              className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
