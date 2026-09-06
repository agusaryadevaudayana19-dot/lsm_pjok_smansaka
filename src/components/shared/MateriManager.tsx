import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  Video,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Layers,
  Sparkles,
  School,
} from 'lucide-react';
import { Materi, User } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface MateriManagerProps {
  db: LMSDatabase;
  currentUser: User;
}

export const MateriManager: React.FC<MateriManagerProps> = ({ db, currentUser }) => {
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedKelasId, setSelectedKelasId] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<Materi>>({
    judul: '',
    kategori: 'Permainan Bola Besar',
    deskripsi: '',
    tujuanPembelajaran: '',
    kelasIds: db.kelas.map((k) => k.id),
    videoUrl: '',
    fileUrl: '',
    status: 'Publish',
  });

  const categories = [
    'Semua',
    'Permainan Bola Besar',
    'Permainan Bola Kecil',
    'Atletik',
    'Aktivitas Kebugaran',
    'Senam & Ritmik',
    'Pola Hidup Sehat & P3K',
  ];

  const filteredMateri = db.materi.filter((m) => {
    const matchCat =
      selectedKategori === 'Semua' ||
      m.kategori.toLowerCase().includes(selectedKategori.toLowerCase()) ||
      m.judul.toLowerCase().includes(selectedKategori.toLowerCase());

    const matchQuery =
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tujuanPembelajaran && m.tujuanPembelajaran.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchKelas =
      selectedKelasId === 'Semua' ||
      !m.kelasIds ||
      m.kelasIds.length === 0 ||
      m.kelasIds.includes(selectedKelasId);

    return matchCat && matchQuery && matchKelas;
  });

  const handleOpenAdd = () => {
    setEditingMateri(null);
    setForm({
      judul: '',
      kategori: 'Permainan Bola Besar',
      deskripsi: '',
      tujuanPembelajaran: '',
      kelasIds: db.kelas.map((k) => k.id),
      videoUrl: '',
      fileUrl: '',
      status: 'Publish',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Materi) => {
    setEditingMateri(m);
    setForm({
      ...m,
      kelasIds: m.kelasIds || (m.kelasId ? [m.kelasId] : db.kelas.map((k) => k.id)),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul?.trim()) {
      alert('Judul materi harus diisi');
      return;
    }

    if (editingMateri) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: prev.materi.map((m) =>
          m.id === editingMateri.id
            ? ({
                ...m,
                ...form,
                dibuatPada: m.dibuatPada || new Date().toISOString().slice(0, 10),
              } as Materi)
            : m
        ),
      }));
    } else {
      const newM: Materi = {
        id: `mat-${Date.now()}`,
        judul: form.judul || 'Materi Baru',
        kategori: form.kategori || 'Permainan Bola Besar',
        deskripsi: form.deskripsi || '',
        tujuanPembelajaran: form.tujuanPembelajaran || '',
        kelasIds: form.kelasIds && form.kelasIds.length > 0 ? form.kelasIds : db.kelas.map((k) => k.id),
        status: form.status || 'Publish',
        videoUrl: form.videoUrl || '',
        fileUrl: form.fileUrl || '',
        dibuatOleh: currentUser.name,
        guruNama: currentUser.name,
        dibuatPada: new Date().toISOString().slice(0, 10),
      };
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: [newM, ...prev.materi],
      }));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, judul: string) => {
    if (window.confirm(`Yakin ingin menghapus materi "${judul}"?`)) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: prev.materi.filter((m) => m.id !== id),
      }));
    }
  };

  // Helper for embeddable YouTube links
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const totalPublish = db.materi.filter((m) => m.status === 'Publish').length;
  const totalDraft = db.materi.filter((m) => m.status === 'Draft' || m.status === 'Arsip').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-emerald-200">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Modul Ajar & Bahan Belajar PJOK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Konten & Materi PJOK
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Pusat penyimpanan modul ajar Fase F, video peraga teknik gerak cabang olahraga, dan referensi teori kebugaran jasmani.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            Tambah Materi Baru
          </button>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 font-medium">Total Modul</p>
            <p className="text-xl font-black mt-0.5">{db.materi.length}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 font-medium">Terpublikasi</p>
            <p className="text-xl font-black mt-0.5">{totalPublish}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 font-medium">Draft / Revisi</p>
            <p className="text-xl font-black mt-0.5">{totalDraft}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 font-medium">Kelas Terjangkau</p>
            <p className="text-xl font-black mt-0.5">{db.kelas.length} Rombel</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi, teknik gerak, IKTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" /> Filter Kelas:
            </span>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Semua">Semua Rombel</option>
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedKategori(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedKategori === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materi Cards Grid */}
      {filteredMateri.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <BookMarked className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">Tidak ada materi ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ganti kata kunci pencarian atau buat materi ajar PJOK baru untuk kelas yang dipilih.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Materi Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMateri.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-[10px] font-extrabold">
                      {m.kategori}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        m.status === 'Publish'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {m.status || 'Publish'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Materi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.judul)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Materi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-800 leading-snug">
                    {m.judul}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {m.deskripsi}
                  </p>
                </div>

                {/* Target Classes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Target Rombel:</span>
                  {m.kelasIds && m.kelasIds.length > 0 ? (
                    m.kelasIds.slice(0, 3).map((cid) => {
                      const k = (db.kelas || []).find((kls) => kls.id === cid);
                      return (
                        <span
                          key={cid}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold"
                        >
                          {k?.nama || cid}
                        </span>
                      );
                    })
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                      Semua Kelas
                    </span>
                  )}
                  {m.kelasIds && m.kelasIds.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{m.kelasIds.length - 3} lagi</span>
                  )}
                </div>

                {/* Tujuan Pembelajaran / IKTP */}
                {m.tujuanPembelajaran && (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-700">
                    <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wider mb-1">
                      Tujuan Pembelajaran (IKTP)
                    </span>
                    <p className="leading-relaxed line-clamp-2">{m.tujuanPembelajaran}</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions & Author */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">
                  Pengampu: <strong className="text-slate-700">{m.guruNama || m.dibuatOleh || currentUser.name}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {m.videoUrl && (
                    <button
                      onClick={() => setPreviewVideoUrl(m.videoUrl || null)}
                      className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors"
                    >
                      <Play className="w-3 h-3 fill-rose-600" />
                      Video Gerak
                    </button>
                  )}

                  {m.fileUrl && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1 font-bold text-[11px] transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Modul PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Preview */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <Video className="w-4 h-4 text-rose-600" />
                <span>Video Tutorial Gerak PJOK</span>
              </div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center">
              {previewVideoUrl.includes('youtube.com') || previewVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(previewVideoUrl)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Pembelajaran PJOK"
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <Play className="w-12 h-12 text-white/50 mx-auto" />
                  <p className="text-white text-xs">Video eksternal:</p>
                  <a
                    href={previewVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    Buka Video di Tab Baru <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Materi Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-full">
                {editingMateri ? 'Perbarui Modul' : 'Modul Ajar Baru'}
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {editingMateri ? 'Edit Materi PJOK' : 'Tambah Modul Ajar PJOK Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Lengkapi informasi modul ajar untuk panduan belajar peserta didik Fase F.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Materi PJOK *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Teknik Dasar & Variasi Passing Bawah Bola Voli"
                  value={form.judul || ''}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Olahraga</label>
                  <select
                    value={form.kategori || 'Permainan Bola Besar'}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Permainan Bola Besar">Permainan Bola Besar</option>
                    <option value="Permainan Bola Kecil">Permainan Bola Kecil</option>
                    <option value="Atletik">Atletik</option>
                    <option value="Aktivitas Kebugaran">Aktivitas Kebugaran</option>
                    <option value="Senam & Ritmik">Senam & Ritmik</option>
                    <option value="Pola Hidup Sehat & P3K">Pola Hidup Sehat & P3K</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Publikasi</label>
                  <select
                    value={form.status || 'Publish'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Publish">Publish (Bisa Diakses Murid)</option>
                    <option value="Draft">Draft (Hanya Guru/Admin)</option>
                  </select>
                </div>
              </div>

              {/* Target Kelas Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Target Kelas / Rombel</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                  {db.kelas.map((k) => {
                    const isChecked = form.kelasIds?.includes(k.id) ?? false;
                    return (
                      <label key={k.id} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = form.kelasIds || [];
                            if (e.target.checked) {
                              setForm({ ...form, kelasIds: [...cur, k.id] });
                            } else {
                              setForm({ ...form, kelasIds: cur.filter((id) => id !== k.id) });
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-700">{k.nama}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas & Pengantar</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas tentang materi ajar..."
                  value={form.deskripsi || ''}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tujuan Pembelajaran / IKTP (Fase F)
                </label>
                <textarea
                  rows={2}
                  placeholder="Peserta didik mampu mempraktikkan dan menganalisis koordinasi gerak..."
                  value={form.tujuanPembelajaran || ''}
                  onChange={(e) => setForm({ ...form, tujuanPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link Video Peraga (YouTube / Drive)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl || ''}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link Modul / PDF (Google Drive / URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/..."
                    value={form.fileUrl || ''}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {editingMateri ? 'Simpan Perubahan' : 'Terbitkan Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
