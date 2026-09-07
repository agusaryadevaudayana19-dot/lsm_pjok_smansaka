import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Calendar,
  Save,
  Users,
  Clock,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Search,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
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
  badgeColor: string;
  activeColor: string;
  borderColor: string;
}

const STATUS_LIST: StatusConfig[] = [
  {
    key: 'H',
    code: 'H',
    name: 'Hadir',
    badgeColor: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
    activeColor: 'bg-emerald-600 text-white shadow-xs',
    borderColor: 'border-emerald-200',
  },
  {
    key: 'S',
    code: 'S',
    name: 'Sakit',
    badgeColor: 'text-sky-700 bg-sky-50 hover:bg-sky-100',
    activeColor: 'bg-sky-600 text-white shadow-xs',
    borderColor: 'border-sky-200',
  },
  {
    key: 'I',
    code: 'I',
    name: 'Izin',
    badgeColor: 'text-amber-700 bg-amber-50 hover:bg-amber-100',
    activeColor: 'bg-amber-600 text-white shadow-xs',
    borderColor: 'border-amber-200',
  },
  {
    key: 'A',
    code: 'A',
    name: 'Alpa',
    badgeColor: 'text-rose-700 bg-rose-50 hover:bg-rose-100',
    activeColor: 'bg-rose-600 text-white shadow-xs',
    borderColor: 'border-rose-200',
  },
  {
    key: 'T',
    code: 'T',
    name: 'Terlambat',
    badgeColor: 'text-purple-700 bg-purple-50 hover:bg-purple-100',
    activeColor: 'bg-purple-600 text-white shadow-xs',
    borderColor: 'border-purple-200',
  },
];

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ db, role, currentUser }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    db.kelas.length > 0 ? db.kelas[0].id : 'cls-xi-1'
  );
  const [selectedTanggal, setSelectedTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const muridInKelas = useMemo(() => {
    return db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);
  }, [db.users, selectedKelasId]);

  const filteredMurid = useMemo(() => {
    if (!searchQuery.trim()) return muridInKelas;
    const q = searchQuery.toLowerCase();
    return muridInKelas.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.nis && m.nis.includes(q))
    );
  }, [muridInKelas, searchQuery]);

  // Attendance map for selected date & class
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

  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusPresensi>>(
    getInitialStatus()
  );

  // Sync attendance map when class or date changes
  React.useEffect(() => {
    const map: Record<string, StatusPresensi> = {};
    muridInKelas.forEach((m) => {
      const existing = (db.presensi || []).find(
        (p) => p.muridId === m.id && p.tanggal === selectedTanggal
      );
      map[m.id] = existing ? existing.status : 'H';
    });
    setAttendanceMap(map);
  }, [selectedKelasId, selectedTanggal, muridInKelas, db.presensi]);

  const handleChangeStatus = (muridId: string, status: StatusPresensi) => {
    setAttendanceMap((prev) => ({ ...prev, [muridId]: status }));
  };

  const handleSetAllHadir = () => {
    const updated: Record<string, StatusPresensi> = {};
    muridInKelas.forEach((m) => {
      updated[m.id] = 'H';
    });
    setAttendanceMap(updated);
  };

  const handleSavePresensi = () => {
    const currentKelasObj = (db.kelas || []).find((k) => k.id === selectedKelasId);
    const kelasNama = currentKelasObj?.nama || selectedKelasId;

    const newRecords: PresensiRecord[] = muridInKelas.map((m) => ({
      id: `prs-${m.id}-${selectedTanggal}`,
      muridId: m.id,
      muridNama: m.name,
      kelasId: selectedKelasId,
      tanggal: selectedTanggal,
      status: attendanceMap[m.id] || 'H',
      keterangan: 'Presensi Pembelajaran PJOK',
    }));

    dataStorage.updateDatabase((prev) => {
      // Remove records for this class & date
      const otherRecords = prev.presensi.filter(
        (p) => !(p.kelasId === selectedKelasId && p.tanggal === selectedTanggal)
      );
      return {
        ...prev,
        presensi: [...otherRecords, ...newRecords],
      };
    });

    alert(`Presensi Kelas ${kelasNama} tanggal ${selectedTanggal} berhasil disimpan! (${newRecords.length} siswa)`);
  };

  // Stats calculation
  const total = muridInKelas.length || 1;
  const countH = Object.values(attendanceMap).filter((s) => s === 'H').length;
  const countS = Object.values(attendanceMap).filter((s) => s === 'S').length;
  const countI = Object.values(attendanceMap).filter((s) => s === 'I').length;
  const countA = Object.values(attendanceMap).filter((s) => s === 'A').length;
  const countT = Object.values(attendanceMap).filter((s) => s === 'T').length;
  const persentase = Math.round(((countH + countT) / total) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-blue-200">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Daftar Hadir Siswa Harian PJOK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Presensi Kelas & Status Kehadiran
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Daftar kehadiran siswa dengan fitur <strong className="text-white">kolom nama dibekukan (freeze column)</strong>, sehingga Anda dapat menggeser tabel ke status kehadiran secara leluasa tanpa kehilangan identitas siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSetAllHadir}
              className="px-3.5 py-2 text-xs font-bold text-blue-100 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-xs"
            >
              Semua Hadir (H)
            </button>
            <button
              type="button"
              onClick={handleSavePresensi}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Presensi
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/15">
          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full text-xs font-bold bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 focus:outline-hidden focus:bg-slate-900"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id} className="bg-slate-900 text-white">
                  Kelas {k.nama} ({k.jurusan || 'PJOK'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full text-xs font-semibold bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 focus:outline-hidden focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Cari Nama Siswa / NIS
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-blue-200" />
              <input
                type="text"
                placeholder="Filter nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 rounded-xl text-xs focus:outline-hidden focus:bg-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Kehadiran Kelas ({muridInKelas.length} Siswa)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Tanggal: {selectedTanggal}
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Tingkat Kehadiran: {persentase}%
          </span>
        </div>

        {/* 5 Status Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100">
            <span className="text-xl font-black text-emerald-700 font-mono">{countH}</span>
            <p className="text-[11px] font-bold text-emerald-900 mt-0.5">Hadir (H)</p>
          </div>
          <div className="p-3 bg-sky-50/80 rounded-2xl border border-sky-100">
            <span className="text-xl font-black text-sky-700 font-mono">{countS}</span>
            <p className="text-[11px] font-bold text-sky-900 mt-0.5">Sakit (S)</p>
          </div>
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-100">
            <span className="text-xl font-black text-amber-700 font-mono">{countI}</span>
            <p className="text-[11px] font-bold text-amber-900 mt-0.5">Izin (I)</p>
          </div>
          <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-100">
            <span className="text-xl font-black text-rose-700 font-mono">{countA}</span>
            <p className="text-[11px] font-bold text-rose-900 mt-0.5">Alpa (A)</p>
          </div>
          <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100">
            <span className="text-xl font-black text-purple-700 font-mono">{countT}</span>
            <p className="text-[11px] font-bold text-purple-900 mt-0.5">Terlambat (T)</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${persentase}%` }}
          />
        </div>
      </div>

      {/* Freeze Column Student Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Helper Badge for Freeze Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Kolom <strong className="text-slate-800">No</strong> & <strong className="text-slate-800">Nama Murid</strong> dibekukan di sisi kiri. Geser tabel ke kanan untuk melihat dan memilih status kehadiran secara penuh.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Menampilkan {filteredMurid.length} dari {muridInKelas.length} murid
          </span>
        </div>

        {/* Table Wrapper with horizontal scroll and fixed columns */}
        <div className="overflow-x-auto relative max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-30">
                {/* Frozen Column 1: No */}
                <th className="py-3 px-3 w-12 text-center sticky left-0 z-40 bg-slate-100 border-r border-slate-200">
                  No
                </th>

                {/* Frozen Column 2: Nama Murid */}
                <th className="py-3 px-4 min-w-[220px] max-w-[260px] sticky left-12 z-40 bg-slate-100 border-r border-slate-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)]">
                  Nama Murid
                </th>

                {/* Scrollable Column 3: Status Kehadiran */}
                <th className="py-3 px-4 text-center min-w-[320px]">
                  Status Kehadiran (Pilih Opsi)
                </th>

                {/* Scrollable Column 4: Keterangan / Status Aktif */}
                <th className="py-3 px-4 text-center min-w-[140px]">
                  Keterangan Terpilih
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMurid.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan nama murid yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMurid.map((murid, idx) => {
                  const currentStatus = attendanceMap[murid.id] || 'H';
                  const activeConfig = STATUS_LIST.find((s) => s.key === currentStatus);

                  return (
                    <tr
                      key={murid.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Frozen Cell 1: No */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* Frozen Cell 2: Nama Murid */}
                      <td className="py-3 px-4 sticky left-12 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center gap-2.5">
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

                      {/* Scrollable Cell 3: Status Kehadiran (Pill Buttons) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-2xs">
                          {STATUS_LIST.map((st) => {
                            const isSelected = currentStatus === st.key;
                            return (
                              <button
                                key={st.key}
                                type="button"
                                onClick={() => handleChangeStatus(murid.id, st.key)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                  isSelected
                                    ? st.activeColor
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                }`}
                              >
                                <span className="font-black text-xs">{st.code}</span>
                                <span className="text-[10px] hidden sm:inline">{st.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Scrollable Cell 4: Keterangan Terpilih */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            currentStatus === 'H'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentStatus === 'S'
                              ? 'bg-sky-100 text-sky-800'
                              : currentStatus === 'I'
                              ? 'bg-amber-100 text-amber-800'
                              : currentStatus === 'A'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {activeConfig?.name || currentStatus}
                        </span>
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
  );
};
