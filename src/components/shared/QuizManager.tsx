import React, { useState } from 'react';
import {
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  Search,
  School,
  X,
  Eye,
  HelpCircle,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Quiz, Soal, JawabanQuiz, User } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface QuizManagerProps {
  db: LMSDatabase;
  currentUser: User;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ db, currentUser }) => {
  const [selectedTab, setSelectedTab] = useState<'quiz' | 'hasil'>('quiz');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('Semua');
  const [selectedKelasId, setSelectedKelasId] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & detail view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [activeJawabanDetail, setActiveJawabanDetail] = useState<JawabanQuiz | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<Quiz>>({
    judul: '',
    materiJudul: 'Teknik Dasar & Taktik Permainan Bola Voli',
    durasiMenit: 20,
    acakSoal: true,
    acakJawaban: true,
    tampilkanPembahasan: true,
    kelasIds: db.kelas.map((k) => k.id),
    soal: [
      {
        id: `soal-1`,
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
        pembahasan: 'Lengan harus lurus dan rapat agar pantulan bola stabil dan terkontrol.',
        bobot: 25,
      } as any,
      {
        id: `soal-2`,
        nomor: 2,
        pertanyaan: 'Pemain yang bertugas sebagai pengatur serangan dan pengumpan utama dalam bola voli disebut...',
        tipe: 'Pilihan Ganda',
        pilihan: ['Libero', 'Tosser / Setter', 'Spiker', 'Blocker', 'Server'],
        kunciJawaban: 'Tosser / Setter',
        pembahasan: 'Tosser / Setter bertugas mengumpan bola kepada spiker untuk dieksekusi.',
        bobot: 25,
      } as any,
    ],
  });

  // Calculate stats
  const totalQuiz = db.quiz.length;
  const totalJawaban = db.jawabanQuiz.length;
  const totalSoalCount = db.quiz.reduce(
    (acc, q) => acc + (q.soal?.length || q.soalList?.length || 0),
    0
  );
  const avgScore =
    totalJawaban > 0
      ? Math.round(db.jawabanQuiz.reduce((acc, j) => acc + (j.nilai || 0), 0) / totalJawaban)
      : 85;

  // Filter quizzes
  const filteredQuiz = db.quiz.filter((q) => {
    const matchQuery =
      q.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.materiJudul && q.materiJudul.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchKelas =
      selectedKelasId === 'Semua' ||
      !q.kelasIds ||
      q.kelasIds.length === 0 ||
      q.kelasIds.includes(selectedKelasId);

    return matchQuery && matchKelas;
  });

  // Filter student quiz attempts
  const filteredHasil = db.jawabanQuiz.filter((j) => {
    const matchQuiz = selectedQuizId === 'Semua' || j.quizId === selectedQuizId;
    const matchKelas = selectedKelasId === 'Semua' || j.kelasId === selectedKelasId;
    const matchSearch =
      j.muridNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.quizJudul.toLowerCase().includes(searchQuery.toLowerCase());

    return matchQuiz && matchKelas && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingQuiz(null);
    setForm({
      judul: '',
      materiJudul: db.materi[0]?.judul || 'Materi PJOK',
      durasiMenit: 20,
      acakSoal: true,
      acakJawaban: true,
      tampilkanPembahasan: true,
      kelasIds: db.kelas.map((k) => k.id),
      soal: [
        {
          id: `soal-${Date.now()}`,
          nomor: 1,
          pertanyaan: '',
          tipe: 'Pilihan Ganda',
          pilihan: ['', '', '', ''],
          kunciJawaban: '',
          pembahasan: '',
          bobot: 20,
        } as any,
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setEditingQuiz(q);
    const existingQuestions =
      Array.isArray(q.soal) && q.soal.length > 0
        ? q.soal
        : Array.isArray(q.soalList) && q.soalList.length > 0
        ? q.soalList
        : [];

    setForm({
      ...q,
      kelasIds: q.kelasIds || (q.kelasId ? [q.kelasId] : db.kelas.map((k) => k.id)),
      soal: existingQuestions,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul?.trim()) {
      alert('Judul quiz harus diisi');
      return;
    }

    const currentQuestions = (form.soal || []).map((s, idx) => ({
      ...s,
      nomor: idx + 1,
      bobot: s.bobot || Math.round(100 / (form.soal?.length || 1)),
    }));

    if (editingQuiz) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        quiz: prev.quiz.map((item) =>
          item.id === editingQuiz.id
            ? ({
                ...item,
                ...form,
                soal: currentQuestions,
                soalList: currentQuestions,
              } as Quiz)
            : item
        ),
      }));
    } else {
      const newQ: Quiz = {
        id: `qz-${Date.now()}`,
        judul: form.judul || 'Quiz Baru',
        materiJudul: form.materiJudul || 'Materi PJOK',
        durasiMenit: Number(form.durasiMenit) || 20,
        acakSoal: Boolean(form.acakSoal),
        acakJawaban: Boolean(form.acakJawaban),
        tampilkanPembahasan: Boolean(form.tampilkanPembahasan),
        kelasIds: form.kelasIds && form.kelasIds.length > 0 ? form.kelasIds : db.kelas.map((k) => k.id),
        status: 'Publish',
        dibuatOleh: currentUser.name,
        guruNama: currentUser.name,
        soal: currentQuestions,
        soalList: currentQuestions,
      };
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        quiz: [newQ, ...prev.quiz],
      }));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, judul: string) => {
    if (window.confirm(`Yakin ingin menghapus quiz "${judul}"?`)) {
      dataStorage.updateDatabase((prev) => ({
        ...prev,
        quiz: prev.quiz.filter((item) => item.id !== id),
        jawabanQuiz: prev.jawabanQuiz.filter((j) => j.quizId !== id),
      }));
    }
  };

  // Helpers for question editor inside modal
  const handleAddQuestion = () => {
    const newQuestions = [
      ...(form.soal || []),
      {
        id: `soal-${Date.now()}`,
        nomor: (form.soal?.length || 0) + 1,
        pertanyaan: '',
        tipe: 'Pilihan Ganda' as const,
        pilihan: ['', '', '', ''],
        kunciJawaban: '',
        pembahasan: '',
        bobot: 20,
      } as any,
    ];
    setForm({ ...form, soal: newQuestions });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = (form.soal || []).filter((_, idx) => idx !== index);
    setForm({ ...form, soal: newQuestions });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...(form.soal || [])];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setForm({ ...form, soal: newQuestions });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...(form.soal || [])];
    const newOptions = [...newQuestions[qIndex].pilihan];
    newOptions[optIndex] = value;
    newQuestions[qIndex].pilihan = newOptions;
    setForm({ ...form, soal: newQuestions });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-purple-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Asesmen Formatif & Sumatif AKM / HOTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bank Soal & Quiz PJOK
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Kelola butir soal pengetahuan olahraga, waktu pengerjaan otomatis, acak soal & opsi, serta tinjau hasil rekap nilai siswa.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="self-start sm:self-auto px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            Buat Quiz Baru
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-purple-200 font-medium">Paket Quiz</p>
            <p className="text-xl font-black mt-0.5">{totalQuiz}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-purple-200 font-medium">Total Butir Soal</p>
            <p className="text-xl font-black mt-0.5">{totalSoalCount} Butir</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-purple-200 font-medium">Siswa Selesai</p>
            <p className="text-xl font-black mt-0.5">{totalJawaban}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 font-medium">Rata-rata Skor</p>
            <p className="text-xl font-black mt-0.5 text-emerald-300">{avgScore}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === 'quiz'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Daftar Paket Quiz ({totalQuiz})
          </button>
          <button
            onClick={() => setSelectedTab('hasil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === 'hasil'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Hasil & Nilai Siswa ({totalJawaban})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari quiz / murid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
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

      {/* TAB 1: DAFTAR PAKET QUIZ */}
      {selectedTab === 'quiz' && (
        <div className="space-y-4">
          {filteredQuiz.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
              <CheckCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-sm">Tidak ada paket quiz</h3>
              <p className="text-xs text-slate-500">
                Belum ada paket soal quiz yang dibuat untuk rombel ini.
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Buat Quiz Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuiz.map((q) => {
                const questionList = q.soal || q.soalList || [];
                const attempts = db.jawabanQuiz.filter((j) => j.quizId === q.id);

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-extrabold">
                            {questionList.length} Butir Soal
                          </span>
                          <span className="text-[10px] text-slate-600 flex items-center gap-1 font-semibold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {q.durasiMenit || 20} Menit
                          </span>
                          {q.tampilkanPembahasan && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                              Pembahasan Aktif
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Quiz"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id, q.judul)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Quiz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-800 leading-snug">
                          {q.judul}
                        </h3>
                        {q.materiJudul && (
                          <p className="text-xs text-purple-700 font-semibold mt-1">
                            Materi: {q.materiJudul}
                          </p>
                        )}
                      </div>

                      {/* Question Preview Box */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Contoh Butir Soal:
                        </span>
                        {questionList.slice(0, 2).map((soal, sIdx) => (
                          <div
                            key={soal.id || sIdx}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2"
                          >
                            <span className="font-bold text-purple-700 shrink-0 text-[11px]">
                              #{sIdx + 1}
                            </span>
                            <p className="line-clamp-2 leading-relaxed text-[11px] font-medium">
                              {soal.pertanyaan}
                            </p>
                          </div>
                        ))}
                        {questionList.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            +{questionList.length - 2} soal lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Dikerjakan oleh: <strong className="text-slate-800">{attempts.length} Siswa</strong>
                      </span>

                      <button
                        onClick={() => {
                          setSelectedQuizId(q.id);
                          setSelectedTab('hasil');
                        }}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Lihat Nilai Siswa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAP HASIL & NILAI SISWA */}
      {selectedTab === 'hasil' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Pilih Paket Quiz:</span>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Semua">Semua Paket Quiz</option>
                {db.quiz.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.judul}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{filteredHasil.length}</strong> hasil pengerjaan
            </div>
          </div>

          {filteredHasil.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-sm">Belum ada hasil quiz</h3>
              <p className="text-xs text-slate-500">
                Siswa belum mengerjakan paket quiz yang dipilih.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                    <tr>
                      <th className="p-3.5 pl-5">Nama Siswa</th>
                      <th className="p-3.5">Paket Quiz</th>
                      <th className="p-3.5">Waktu Selesai</th>
                      <th className="p-3.5 text-center">Akurasi</th>
                      <th className="p-3.5 text-center">Skor Akhir</th>
                      <th className="p-3.5 pr-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHasil.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-5 font-bold text-slate-800">
                          {item.muridNama}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Kelas XI 1
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium max-w-xs truncate">
                          {item.quizJudul}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {item.tanggalMengerjakan}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                            {item.jumlahBenar} Benar • {item.jumlahSalah} Salah
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-3 py-1 rounded-xl font-black text-xs ${
                              item.nilai >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.nilai >= 75
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.nilai}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => setActiveJawabanDetail(item)}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors"
                          >
                            Detail Jawaban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Jawaban Siswa Modal */}
      {activeJawabanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 space-y-4">
            <button
              onClick={() => setActiveJawabanDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 font-bold text-[10px] rounded-full">
                Lembar Jawaban Siswa
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {activeJawabanDetail.muridNama}
              </h3>
              <p className="text-xs text-slate-500">
                {activeJawabanDetail.quizJudul} • Nilai: <strong className="text-emerald-700 font-black">{activeJawabanDetail.nilai}</strong>
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {Object.entries(activeJawabanDetail.jawabanMurid || {}).map(([soalId, ans], idx) => (
                <div key={soalId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800 text-[11px]">Soal #{idx + 1}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Tercatat
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    Jawaban Siswa: <strong className="text-slate-900">{ans}</strong>
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveJawabanDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 font-bold text-[10px] rounded-full">
                {editingQuiz ? 'Edit Paket Quiz' : 'Paket Quiz Baru'}
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {editingQuiz ? 'Edit Bank Soal Quiz' : 'Buat Paket Quiz PJOK Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Atur durasi, butir soal, kunci jawaban, dan pembahasan untuk penilaian siswa.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Paket Quiz *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Quiz Pengetahuan Aturan & Analisis Taktik Bola Voli"
                  value={form.judul || ''}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materi Terkait</label>
                  <input
                    type="text"
                    placeholder="Nama materi/bab terkait..."
                    value={form.materiJudul || ''}
                    onChange={(e) => setForm({ ...form, materiJudul: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi Pengerjaan (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    value={form.durasiMenit || 20}
                    onChange={(e) => setForm({ ...form, durasiMenit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.acakSoal ?? true}
                    onChange={(e) => setForm({ ...form, acakSoal: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Acak Urutan Soal Siswa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.tampilkanPembahasan ?? true}
                    onChange={(e) => setForm({ ...form, tampilkanPembahasan: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Tampilkan Kunci & Pembahasan Setelah Selesai</span>
                </label>
              </div>

              {/* Soal List Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">
                    Daftar Butir Soal ({(form.soal || []).length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Soal
                  </button>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {(form.soal || []).map((s, qIdx) => (
                    <div
                      key={s.id || qIdx}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-purple-800 text-xs">
                          Soal Nomor #{qIdx + 1}
                        </span>
                        {(form.soal?.length || 0) > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        required
                        placeholder="Tuliskan pertanyaan soal..."
                        value={s.pertanyaan}
                        onChange={(e) => handleQuestionChange(qIdx, 'pertanyaan', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                      />

                      {/* Options */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500">Pilihan Jawaban:</span>
                        {s.pilihan.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-5 text-center font-bold text-slate-400 text-[11px]">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <input
                              type="text"
                              required
                              placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuestionChange(qIdx, 'kunciJawaban', opt)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-colors ${
                                s.kunciJawaban === opt && opt !== ''
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {s.kunciJawaban === opt && opt !== '' ? 'Kunci Jawaban' : 'Pilih sbg Kunci'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Kunci Jawaban Terpilih *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Pilih tombol di atas atau ketik kunci jawaban..."
                          value={s.kunciJawaban}
                          onChange={(e) => handleQuestionChange(qIdx, 'kunciJawaban', e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-emerald-800"
                        />
                      </div>
                    </div>
                  ))}
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
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-sm"
                >
                  {editingQuiz ? 'Simpan Perubahan' : 'Terbitkan Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
