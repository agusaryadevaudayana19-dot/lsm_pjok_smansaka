import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Save,
  Search,
  Users,
  ChevronRight,
  Sparkles,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { PenilaianPraktik, RubrikPraktik, User } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface PraktikAssessmentProps {
  db: LMSDatabase;
  currentUser: User;
}

export const PraktikAssessment: React.FC<PraktikAssessmentProps> = ({ db, currentUser }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>('cls-xi-1');
  const [selectedMateriJudul, setSelectedMateriJudul] = useState<string>(
    'Permainan Bola Voli - Passing Bawah & Atas'
  );
  const [selectedMurid, setSelectedMurid] = useState<User | null>(null);

  // Rubric scores (1 to 4)
  const [rubrik, setRubrik] = useState<RubrikPraktik>({
    sikapAwal: 4,
    pelaksanaanTeknik: 3,
    sikapAkhir: 4,
    hasilGerakan: 3,
    sportivitas: 4,
    kerjaSama: 4,
  });

  const [catatan, setCatatan] = useState<string>(
    'Gerakan passing bawah sudah sangat baik, ayunan lengan harmonis dan perkenaan bola tepat di atas pergelangan tangan.'
  );

  const muridInKelas = db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);

  // Calculate practice score out of 100
  // Total points = 6 criteria * max 4 = 24 points
  const totalPoints =
    rubrik.sikapAwal +
    rubrik.pelaksanaanTeknik +
    rubrik.sikapAkhir +
    rubrik.hasilGerakan +
    rubrik.sportivitas +
    (rubrik.kerjaSama || 4);

  const nilaiAkhir = Math.round((totalPoints / 24) * 100);

  const getPredikat = (score: number) => {
    if (score >= 90) return 'A (Sangat Baik)';
    if (score >= 80) return 'B (Baik)';
    if (score >= 70) return 'C (Cukup)';
    return 'D (Kurang)';
  };

  const handleSelectMurid = (murid: User) => {
    setSelectedMurid(murid);
    // Check if an existing assessment exists for this student and topic
    const existing = db.penilaianPraktik.find(
      (p) => p.muridId === murid.id && p.materiJudul === selectedMateriJudul
    );
    if (existing) {
      setRubrik(existing.rubrik);
      setCatatan(existing.catatanEvaluasi);
    } else {
      setRubrik({
        sikapAwal: 3,
        pelaksanaanTeknik: 3,
        sikapAkhir: 3,
        hasilGerakan: 3,
        sportivitas: 4,
        kerjaSama: 4,
      });
      setCatatan('');
    }
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMurid) return;

    const newAssessment: PenilaianPraktik = {
      id: `prk-${selectedMurid.id}-${Date.now()}`,
      muridId: selectedMurid.id,
      muridNama: selectedMurid.name,
      kelasId: selectedKelasId,
      materiJudul: selectedMateriJudul,
      tanggal: new Date().toISOString().slice(0, 10),
      rubrik,
      nilaiTotal: nilaiAkhir,
      predikat: (getPredikat(nilaiAkhir) || 'B').split(' ')[0] as any,
      catatanEvaluasi: catatan,
      guruPenilai: currentUser.name,
    };

    dataStorage.updateDatabase((prev) => {
      // Remove previous assessment for same student and topic if exists
      const filtered = prev.penilaianPraktik.filter(
        (p) => !(p.muridId === selectedMurid.id && p.materiJudul === selectedMateriJudul)
      );

      // Also update or insert in rekap nilai murid
      const updatedNilai = prev.nilai.map((n) => {
        if (n.muridId === selectedMurid.id) {
          const newNilaiAkhir = Math.round((n.tugas + n.quiz + nilaiAkhir + n.sikap) / 4);
          return {
            ...n,
            praktik: nilaiAkhir,
            nilaiAkhir: newNilaiAkhir,
            predikat: (getPredikat(newNilaiAkhir) || 'B').split(' ')[0] as any,
          };
        }
        return n;
      });

      return {
        ...prev,
        penilaianPraktik: [newAssessment, ...filtered],
        nilai: updatedNilai,
      };
    });

    alert(`Penilaian praktik untuk ${selectedMurid.name} berhasil disimpan! Nilai: ${nilaiAkhir} (${getPredikat(nilaiAkhir)})`);
  };

  const criteriaList: { key: keyof RubrikPraktik; title: string; desc: string }[] = [
    {
      key: 'sikapAwal',
      title: '1. Sikap Awal (Persiapan)',
      desc: 'Posisi kaki dibuka selebar bahu, lutut ditekuk relaks, kedua lengan siap di depan badan.',
    },
    {
      key: 'pelaksanaanTeknik',
      title: '2. Pelaksanaan Teknik',
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
      desc: 'Arah pantulan bola akurat melambung stabil, tinggi bola memenuhi syarat operan.',
    },
    {
      key: 'sportivitas',
      title: '5. Sikap Sportivitas',
      desc: 'Menghargai instruksi pelatih/guru, mematuhi aturan bermain, dan menghormati lawan/kawan.',
    },
    {
      key: 'kerjaSama',
      title: '6. Kerja Sama Beregu',
      desc: 'Komunikasi aktif saat menerima bola, gotong royong mengamankan bola olahraga tim.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Penilaian Praktik PJOK (Rubrik 6 Aspek)
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
              Khusus PJOK
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Penilaian autentik gerak psikomotorik, sikap awal, pelaksanaan, hasil gerak, sportivitas, dan kerja sama
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedKelasId}
            onChange={(e) => {
              setSelectedKelasId(e.target.value);
              setSelectedMurid(null);
            }}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 shadow-2xs"
          >
            {db.kelas.map((k) => (
              <option key={k.id} value={k.id}>
                Kelas {k.nama}
              </option>
            ))}
          </select>

          <select
            value={selectedMateriJudul}
            onChange={(e) => setSelectedMateriJudul(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 shadow-2xs max-w-xs truncate"
          >
            <option value="Permainan Bola Voli - Passing Bawah & Atas">
              Bola Voli - Passing Bawah & Atas
            </option>
            <option value="Permainan Sepak Bola - Dribbling & Passing">
              Sepak Bola - Dribbling & Passing
            </option>
            <option value="Bulutangkis - Servis Pendek & Smash">
              Bulutangkis - Servis & Smash
            </option>
            <option value="Senam Lantai - Roll Depan & Belakang">
              Senam Lantai - Roll Depan & Belakang
            </option>
            <option value="Kebugaran Jasmani - Tes MFT & Push Up">
              Kebugaran Jasmani - MFT & Kekuatan
            </option>
          </select>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student List in the selected class */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Siswa ({muridInKelas.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Klik untuk menilai</span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
            {muridInKelas.map((murid) => {
              const hasAssessment = db.penilaianPraktik.find(
                (p) => p.muridId === murid.id && p.materiJudul === selectedMateriJudul
              );
              const isSelected = selectedMurid?.id === murid.id;
              return (
                <button
                  key={murid.id}
                  onClick={() => handleSelectMurid(murid)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        murid.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'
                      }
                      alt={murid.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <span className="font-bold block truncate">{murid.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">NIS: {murid.nis}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {hasAssessment ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded text-[10px]">
                        {hasAssessment.nilaiTotal}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Belum dinilai</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Assessment Form */}
        <div className="lg:col-span-2">
          {!selectedMurid ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Pilih Siswa dari Daftar di Sebelah Kiri
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pilih siswa untuk memasukkan penilaian rubrik 6 aspek (Sikap Awal, Pelaksanaan, Sikap Akhir, Hasil, Sportivitas, Kerja Sama).
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSaveAssessment}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in"
            >
              {/* Active Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMurid.avatar}
                    alt={selectedMurid.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">{selectedMurid.name}</h3>
                    <p className="text-xs text-slate-400">
                      NIS: {selectedMurid.nis} • Kelas {db.kelas.find((k) => k.id === selectedKelasId)?.nama}
                    </p>
                  </div>
                </div>

                {/* Live Score Display */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Skor Praktik
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {getPredikat(nilaiAkhir)}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
                    {nilaiAkhir}
                  </div>
                </div>
              </div>

              {/* Rubric Criteria 6 Rows */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rubrik Penilaian Skala 1 - 4 (Kurang, Cukup, Baik, Sangat Baik)
                </h4>

                {criteriaList.map((crit) => {
                  const currentValue = rubrik[crit.key] || 3;
                  return (
                    <div
                      key={crit.key}
                      className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800">{crit.title}</span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4].map((scale) => (
                            <button
                              key={scale}
                              type="button"
                              onClick={() => setRubrik({ ...rubrik, [crit.key]: scale })}
                              className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${
                                currentValue === scale
                                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {scale}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{crit.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Evaluasi Guru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Evaluasi / Rekomendasi Guru
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Berikan umpan balik positif atau koreksi spesifik untuk perkembangan motorik siswa..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  Simpan Penilaian Praktik
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
