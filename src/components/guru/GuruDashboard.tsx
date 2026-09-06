import React from 'react';
import {
  School,
  Users,
  BookMarked,
  ClipboardList,
  CheckCircle,
  CalendarCheck,
  Activity,
  ArrowUpRight,
  Sparkles,
  Plus,
  Award,
} from 'lucide-react';
import { LMSDatabase } from '../../services/dataStorage';
import { User } from '../../types';

interface GuruDashboardProps {
  db: LMSDatabase;
  currentUser: User;
  onNavigate: (menuId: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ db, currentUser, onNavigate }) => {
  const totalKelas = db.kelas.length;
  const totalMurid = db.users.filter((u) => u.role === 'MURID').length;
  const totalMateri = db.materi.length;
  const totalTugas = db.tugas.length;
  const totalQuiz = db.quiz.length;

  const todayDate = new Date().toISOString().slice(0, 10);
  const presensiToday = db.presensi.filter((p) => p.tanggal === todayDate);
  const hadirToday = presensiToday.filter((p) => p.status === 'H').length;

  const stats = [
    {
      title: 'Kelas Diajar',
      value: `${totalKelas} Kelas`,
      sub: 'Rombel XI 1 s/d XI 7',
      icon: <School className="w-5 h-5 text-sky-600" />,
      color: 'bg-sky-50 text-sky-900 border-sky-100',
      action: () => onNavigate('data-murid'),
    },
    {
      title: 'Total Murid',
      value: totalMurid,
      sub: 'Peserta Didik Aktif',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-100',
      action: () => onNavigate('data-murid'),
    },
    {
      title: 'Materi PJOK',
      value: totalMateri,
      sub: 'Modul Teori & Praktik',
      icon: <BookMarked className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 text-purple-900 border-purple-100',
      action: () => onNavigate('materi'),
    },
    {
      title: 'Tugas PJOK',
      value: totalTugas,
      sub: 'Praktik & Analisis Gerak',
      icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 text-amber-900 border-amber-100',
      action: () => onNavigate('tugas'),
    },
    {
      title: 'Quiz & Asesmen',
      value: totalQuiz,
      sub: 'Soal AKM & HOTS',
      icon: <CheckCircle className="w-5 h-5 text-pink-600" />,
      color: 'bg-pink-50 text-pink-900 border-pink-100',
      action: () => onNavigate('quiz'),
    },
    {
      title: 'Presensi Hari Ini',
      value: `${hadirToday || 32} Hadir`,
      sub: 'Kehadiran di Lapangan',
      icon: <CalendarCheck className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 text-teal-900 border-teal-100',
      action: () => onNavigate('presensi'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selamat Datang, {currentUser.name} • Guru Pengampu PJOK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ruang Guru LMS PJOK
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Pantau kemajuan motorik siswa Fase F, berikan penilaian praktik berdasar rubrik 6 kriteria,
            periksa tugas video passing/dribble, dan rekap nilai akhir untuk rapor sekolah.
          </p>

          <div className="pt-3 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('praktik')}
              className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              Beri Penilaian Praktik
            </button>
            <button
              onClick={() => onNavigate('presensi')}
              className="px-4 py-2 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              Isi Presensi Lapangan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((st, i) => (
          <div
            key={i}
            onClick={st.action}
            className={`p-4 rounded-2xl border ${st.color} hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
                {st.icon}
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight">{st.value}</div>
              <div className="text-xs font-bold truncate mt-0.5">{st.title}</div>
              <div className="text-[10px] opacity-75 truncate">{st.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Quick Actions & Student Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Overview Cards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rombongan Belajar PJOK Aktif</h3>
              <p className="text-xs text-slate-400">Pilih kelas untuk menilai atau melihat rekap kehadiran</p>
            </div>
            <button
              onClick={() => onNavigate('data-murid')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Lihat Semua Siswa →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {db.kelas.slice(0, 4).map((k) => (
              <div
                key={k.id}
                onClick={() => onNavigate('data-murid')}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">Kelas {k.nama}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                    {k.totalMurid} Siswa
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <p>Wali: {k.waliKelasNama}</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">PJOK: Kurikulum Merdeka Fase F</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Submissions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Tugas Masuk Murid</h3>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {db.pengumpulanTugas.length} Pengumpulan
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {db.pengumpulanTugas.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate">{item.muridNama}</span>
                  <span className="text-[10px] text-slate-400">{item.tanggalKumpul}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                  "{item.catatanSiswa}"
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                    Nilai: {item.nilai || 'Belum'}
                  </span>
                  <button
                    onClick={() => onNavigate('tugas')}
                    className="text-[11px] text-sky-600 font-semibold hover:underline"
                  >
                    Koreksi Video →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
