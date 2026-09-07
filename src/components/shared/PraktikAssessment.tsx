import React, { useState, useMemo } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Save,
  Search,
  Users,
  Sparkles,
  CheckSquare,
  Square,
  Filter,
  UserCheck,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { PenilaianPraktik, RubrikPraktik, User } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface PraktikAssessmentProps {
  db: LMSDatabase;
  currentUser: User;
}

const RUBRIC_CRITERIA: { key: keyof RubrikPraktik; title: string; desc: string }[] = [
  {
    key: 'sikapAwal',
    title: '1. Sikap Awal (Persiapan)',
    desc: 'Posisi kaki dibuka selebar bahu, lutut ditekuk rileks, kedua lengan siap di depan badan.',
  },
  {
    key: 'pelaksanaanTeknik',
    title: '2. Pelaksanaan Teknik Gerakan',
    desc: 'Gerakan ayunan lengan lurus rapat, perkenaan bola pas di atas pergelangan tangan, dorongan lutut.',
  },
  {
    key: 'sikapAkhir',
    title: '3. Sikap Akhir (Follow Through)',
    desc: 'Keseimbangan tubuh terjaga, pandangan mengikuti arah bola, kembali ke posisi siap siaga.',
  },
  {
    key: 'hasilGerakan',
    title: '4. Kualitas & Hasil Gerakan',
    desc: 'Arah pantulan bola akurat melambung stabil, tinggi bola memenuhi syarat operan permainan.',
  },
  {
    key: 'sportivitas',
    title: '5. Sikap Sportivitas & Etika',
    desc: 'Menghargai instruksi pelatih/guru, mematuhi aturan bermain, dan menghormati lawan/kawan.',
  },
  {
    key: 'kerjaSama',
    title: '6. Kerja Sama Beregu & Komunikasi',
    desc: 'Komunikasi aktif saat menerima bola, gotong royong mengamankan bola olahraga tim.',
  },
];

const SKALA_LABELS: Record<number, { label: string; desc: string; color: string; activeColor: string }> = {
  1: {
    label: 'Kurang',
    desc: 'Belum memenuhi teknik dasar',
    color: 'border-rose-200 text-rose-700 hover:bg-rose-50',
    activeColor: 'bg-rose-600 text-white border-rose-600 shadow-xs',
  },
  2: {
    label: 'Cukup',
    desc: 'Cukup menguasai sebagian gerakan',
    color: 'border-amber-200 text-amber-700 hover:bg-amber-50',
    activeColor: 'bg-amber-500 text-white border-amber-500 shadow-xs',
  },
  3: {
    label: 'Baik',
    desc: 'Menguasai teknik dengan tepat',
    color: 'border-sky-200 text-sky-700 hover:bg-sky-50',
    activeColor: 'bg-sky-600 text-white border-sky-600 shadow-xs',
  },
  4: {
    label: 'Sangat Baik',
    desc: 'Sempurna dan konsisten',
    color: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
  },
};

