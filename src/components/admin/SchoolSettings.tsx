import React, { useState } from 'react';
import {
  School,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { SettingsApp, User } from '../../types';
import { dataStorage, LMSDatabase } from '../../services/dataStorage';

interface SchoolSettingsProps {
  db: LMSDatabase;
  currentUser: User;
  onOpenSheets: () => void;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({ db, currentUser, onOpenSheets }) => {
  const [settings, setSettings] = useState<SettingsApp>(() => ({
    namaSekolah: 'SMAN 1 Olahraga Nusantara',
    tahunPelajaran: '2026/2027',
    semester: 'Ganjil',
    namaKepalaSekolah: 'Dr. Drs. I Nyoman Sukadana, M.Pd.',
    nipKepalaSekolah: '19690815 199412 1 002',
    namaGuruPJOKUtama: 'Haryono, S.Pd.Jas, M.Or.',
    nipGuruPJOKUtama: '19850314 201001 1 018',
    mataPelajaran: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    temaWarna: 'Biru & Hijau Sportif',
    terakhirSinkron: new Date().toISOString(),
    ...(db?.settings || {}),
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataStorage.updateDatabase((prev) => ({
      ...prev,
      settings,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Backup_LMS_PJOK_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.users && parsed.kelas) {
            dataStorage.updateDatabase(() => parsed);
            alert('Data LMS berhasil direstore secara lengkap!');
          } else {
            alert('Format file backup tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON backup.');
        }
      };
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset database kembali ke contoh data awal sekolah?')) {
      dataStorage.resetToDefault();
      alert('Data telah direset kembali ke konfigurasi awal.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Pengaturan Sistem & Profil Sekolah
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi identitas lembaga, tahun pelajaran, semester, sinkronisasi cloud, dan backup data
          </p>
        </div>

        <button
          onClick={onOpenSheets}
          className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Sinkronisasi Google Sheets
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Pengaturan sekolah berhasil disimpan dan diperbarui!
        </div>
      )}

      {/* Main Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <School className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            Identitas Sekolah & Akademik
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Nama Sekolah</label>
            <input
              type="text"
              required
              value={settings.namaSekolah}
              onChange={(e) => setSettings({ ...settings, namaSekolah: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Logo Sekolah (URL)
            </label>
            <input
              type="text"
              value={settings.logoSekolah || ''}
              onChange={(e) => setSettings({ ...settings, logoSekolah: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Tahun Pelajaran
            </label>
            <input
              type="text"
              required
              value={settings.tahunPelajaran}
              onChange={(e) => setSettings({ ...settings, tahunPelajaran: e.target.value })}
              placeholder="2026/2027"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Semester Aktif</label>
            <select
              value={settings.semesterAktif}
              onChange={(e) => setSettings({ ...settings, semesterAktif: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
              <option value="2 (Genap)">Semester 2 (Genap)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nama Kepala Sekolah
            </label>
            <input
              type="text"
              value={settings.kepalaSekolahNama || ''}
              onChange={(e) => setSettings({ ...settings, kepalaSekolahNama: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              NIP Kepala Sekolah
            </label>
            <input
              type="text"
              value={settings.kepalaSekolahNip || ''}
              onChange={(e) => setSettings({ ...settings, kepalaSekolahNip: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Guru Pengampu PJOK
            </label>
            <input
              type="text"
              value={settings.guruPjokNama || ''}
              onChange={(e) => setSettings({ ...settings, guruPjokNama: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">NIP Guru PJOK</label>
            <input
              type="text"
              value={settings.guruPjokNip || ''}
              onChange={(e) => setSettings({ ...settings, guruPjokNip: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan Sekolah
          </button>
        </div>
      </form>

      {/* Backup & Restore Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-sky-600" />
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
            Manajemen Data & Cadangan (Backup / Restore)
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Unduh salinan berkas data utuh (seluruh pengguna, rombel, materi, tugas, nilai, dan presensi)
          atau pulihkan dari berkas cadangan JSON sebelumnya.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleBackupData}
            className="p-3.5 bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Backup Database JSON
          </button>

          <label className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            Restore Database JSON
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreData}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetSampleData}
            className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data Default
          </button>
        </div>
      </div>
    </div>
  );
};
