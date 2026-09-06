import React, { useState } from 'react';
import {
  BookMarked,
  ClipboardList,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  Video,
  Clock,
  Calendar,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
} from 'lucide-react';
import { Materi, Tugas, Quiz, UserRole, SoalQuiz } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface ContentManagerProps {
  db: LMSDatabase;
  role: UserRole;
  initialTab?: 'materi' | 'tugas' | 'quiz';
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  db,
  role,
  initialTab = 'materi',
}) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas' | 'quiz'>(initialTab);

  // Modals
  const [isMateriModalOpen, setIsMateriModalOpen] = useState(false);
  const [isTugasModalOpen, setIsTugasModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Editing targets
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);
  const [editingTugas, setEditingTugas] = useState<Tugas | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Form states
  const [materiForm, setMateriForm] = useState<Partial<Materi>>({
    judul: '',
    kategori: 'Permainan Bola Besar',
    deskripsi: '',
    tujuanPembelajaran: '',
    kelasIds: ['cls-xi-1', 'cls-xi-2', 'cls-xi-3', 'cls-xi-4', 'cls-xi-5', 'cls-xi-6', 'cls-xi-7'],
    videoUrl: '',
    fileUrl: '',
    status: 'Publish',
  });

  const [tugasForm, setTugasForm] = useState<Partial<Tugas>>({
    judul: '',
    kategori: 'Praktik Gerak',
    instruksi: '',
    deadline: '2026-09-30T23:59',
    kelasIds: ['cls-xi-1'],
    status: 'Publish',
    lampiranUrl: '',
  });

  const [quizForm, setQuizForm] = useState<Partial<Quiz>>({
    judul: '',
    durasiMenit: 30,
    acakSoal: true,
    tampilkanPembahasan: true,
    kelasIds: ['cls-xi-1'],
    soal: [
      {
        id: `q-1`,
        nomor: 1,
        pertanyaan: 'Bagaimanakah posisi kedua lengan yang benar saat melakukan passing bawah bola voli?',
        tipe: 'Pilihan Ganda',
        pilihan: [
          'Kedua tangan ditekuk pada siku',
          'Kedua lengan dirapatkan dan diluruskan ke depan bawah',
          'Kedua lengan dibuka selebar bahu',
          'Satu tangan di depan dan satu di belakang',
          'Lengan bebas mengayun tanpa dirapatkan',
        ],
        kunciJawaban: 'Kedua lengan dirapatkan dan diluruskan ke depan bawah',
        bobot: 20,
        pembahasan: 'Passing bawah dilakukan dengan merapatkan dan meluruskan kedua siku lengan.',
      },
    ],
  });

  // --- Materi CRUD ---
  const handleOpenAddMateri = () => {
    setEditingMateri(null);
    setMateriForm({
      judul: '',
      kategori: 'Permainan Bola Besar',
      deskripsi: '',
      tujuanPembelajaran: '',
      kelasIds: db.kelas.map((k) => k.id),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      fileUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vR-modul-pjok-fase-f/pub',
      status: 'Publish',
    });
    setIsMateriModalOpen(true);
  };

  const handleSaveMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiForm.judul) return;

    if (editingMateri) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: prev.materi.map((m) =>
          m.id === editingMateri.id ? ({ ...m, ...materiForm } as Materi) : m
        ),
      }));
    } else {
      const newM: Materi = {
        id: `mat-${Date.now()}`,
        judul: materiForm.judul || 'Materi Baru',
        kategori: materiForm.kategori || 'Permainan Bola Besar',
        deskripsi: materiForm.deskripsi || '',
        tujuanPembelajaran: materiForm.tujuanPembelajaran || '',
        konten: materiForm.deskripsi || '',
        guruId: 'usr-guru-1',
        guruNama: 'Haryono, S.Pd.Jas',
        kelasIds: materiForm.kelasIds || ['cls-xi-1'],
        fileUrl: materiForm.fileUrl,
        videoUrl: materiForm.videoUrl,
        status: (materiForm.status as any) || 'Publish',
        dibuatPada: '2026-09-05',
      };
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: [newM, ...prev.materi],
      }));
    }
    setIsMateriModalOpen(false);
  };

  const handleDeleteMateri = (id: string, judul: string) => {
    if (window.confirm(`Hapus materi "${judul}"?`)) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        materi: prev.materi.filter((m) => m.id !== id),
      }));
    }
  };

  // --- Tugas CRUD ---
  const handleOpenAddTugas = () => {
    setEditingTugas(null);
    setTugasForm({
      judul: '',
      kategori: 'Praktik Gerak',
      instruksi: '',
      deadline: '2026-09-30T23:59',
      kelasIds: ['cls-xi-1'],
      status: 'Publish',
    });
    setIsTugasModalOpen(true);
  };

  const handleSaveTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tugasForm.judul) return;

    if (editingTugas) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        tugas: prev.tugas.map((t) =>
          t.id === editingTugas.id ? ({ ...t, ...tugasForm } as Tugas) : t
        ),
      }));
    } else {
      const newT: Tugas = {
        id: `tgs-${Date.now()}`,
        judul: tugasForm.judul || 'Tugas Baru',
        kategori: (tugasForm.kategori as any) || 'Praktik Gerak',
        instruksi: tugasForm.instruksi || '',
        deadline: tugasForm.deadline || '2026-09-30',
        guruId: 'usr-guru-1',
        guruNama: 'Haryono, S.Pd.Jas',
        kelasIds: tugasForm.kelasIds || ['cls-xi-1'],
        status: (tugasForm.status as any) || 'Publish',
        dibuatPada: '2026-09-05',
      };
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        tugas: [newT, ...prev.tugas],
      }));
    }
    setIsTugasModalOpen(false);
  };

  const handleDeleteTugas = (id: string, judul: string) => {
    if (window.confirm(`Hapus tugas "${judul}"?`)) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        tugas: prev.tugas.filter((t) => t.id !== id),
      }));
    }
  };

  // --- Quiz CRUD ---
  const handleOpenAddQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      judul: 'Quiz Asesmen Olahraga',
      durasiMenit: 30,
      acakSoal: true,
      tampilkanPembahasan: true,
      kelasIds: ['cls-xi-1'],
      soal: [
        {
          id: `soal-${Date.now()}-1`,
          nomor: 1,
          pertanyaan: 'Sebutkan teknik dasar dalam bola voli!',
          tipe: 'Pilihan Ganda',
          pilihan: ['Passing, Servis, Smash, Block', 'Dribble, Shooting', 'Layup, Slam Dunk', 'Heading, Throw in'],
          kunciJawaban: 'Passing, Servis, Smash, Block',
          bobot: 50,
          pembahasan: 'Empat teknik dasar bola voli adalah servis, passing, smash, dan blocking.',
        },
      ],
    });
    setIsQuizModalOpen(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.judul) return;

    if (editingQuiz) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        quiz: prev.quiz.map((q) =>
          q.id === editingQuiz.id ? ({ ...q, ...quizForm } as Quiz) : q
        ),
      }));
    } else {
      const newQ: Quiz = {
        id: `qz-${Date.now()}`,
        judul: quizForm.judul || 'Quiz Baru',
        materiId: 'mat-1',
        guruId: 'usr-guru-1',
        guruNama: 'Haryono, S.Pd.Jas',
        kelasIds: quizForm.kelasIds || ['cls-xi-1'],
        durasiMenit: Number(quizForm.durasiMenit) || 30,
        mulai: '2026-09-01T08:00',
        selesai: '2026-09-30T23:59',
        acakSoal: Boolean(quizForm.acakSoal),
        tampilkanPembahasan: Boolean(quizForm.tampilkanPembahasan),
        soal: quizForm.soal || [],
      };
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        quiz: [newQ, ...prev.quiz],
      }));
    }
    setIsQuizModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {role === 'ADMIN' ? 'Manajemen Konten Pembelajaran PJOK' : 'Pusat Pembelajaran PJOK'}
          </h2>
          <p className="text-xs text-slate-500">
            Kelola modul modul ajar, tugas gerak & teori, serta bank soal quiz HOTS / AKM
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'materi' && (
            <button
              onClick={handleOpenAddMateri}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Materi Baru
            </button>
          )}
          {activeTab === 'tugas' && (
            <button
              onClick={handleOpenAddTugas}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:from-sky-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Buat Tugas Baru
            </button>
          )}
          {activeTab === 'quiz' && (
            <button
              onClick={handleOpenAddQuiz}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4" />
              Buat Quiz / Soal
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('materi')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'materi'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          Materi Modul Ajar ({db.materi.length})
        </button>
        <button
          onClick={() => setActiveTab('tugas')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'tugas'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Tugas PJOK ({db.tugas.length})
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'quiz'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Bank Quiz & Soal ({db.quiz.length})
        </button>
      </div>

      {/* MATERI TAB */}
      {activeTab === 'materi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.materi.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                      {m.kategori}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Publish'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingMateri(m);
                        setMateriForm(m);
                        setIsMateriModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Edit Materi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMateri(m.id, m.judul)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Materi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 mt-2 leading-snug">{m.judul}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{m.deskripsi}</p>

                {m.tujuanPembelajaran && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-700 block">Tujuan Pembelajaran:</span>
                    <p className="mt-0.5 line-clamp-2">{m.tujuanPembelajaran}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">Oleh: {(m.guruNama || m.dibuatOleh || 'Guru PJOK').split(',')[0]}</span>
                <div className="flex items-center gap-2">
                  {m.videoUrl && (
                    <a
                      href={m.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" /> Video
                    </a>
                  )}
                  {m.fileUrl && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-sky-600 hover:bg-sky-50 rounded flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> Modul
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TUGAS TAB */}
      {activeTab === 'tugas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.tugas.map((t) => {
            const pengumpulan = db.pengumpulanTugas.filter((p) => p.tugasId === t.id);
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[10px] font-bold">
                        {t.kategori}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Deadline: {new Date(t.deadline).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTugas(t);
                          setTugasForm(t);
                          setIsTugasModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTugas(t.id, t.judul)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-800 mt-2">{t.judul}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                    {t.instruksi}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Pengumpulan: <span className="text-emerald-700 font-bold">{pengumpulan.length} Siswa</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Guru: {(t.guruNama || t.dibuatOleh || 'Guru PJOK').split(',')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.quiz.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold">
                      {(q.soal?.length || q.soalList?.length || 0)} Butir Soal AKM / HOTS
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> {q.durasiMenit} Menit
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingQuiz(q);
                        setQuizForm(q);
                        setIsQuizModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus quiz "${q.judul}"?`)) {
                          dataStorage.updateDatabase((prev) => ({
                            ...prev,
                            quiz: prev.quiz.filter((item) => item.id !== q.id),
                          }));
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-800 mt-2">{q.judul}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {(q.soal || q.soalList || []).map((s, idx) => (
                    <div
                      key={s.id}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2"
                    >
                      <span className="font-bold text-purple-700 shrink-0">#{idx + 1}</span>
                      <p className="line-clamp-1 font-medium text-[11px]">{s.pertanyaan}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Pengampu: {(q.guruNama || q.dibuatOleh || 'Guru PJOK').split(',')[0]}</span>
                <span className="text-emerald-700 font-semibold text-[11px]">
                  {q.tampilkanPembahasan ? 'Pembahasan Tersedia' : 'Tanpa Pembahasan'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Materi Modal */}
      {isMateriModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsMateriModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-4">
              {editingMateri ? 'Edit Materi PJOK' : 'Tambah Modul Ajar PJOK Baru'}
            </h3>

            <form onSubmit={handleSaveMateri} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Judul Materi PJOK
                </label>
                <input
                  type="text"
                  required
                  value={materiForm.judul || ''}
                  onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                  placeholder="Contoh: Permainan Bola Voli - Teknik Passing Bawah dan Atas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Kategori Materi
                  </label>
                  <select
                    value={materiForm.kategori || 'Permainan Bola Besar'}
                    onChange={(e) => setMateriForm({ ...materiForm, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Permainan Bola Besar">Permainan Bola Besar</option>
                    <option value="Permainan Bola Kecil">Permainan Bola Kecil</option>
                    <option value="Atletik">Atletik</option>
                    <option value="Senam Lantai & Kebugaran Jasmani">Senam & Kebugaran</option>
                    <option value="Aktivitas Air">Aktivitas Air</option>
                    <option value="Pola Hidup Sehat & Gizi Seimbang">Pola Hidup Sehat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={materiForm.status || 'Publish'}
                    onChange={(e) => setMateriForm({ ...materiForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Publish">Publish</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={materiForm.deskripsi || ''}
                  onChange={(e) => setMateriForm({ ...materiForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Penjelasan ringkas materi dan gerak spesifik..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <textarea
                  rows={2}
                  value={materiForm.tujuanPembelajaran || ''}
                  onChange={(e) =>
                    setMateriForm({ ...materiForm, tujuanPembelajaran: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Peserta didik mampu mempraktikkan dan menganalisis..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Link Video (YouTube/Drive)
                  </label>
                  <input
                    type="text"
                    value={materiForm.videoUrl || ''}
                    onChange={(e) => setMateriForm({ ...materiForm, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Link Modul (PDF/Drive)
                  </label>
                  <input
                    type="text"
                    value={materiForm.fileUrl || ''}
                    onChange={(e) => setMateriForm({ ...materiForm, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMateriModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tugas Modal */}
      {isTugasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsTugasModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-4">
              {editingTugas ? 'Edit Tugas PJOK' : 'Buat Tugas PJOK Baru'}
            </h3>

            <form onSubmit={handleSaveTugas} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={tugasForm.judul || ''}
                  onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
                  placeholder="Praktik Passing Bawah Bola Voli 20 Kali Berpasangan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jenis Tugas
                  </label>
                  <select
                    value={tugasForm.kategori || 'Praktik Gerak'}
                    onChange={(e) => setTugasForm({ ...tugasForm, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Praktik Gerak">Praktik Gerak (Video)</option>
                    <option value="Teori">Teori</option>
                    <option value="Analisis Gerak">Analisis Gerak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Batas Waktu (Deadline)
                  </label>
                  <input
                    type="date"
                    value={tugasForm.deadline?.slice(0, 10) || ''}
                    onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Instruksi Penugasan
                </label>
                <textarea
                  rows={3}
                  required
                  value={tugasForm.instruksi || ''}
                  onChange={(e) => setTugasForm({ ...tugasForm, instruksi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Rekam video gerakan passing bawah durasi 1 menit, perhatikan posisi lutut dan ayunan lengan..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTugasModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-4">
              {editingQuiz ? 'Edit Quiz & Soal' : 'Buat Quiz / Asesmen PJOK Baru'}
            </h3>

            <form onSubmit={handleSaveQuiz} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Judul Quiz</label>
                <input
                  type="text"
                  required
                  value={quizForm.judul || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, judul: e.target.value })}
                  placeholder="Asesmen Formatif Bola Voli - Fase F"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    value={quizForm.durasiMenit || 30}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, durasiMenit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Acak Soal & Opsi
                  </label>
                  <select
                    value={quizForm.acakSoal ? 'ya' : 'tidak'}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, acakSoal: e.target.value === 'ya' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="ya">Ya (Acak)</option>
                    <option value="tidak">Tidak (Urut)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-900 block mb-1">
                  Butir Soal ({quizForm.soal?.length || 0})
                </span>
                <p className="text-[11px] text-purple-700 leading-tight">
                  Tipe soal pilihan ganda AKM/HOTS dengan kunci jawaban otomatis dan pembahasan.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