export const PraktikAssessment: React.FC<PraktikAssessmentProps> = ({ db, currentUser }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    db.kelas.length > 0 ? db.kelas[0].id : 'cls-xi-1'
  );
  const [selectedMateriJudul, setSelectedMateriJudul] = useState<string>(
    'Permainan Bola Voli - Passing Bawah & Atas'
  );
  const [searchMurid, setSearchMurid] = useState<string>('');

  // Selected student IDs (allows picking multiple students from the class)
  const [selectedMuridIds, setSelectedMuridIds] = useState<string[]>([]);

  // Active student in the inspector/editor view
  const [activeMuridId, setActiveMuridId] = useState<string | null>(null);

  // Local state for rubrics per student id: { [muridId]: { rubrik, catatan } }
  const [muridAssessments, setMuridAssessments] = useState<
    Record<string, { rubrik: RubrikPraktik; catatan: string }>
  >({});

  // Filtered students in selected class
  const muridInKelas = useMemo(() => {
    return db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);
  }, [db.users, selectedKelasId]);

  const searchedMurid = useMemo(() => {
    if (!searchMurid.trim()) return muridInKelas;
    const q = searchMurid.toLowerCase();
    return muridInKelas.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.nis && m.nis.includes(q))
    );
  }, [muridInKelas, searchMurid]);

  // Initial load / sync from existing assessments
  const getMuridData = (muridId: string) => {
    if (muridAssessments[muridId]) {
      return muridAssessments[muridId];
    }
    const existing = (db.penilaianPraktik || []).find(
      (p) =>
        p.muridId === muridId &&
        (p.materiJudul === selectedMateriJudul || p.materi === selectedMateriJudul)
    );
    if (existing) {
      const existingRubrik: RubrikPraktik = existing.rubrik
        ? {
            sikapAwal: existing.rubrik.sikapAwal ?? 3,
            pelaksanaanTeknik: existing.rubrik.pelaksanaanTeknik ?? 3,
            sikapAkhir: existing.rubrik.sikapAkhir ?? 3,
            hasilGerakan: existing.rubrik.hasilGerakan ?? 3,
            sportivitas: existing.rubrik.sportivitas ?? 4,
            kerjaSama: existing.rubrik.kerjaSama ?? 4,
          }
        : {
            sikapAwal: existing.aspekNilai?.sikapAwal ?? 3,
            pelaksanaanTeknik: existing.aspekNilai?.teknikGerakan ?? 3,
            sikapAkhir: existing.aspekNilai?.koordinasi ?? 3,
            hasilGerakan: existing.aspekNilai?.ketepatan ?? 3,
            sportivitas: existing.aspekNilai?.sportivitas ?? 4,
            kerjaSama: existing.aspekNilai?.kerjaSama ?? 4,
          };
      return {
        rubrik: existingRubrik,
        catatan: existing.catatanEvaluasi || existing.catatanGuru || '',
      };
    }
    return {
      rubrik: {
        sikapAwal: 3,
        pelaksanaanTeknik: 3,
        sikapAkhir: 3,
        hasilGerakan: 3,
        sportivitas: 4,
        kerjaSama: 4,
      },
      catatan: 'Penguasaan teknik gerakan sudah cukup baik, perlu peningkatan konsistensi.',
    };
  };

  const calculateScore = (rubrik: RubrikPraktik) => {
    const totalPoints =
      (rubrik?.sikapAwal ?? 3) +
      (rubrik?.pelaksanaanTeknik ?? 3) +
      (rubrik?.sikapAkhir ?? 3) +
      (rubrik?.hasilGerakan ?? 3) +
      (rubrik?.sportivitas ?? 4) +
      (rubrik?.kerjaSama ?? 4);
    // Total 6 criteria * max 4 = 24 points
    return Math.round((totalPoints / 24) * 100);
  };

  const getPredikat = (score: number) => {
    if (score >= 90) return 'A (Sangat Baik)';
    if (score >= 80) return 'B (Baik)';
    if (score >= 70) return 'C (Cukup)';
    return 'D (Kurang)';
  };

  // Toggle selection for a student
  const toggleSelectMurid = (id: string) => {
    setSelectedMuridIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
    if (!activeMuridId || !selectedMuridIds.includes(id)) {
      setActiveMuridId(id);
    }
  };

  const selectAllStudents = () => {
    setSelectedMuridIds(muridInKelas.map((m) => m.id));
    if (muridInKelas.length > 0 && !activeMuridId) {
      setActiveMuridId(muridInKelas[0].id);
    }
  };

  const clearSelection = () => {
    setSelectedMuridIds([]);
  };

  const selectSmallGroup = (groupSize: number = 4) => {
    const unassessed = muridInKelas.filter((m) => {
      return !(db.penilaianPraktik || []).some(
        (p) => p.muridId === m.id && (p.materiJudul === selectedMateriJudul || p.materi === selectedMateriJudul)
      );
    });
    const targetPool = unassessed.length >= groupSize ? unassessed : muridInKelas;
    const slice = targetPool.slice(0, groupSize).map((m) => m.id);
    setSelectedMuridIds(slice);
    if (slice.length > 0) setActiveMuridId(slice[0]);
  };

  // Change a criteria score for a student
  const handleScoreChange = (muridId: string, key: keyof RubrikPraktik, value: number) => {
    const current = getMuridData(muridId);
    setMuridAssessments((prev) => ({
      ...prev,
      [muridId]: {
        ...current,
        rubrik: {
          ...current.rubrik,
          [key]: value,
        },
      },
    }));
  };

  const handleCatatanChange = (muridId: string, catatan: string) => {
    const current = getMuridData(muridId);
    setMuridAssessments((prev) => ({
      ...prev,
      [muridId]: {
        ...current,
        catatan,
      },
    }));
  };

  // Apply a uniform rubric to all selected students
  const applyRubrikToAllSelected = (sourceRubrik: RubrikPraktik) => {
    if (selectedMuridIds.length === 0) {
      alert('Pilih beberapa murid terlebih dahulu untuk menerapkan rubrik bersamaan.');
      return;
    }
    const updated = { ...muridAssessments };
    selectedMuridIds.forEach((id) => {
      const current = getMuridData(id);
      updated[id] = {
        ...current,
        rubrik: { ...sourceRubrik },
      };
    });
    setMuridAssessments(updated);
    alert(`Berhasil menerapkan nilai rubrik ke ${selectedMuridIds.length} murid terpilih!`);
  };

  // Save assessment for a single student or all selected
  const handleSaveStudents = (targetIds: string[]) => {
    if (targetIds.length === 0) {
      alert('Silakan pilih minimal satu murid untuk disimpan penilaiannya.');
      return;
    }

    const currentKelas = (db.kelas || []).find((k) => k.id === selectedKelasId);
    const kelasNama = currentKelas?.nama || selectedKelasId;

    const newAssessments: PenilaianPraktik[] = [];

    targetIds.forEach((muridId) => {
      const muridObj = db.users.find((u) => u.id === muridId);
      if (!muridObj) return;

      const assessmentData = getMuridData(muridId);
      const score = calculateScore(assessmentData.rubrik);
      const predikatStr = getPredikat(score);
      const totalPoints =
        (assessmentData.rubrik?.sikapAwal ?? 3) +
        (assessmentData.rubrik?.pelaksanaanTeknik ?? 3) +
        (assessmentData.rubrik?.sikapAkhir ?? 3) +
        (assessmentData.rubrik?.hasilGerakan ?? 3) +
        (assessmentData.rubrik?.sportivitas ?? 4) +
        (assessmentData.rubrik?.kerjaSama ?? 4);

      newAssessments.push({
        id: `prk-${muridId}-${Date.now()}`,
        muridId: muridId,
        muridNama: muridObj.name,
        kelasId: selectedKelasId,
        kelasNama: kelasNama,
        materiJudul: selectedMateriJudul,
        materi: selectedMateriJudul,
        tanggal: new Date().toISOString().slice(0, 10),
        rubrik: assessmentData.rubrik,
        aspekNilai: {
          sikapAwal: assessmentData.rubrik.sikapAwal as any,
          teknikGerakan: assessmentData.rubrik.pelaksanaanTeknik as any,
          ketepatan: assessmentData.rubrik.hasilGerakan as any,
          koordinasi: assessmentData.rubrik.sikapAkhir as any,
          sportivitas: assessmentData.rubrik.sportivitas as any,
          kerjaSama: assessmentData.rubrik.kerjaSama as any,
        },
        totalSkor: totalPoints,
        nilaiTotal: score,
        nilaiAkhir: score,
        predikat: predikatStr.split(' ')[0] as any,
        catatanEvaluasi: assessmentData.catatan,
        catatanGuru: assessmentData.catatan,
        guruPenilai: currentUser.name,
        guruNama: currentUser.name,
      });
    });

    dataStorage.updateDatabase((prev) => {
      // Remove previous assessments for same students & topic
      const filtered = prev.penilaianPraktik.filter(
        (p) =>
          !(
            targetIds.includes(p.muridId) &&
            (p.materiJudul === selectedMateriJudul || p.materi === selectedMateriJudul)
          )
      );

      // Update rekap nilai murid
      const updatedNilai = prev.nilai.map((n) => {
        if (targetIds.includes(n.muridId)) {
          const ass = newAssessments.find((a) => a.muridId === n.muridId);
          if (ass) {
            const newNilaiAkhir = Math.round((n.tugas + n.quiz + ass.nilaiAkhir + n.sikap) / 4);
            return {
              ...n,
              praktik: ass.nilaiAkhir,
              nilaiAkhir: newNilaiAkhir,
              predikat: (getPredikat(newNilaiAkhir) || 'B').split(' ')[0] as any,
            };
          }
        }
        return n;
      });

      return {
        ...prev,
        penilaianPraktik: [...newAssessments, ...filtered],
        nilai: updatedNilai,
      };
    });

    alert(
      `Berhasil menyimpan penilaian praktik untuk ${newAssessments.length} murid pada materi: ${selectedMateriJudul}!`
    );
  };

  const activeMurid = db.users.find((u) => u.id === activeMuridId);
  const activeMuridAssessment = activeMuridId ? getMuridData(activeMuridId) : null;
  const activeScore = activeMuridAssessment ? calculateScore(activeMuridAssessment.rubrik) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-teal-200">
              <Activity className="w-3.5 h-3.5" />
              <span>Instrumen Penilaian Autentik Psikomotorik PJOK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Penilaian Praktik & Rubrik Skala 1 - 4
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Pilih kelas untuk menampilkan seluruh murid, pilih beberapa murid per kelompok atau sekaligus, lalu nilai berdasarkan Rubrik Skala 1 - 4 (Kurang, Cukup, Baik, Sangat Baik) per nama.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {selectedMuridIds.length > 0 && (
              <button
                onClick={() => handleSaveStudents(selectedMuridIds)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan {selectedMuridIds.length} Siswa Terpilih
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/15">
          <div>
            <label className="text-[11px] font-bold text-teal-200 block mb-1">
              Pilih Kelas Siswa
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => {
                setSelectedKelasId(e.target.value);
                setSelectedMuridIds([]);
                setActiveMuridId(null);
              }}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:bg-slate-900"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id} className="bg-slate-900 text-white">
                  Kelas {k.nama} ({k.jurusan || 'PJOK'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-teal-200 block mb-1">
              Materi Pembelajaran / Cabang Olahraga
            </label>
            <select
              value={selectedMateriJudul}
              onChange={(e) => setSelectedMateriJudul(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:bg-slate-900 truncate"
            >
              <option value="Permainan Bola Voli - Passing Bawah & Atas" className="bg-slate-900 text-white">
                Bola Voli - Passing Bawah & Atas
              </option>
              <option value="Permainan Sepak Bola - Dribbling & Passing" className="bg-slate-900 text-white">
                Sepak Bola - Dribbling & Passing
              </option>
              <option value="Bulutangkis - Servis Pendek & Smash" className="bg-slate-900 text-white">
                Bulutangkis - Servis & Smash
              </option>
              <option value="Senam Lantai - Roll Depan & Belakang" className="bg-slate-900 text-white">
                Senam Lantai - Roll Depan & Belakang
              </option>
              <option value="Kebugaran Jasmani - Tes MFT & Push Up" className="bg-slate-900 text-white">
                Kebugaran Jasmani - MFT & Kekuatan
              </option>
              <option value="Atletik - Lari Cepat & Estafet" className="bg-slate-900 text-white">
                Atletik - Lari Cepat & Estafet
              </option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-teal-200 block mb-1">
              Cari Nama Murid / NIS
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-teal-300" />
              <input
                type="text"
                placeholder="Ketik nama siswa..."
                value={searchMurid}
                onChange={(e) => setSearchMurid(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 text-white placeholder:text-teal-200/60 rounded-xl text-xs focus:outline-hidden focus:bg-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Student Selector (Left) & Rubric per Student (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All Students in Class & Multi-Selection Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            {/* Action Buttons for Selection */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 flex-wrap">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Daftar Semua Murid ({muridInKelas.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Terpilih: <strong className="text-emerald-700 font-bold">{selectedMuridIds.length}</strong> murid
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[11px] transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={() => selectSmallGroup(4)}
                  className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold rounded-lg text-[11px] transition-colors"
                >
                  Kelompok (4)
                </button>
                {selectedMuridIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-2 py-1 text-slate-400 hover:text-rose-600 font-medium rounded-lg text-[11px] transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>

            {/* Student List with Checkboxes */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {searchedMurid.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ditemukan murid di kelas ini.
                </div>
              ) : (
                searchedMurid.map((murid, idx) => {
                  const isChecked = selectedMuridIds.includes(murid.id);
                  const isActive = activeMuridId === murid.id;
                  const assessmentData = getMuridData(murid.id);
                  const existing = (db.penilaianPraktik || []).find(
                    (p) =>
                      p.muridId === murid.id &&
                      (p.materiJudul === selectedMateriJudul || p.materi === selectedMateriJudul)
                  );
                  const liveScore = calculateScore(assessmentData.rubrik);

                  return (
                    <div
                      key={murid.id}
                      onClick={() => setActiveMuridId(murid.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : isChecked
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox & Avatar & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectMurid(murid.id);
                          }}
                          className="text-slate-400 hover:text-emerald-600 focus:outline-hidden"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <img
                          src={
                            murid.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${murid.name}`
                          }
                          alt={murid.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 truncate block">
                              {idx + 1}. {murid.name}
                            </span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-black text-[9px] rounded-full uppercase">
                                Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            NIS: {murid.nis || '-'} • {murid.gender || 'Siswa'}
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="shrink-0 text-right">
                        <div
                          className={`px-2.5 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1 ${
                            liveScore >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : liveScore >= 80
                              ? 'bg-sky-100 text-sky-800'
                              : liveScore >= 70
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span>{liveScore}</span>
                          <span className="text-[10px] font-bold">
                            {liveScore >= 90 ? 'SB' : liveScore >= 80 ? 'B' : liveScore >= 70 ? 'C' : 'K'}
                          </span>
                        </div>
                        {existing && (
                          <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">
                            Tersimpan
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rubric 1 - 4 per Selected/Active Student */}
        <div className="lg:col-span-7 space-y-4">
          {!activeMurid ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                Pilih Murid untuk Membuka Lembar Rubrik
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Klik salah satu nama murid di panel kiri atau centang beberapa murid untuk melakukan penilaian kelompok. Rubrik skala 1 - 4 akan tampil per nama.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              {/* Header Active Student */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      activeMurid.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeMurid.name}`
                    }
                    alt={activeMurid.name}
                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{activeMurid.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md">
                        NIS: {activeMurid.nis || '-'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Materi: <strong className="text-slate-700">{selectedMateriJudul}</strong>
                    </p>
                  </div>
                </div>

                {/* Score and Predicate */}
                <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-emerald-50/50 p-3 px-4 rounded-2xl border border-emerald-100 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Nilai Praktik
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {getPredikat(activeScore)}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono">
                    {activeScore}
                  </div>
                </div>
              </div>

              {/* Rubric Skala 1 - 4 Guide Legend */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Panduan Skala Penilaian Rubrik (1 s.d 4):
                  </span>
                  {selectedMuridIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        activeMuridAssessment &&
                        applyRubrikToAllSelected(activeMuridAssessment.rubrik)
                      }
                      className="text-[11px] text-teal-700 font-extrabold hover:underline"
                    >
                      Terapkan Rubrik Ini ke {selectedMuridIds.length} Murid Terpilih
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((skala) => {
                    const info = SKALA_LABELS[skala];
                    return (
                      <div
                        key={skala}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-center space-y-0.5"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center">
                            {skala}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {info.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{info.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Aspek Rubrik Criteria with 1-4 per name */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Rubrik Penilaian Aspek Gerak & Karakter (Per Nama Murid)
                </h4>

                {RUBRIC_CRITERIA.map((crit) => {
                  const currentValue = activeMuridAssessment?.rubrik[crit.key] || 3;

                  return (
                    <div
                      key={crit.key}
                      className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block">
                            {crit.title}
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                            {crit.desc}
                          </p>
                        </div>
                      </div>

                      {/* 1 - 4 Scale Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {[1, 2, 3, 4].map((scale) => {
                          const info = SKALA_LABELS[scale];
                          const isSelected = currentValue === scale;

                          return (
                            <button
                              key={scale}
                              type="button"
                              onClick={() => handleScoreChange(activeMurid.id, crit.key, scale)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 text-center ${
                                isSelected ? info.activeColor : `bg-white ${info.color}`
                              }`}
                            >
                              <span className="text-sm font-black">{scale}</span>
                              <span className="text-[10px] font-semibold">{info.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Evaluasi Guru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Evaluasi / Koreksi Guru untuk {activeMurid.name}
                </label>
                <textarea
                  rows={2}
                  value={activeMuridAssessment?.catatan || ''}
                  onChange={(e) => handleCatatanChange(activeMurid.id, e.target.value)}
                  placeholder="Catatan gerak siswa, saran perbaikan posisi tubuh, dsb..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions: Save single student or save all selected */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                <div className="text-xs text-slate-500 font-medium">
                  {selectedMuridIds.length > 1 && (
                    <span>
                      Ada <strong className="text-emerald-700">{selectedMuridIds.length}</strong> murid terpilih
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveStudents([activeMurid.id])}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Nilai {activeMurid.name}
                  </button>

                  {selectedMuridIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSaveStudents(selectedMuridIds)}
                      className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan Semua {selectedMuridIds.length} Murid
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
