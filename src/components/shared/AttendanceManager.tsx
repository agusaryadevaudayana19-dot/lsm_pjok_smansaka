import React, { useState } from 'react';
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
} from 'lucide-react';
import { PresensiRecord, StatusPresensi, User, UserRole } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface AttendanceManagerProps {
  db: LMSDatabase;
  role: UserRole;
  currentUser: User;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ db, role, currentUser }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>('cls-xi-1');
  const [selectedTanggal, setSelectedTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const muridInKelas = db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);

  // Local attendance map for selected date & class
  const getInitialStatus = (): Record<string, StatusPresensi> => {
    const map: Record<string, StatusPresensi> = {};
    muridInKelas.forEach((m) => {
      const existing = db.presensi.find(
        (p) => p.muridId === m.id && p.tanggal === selectedTanggal
      );
      map[m.id] = existing ? existing.status : 'H';
    });
    return map;
  };

  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusPresensi>>(
    getInitialStatus()
  );

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

    alert(`Presensi Kelas ${db.kelas.find((k) => k.id === selectedKelasId)?.nama} tanggal ${selectedTanggal} berhasil disimpan!`);
  };

  // Stats calculation
  const total = muridInKelas.length || 1;
  const countH = Object.values(attendanceMap).filter((s) => s === 'H').length;
  const countS = Object.values(attendanceMap).filter((s) => s === 'S').length;
  const countI = Object.values(attendanceMap).filter((s) => s === 'I').length;
  const countA = Object.values(attendanceMap).filter((s) => s === 'A').length;
  const countT = Object.values(attendanceMap).filter((s) => s === 'T').length;
  const persentase = Math.round(((countH + countT) / total) * 100);

  const statusButtons: { label: string; key: StatusPresensi; color: string; activeColor: string }[] = [
    { label: 'H (Hadir)', key: 'H', color: 'text-emerald-700 bg-emerald-50', activeColor: 'bg-emerald-600 text-white' },
    { label: 'S (Sakit)', key: 'S', color: 'text-sky-700 bg-sky-50', activeColor: 'bg-sky-600 text-white' },
    { label: 'I (Izin)', key: 'I', color: 'text-amber-700 bg-amber-50', activeColor: 'bg-amber-600 text-white' },
    { label: 'A (Alpa)', key: 'A', color: 'text-rose-700 bg-rose-50', activeColor: 'bg-rose-600 text-white' },
    { label: 'T (Terlambat)', key: 'T', color: 'text-purple-700 bg-purple-50', activeColor: 'bg-purple-600 text-white' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Presensi & Kehadiran PJOK
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan status kehadiran murid (H, S, I, A, T) dan rekapitulasi persentase otomatis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSetAllHadir}
            className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            Set Semua Hadir (H)
          </button>
          <button
            type="button"
            onClick={handleSavePresensi}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            Simpan Presensi
          </button>
        </div>
      </div>

      {/* Filter Row & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filter Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  Kelas {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tanggal Pembelajaran
            </label>
            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
            </input>
          </div>
        </div>

        {/* Attendance Summary Stat */}
        <div className="md:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rekapitulasi Kehadiran Hari Ini
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tingkat Kehadiran: {persentase}%
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 my-3 text-center">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-lg font-black text-emerald-700">{countH}</span>
              <p className="text-[10px] font-bold text-emerald-900 mt-0.5">Hadir (H)</p>
            </div>
            <div className="p-2 bg-sky-50 rounded-xl border border-sky-100">
              <span className="text-lg font-black text-sky-700">{countS}</span>
              <p className="text-[10px] font-bold text-sky-900 mt-0.5">Sakit (S)</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-lg font-black text-amber-700">{countI}</span>
              <p className="text-[10px] font-bold text-amber-900 mt-0.5">Izin (I)</p>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-lg font-black text-rose-700">{countA}</span>
              <p className="text-[10px] font-bold text-rose-900 mt-0.5">Alpa (A)</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-lg font-black text-purple-700">{countT}</span>
              <p className="text-[10px] font-bold text-purple-900 mt-0.5">Terlambat (T)</p>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${persentase}%` }}
            />
          </div>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">JK</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {muridInKelas.map((murid, idx) => {
                const currentStatus = attendanceMap[murid.id] || 'H';
                return (
                  <tr key={murid.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            murid.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'
                          }
                          alt={murid.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-800">{murid.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{murid.nis || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {murid.jenisKelamin || 'L'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        {(['H', 'S', 'I', 'A', 'T'] as StatusPresensi[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleChangeStatus(murid.id, st)}
                            className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                              currentStatus === st
                                ? st === 'H'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'S'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : st === 'I'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : st === 'A'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
