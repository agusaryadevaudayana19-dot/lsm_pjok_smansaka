import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  Award,
  BookCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, NilaiItem } from '../../types';
import { LMSDatabase } from '../../services/dataStorage';

interface GradesReportProps {
  db: LMSDatabase;
  currentUser: User;
  onOpenSheets: () => void;
}

export const GradesReport: React.FC<GradesReportProps> = ({ db, currentUser, onOpenSheets }) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>('cls-xi-1');
  const [selectedSemester, setSelectedSemester] = useState<string>('1 (Ganjil)');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const muridInKelas = db.users.filter((u) => u.role === 'MURID' && u.kelasId === selectedKelasId);

  // Match grades
  const gradesRows = muridInKelas.map((murid) => {
    const existing = db.nilai.find((n) => n.muridId === murid.id);
    if (existing) {
      return { murid, nilai: existing };
    }
    // Default preview calculation
    const defTugas = 85;
    const defQuiz = 80;
    const defPraktik = 88;
    const defSikap = 90;
    const defAkhir = Math.round((defTugas + defQuiz + defPraktik + defSikap) / 4);

    const fallbackNilai: NilaiItem = {
      id: `nil-${murid.id}`,
      muridId: murid.id,
      muridNama: murid.name,
      kelasId: selectedKelasId,
      semester: selectedSemester,
      tugas: defTugas,
      quiz: defQuiz,
      praktik: defPraktik,
      pengetahuan: Math.round((defTugas + defQuiz) / 2),
      keterampilan: defPraktik,
      sikap: defSikap,
      nilaiAkhir: defAkhir,
      predikat: defAkhir >= 90 ? 'A' : defAkhir >= 80 ? 'B' : 'C',
    };
    return { murid, nilai: fallbackNilai };
  });

  const filteredRows = gradesRows.filter((r) =>
    r.murid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.murid.nis && r.murid.nis.includes(searchQuery))
  );

  const selectedKelasObj = db.kelas.find((k) => k.id === selectedKelasId);

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Tugas',
      'Quiz',
      'Praktik',
      'Pengetahuan',
      'Keterampilan',
      'Sikap',
      'Nilai Akhir',
      'Predikat',
    ];
    const rows = filteredRows.map((r, i) => [
      i + 1,
      r.murid.nis || '',
      `"${r.murid.name}"`,
      selectedKelasObj?.nama || '',
      r.nilai.tugas,
      r.nilai.quiz,
      r.nilai.praktik,
      r.nilai.pengetahuan,
      r.nilai.keterampilan,
      r.nilai.sikap,
      r.nilai.nilaiAkhir,
      r.nilai.predikat,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Nilai_PJOK_${selectedKelasObj?.nama || 'Kelas'}_${(db.settings?.tahunPelajaran || '2026/2027').replace(/\//g, '-')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Rekap Leger Nilai PJOK
          </h2>
          <p className="text-xs text-slate-500">
            Nilai capaian kompetensi tugas, quiz, praktik psikomotorik, pengetahuan, keterampilan, sikap, dan nilai akhir
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'ADMIN' && onOpenSheets && (
            <button
              onClick={onOpenSheets}
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Google Sheets
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Leger
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Rombongan Belajar
            </span>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  Kelas {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Semester
            </span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            >
              <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
              <option value="2 (Genap)">Semester 2 (Genap)</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama murid atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Leger Nilai Printable Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Print Header only visible on print */}
        <div className="hidden print:block p-6 text-center border-b border-slate-300">
          <h1 className="text-xl font-black uppercase tracking-wider">
            {db.settings?.namaSekolah || 'SMAN 1 Olahraga Nusantara'}
          </h1>
          <h2 className="text-sm font-bold mt-0.5">LEGER REKAPITULASI NILAI AKHIR MATA PELAJARAN PJOK</h2>
          <p className="text-xs text-slate-600 mt-1">
            Kelas: {selectedKelasObj?.nama} • Semester: {selectedSemester} • Tahun Pelajaran:{' '}
            {db.settings?.tahunPelajaran || '2026/2027'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3">NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3 text-center">Tugas</th>
                <th className="py-3 px-3 text-center">Quiz</th>
                <th className="py-3 px-3 text-center">Praktik</th>
                <th className="py-3 px-3 text-center">Pengetahuan</th>
                <th className="py-3 px-3 text-center">Keterampilan</th>
                <th className="py-3 px-3 text-center">Sikap</th>
                <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-800">Nilai Akhir</th>
                <th className="py-3 px-3 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRows.map((row, idx) => (
                <tr key={row.murid.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{row.murid.nis}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 truncate max-w-[180px]">
                    {row.murid.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">{row.nilai.tugas}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">{row.nilai.quiz}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-sky-700">
                    {row.nilai.praktik}
                  </td>
                  <td className="py-2.5 px-3 text-center">{row.nilai.pengetahuan}</td>
                  <td className="py-2.5 px-3 text-center">{row.nilai.keterampilan}</td>
                  <td className="py-2.5 px-3 text-center">{row.nilai.sikap}</td>
                  <td className="py-2.5 px-3 text-center font-black text-sm text-emerald-700 bg-emerald-50/50">
                    {row.nilai.nilaiAkhir}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        row.nilai.predikat === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.nilai.predikat === 'B'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {row.nilai.predikat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Print Signatures Block */}
        <div className="hidden print:grid grid-cols-2 p-8 text-xs text-center mt-6">
          <div className="space-y-16">
            <p>Mengetahui,<br />Kepala {db.settings?.namaSekolah || 'SMAN 1 Olahraga Nusantara'}</p>
            <p className="font-bold underline">
              {db.settings?.kepalaSekolahNama || db.settings?.namaKepalaSekolah || 'Dr. Drs. I Nyoman Sukadana, M.Pd.'}
              <br />
              <span className="font-normal text-[10px]">
                NIP: {db.settings?.kepalaSekolahNip || db.settings?.nipKepalaSekolah || '19690815 199412 1 002'}
              </span>
            </p>
          </div>
          <div className="space-y-16">
            <p>Kota Olahraga, 5 September 2026<br />Guru Mata Pelajaran PJOK</p>
            <p className="font-bold underline">
              {db.settings?.guruPjokNama || db.settings?.namaGuruPJOKUtama || 'Haryono, S.Pd.Jas, M.Or.'}
              <br />
              <span className="font-normal text-[10px]">
                NIP: {db.settings?.guruPjokNip || db.settings?.nipGuruPJOKUtama || '19850314 201001 1 018'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
