import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  Play,
} from 'lucide-react';
import { Materi } from '../../types';
import { LMSDatabase } from '../../services/dataStorage';

interface MuridMateriProps {
  db: LMSDatabase;
  initialMateriId?: string;
}

export const MuridMateri: React.FC<MuridMateriProps> = ({ db, initialMateriId }) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMateri, setActiveMateri] = useState<Materi | null>(
    initialMateriId ? (db.materi || []).find((m) => m.id === initialMateriId) || null : null
  );

  const categories = [
    'Semua',
    'Sepak Bola',
    'Bola Voli',
    'Bola Basket',
    'Bulu Tangkis',
    'Senam Lantai',
    'Kebugaran Jasmani',
    'Pola Hidup Sehat',
  ];

  const filteredMateri = db.materi.filter((m) => {
    if (m.status !== 'Publish') return false;
    const matchCat =
      selectedKategori === 'Semua' ||
      m.kategori.toLowerCase().includes(selectedKategori.toLowerCase()) ||
      m.judul.toLowerCase().includes(selectedKategori.toLowerCase());
    const matchQuery =
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Materi Pembelajaran PJOK
          </h2>
          <p className="text-xs text-slate-500">
            Kumpulan modul ajar, video tutorial teknik gerak, dan bahan ajar Fase F
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi voli, senam, gizi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedKategori(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedKategori === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Materi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMateri.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold">
                  {m.kategori}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{m.dibuatPada}</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-800 leading-snug">{m.judul}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{m.deskripsi}</p>

              {m.tujuanPembelajaran && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                  <strong className="text-slate-700 block mb-0.5">Tujuan Pembelajaran:</strong>
                  <p className="line-clamp-2">{m.tujuanPembelajaran}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Guru: {(m.guruNama || m.dibuatOleh || 'Guru PJOK').split(',')[0]}
              </span>
              <button
                onClick={() => setActiveMateri(m)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" /> Pelajari Modul
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader / Player Modal */}
      {activeMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative my-8">
            <button
              onClick={() => setActiveMateri(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold">
              {activeMateri.kategori}
            </span>

            <h3 className="text-lg font-black text-slate-800 mt-2">{activeMateri.judul}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Disusun oleh: {activeMateri.guruNama || activeMateri.dibuatOleh || 'Guru PJOK'} • Kurikulum Merdeka PJOK Fase F
            </p>

            {/* Video tutorial embed or player banner */}
            {activeMateri.videoUrl && (
              <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Video Tutorial Peragaan Gerak</h4>
                    <p className="text-[10px] text-slate-300">Tonton teknik passing dan gerakan dasar resmi</p>
                  </div>
                </div>
                <a
                  href={activeMateri.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 shrink-0"
                >
                  Tonton di YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="mt-5 space-y-4 text-xs text-slate-700 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Uraian Materi & Konsep Gerak:
                </h4>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700">
                  {activeMateri.deskripsi}
                </p>
              </div>

              {activeMateri.tujuanPembelajaran && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Capaian & Tujuan Pembelajaran:
                  </h4>
                  <p className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 text-emerald-950">
                    {activeMateri.tujuanPembelajaran}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {activeMateri.fileUrl ? (
                <a
                  href={activeMateri.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Modul PPT / PDF
                </a>
              ) : (
                <span className="text-[11px] text-slate-400">Modul digital terintegrasi</span>
              )}

              <button
                onClick={() => setActiveMateri(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
