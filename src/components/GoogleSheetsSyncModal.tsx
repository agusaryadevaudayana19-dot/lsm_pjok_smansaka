import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { getGoogleAccessToken, signInWithGoogle, googleSignOut } from '../services/firebaseAuth';
import { createPJOKSpreadsheet, syncAllDataToSpreadsheet, REQUIRED_SHEETS } from '../services/sheetsService';
import { dataStorage } from '../services/dataStorage';
import { PengaturanSekolah } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: PengaturanSekolah;
  db?: any;
  onDbUpdate?: (newDb: any) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  db,
}) => {
  const [token, setToken] = useState<string | null>(getGoogleAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  if (!isOpen) return null;

  const currentDb = db || dataStorage.getDatabase();
  const activeSettings = settings || currentDb.settings || {
    namaSekolah: 'SMAN 1 Olahraga Nusantara',
    tahunPelajaran: '2026/2027',
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res?.accessToken) {
        setToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung dengan Google (${res.user.email || 'Akun Google'}).`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal login Google. Periksa koneksi atau izin pop-up browser.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await googleSignOut();
    setToken(null);
    setStatusMessage({ type: 'info', text: 'Koneksi Google telah diputuskan.' });
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Silakan hubungkan akun Google terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const title = `LMS_PJOK_${(activeSettings.namaSekolah || 'SMAN 1 Olahraga Nusantara').replace(/\s+/g, '_')}_2026`;
      const meta = await createPJOKSpreadsheet(title);

      // Save spreadsheet ID in settings
      dataStorage.updateDatabase((db) => ({
        ...db,
        settings: {
          ...db.settings,
          googleSpreadsheetId: meta.spreadsheetId,
          spreadsheetUrl: meta.spreadsheetUrl,
          terakhirSinkron: new Date().toLocaleString('id-ID'),
        },
      }));

      // Immediately sync initial data
      await syncAllDataToSpreadsheet(meta.spreadsheetId, dataStorage.toSheetsPayload());

      setStatusMessage({
        type: 'success',
        text: `Google Spreadsheet berhasil dibuat dengan 16 sheet tabel dan data awal tersinkronisasi!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membuat Google Spreadsheet.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!activeSettings.googleSpreadsheetId) {
      setStatusMessage({
        type: 'error',
        text: 'Belum ada Google Spreadsheet yang terhubung. Buat atau hubungkan terlebih dahulu.',
      });
      setShowConfirmSync(false);
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setShowConfirmSync(false);

    try {
      const payload = dataStorage.toSheetsPayload();
      const res = await syncAllDataToSpreadsheet(activeSettings.googleSpreadsheetId, payload);

      dataStorage.updateDatabase((db) => ({
        ...db,
        settings: {
          ...db.settings,
          terakhirSinkron: new Date().toLocaleString('id-ID'),
        },
      }));

      setStatusMessage({
        type: 'success',
        text: `Sukses menyinkronkan seluruh database LMS PJOK ke ${res.updatedSheets} sheet di Google Spreadsheet!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyinkronkan data ke Google Spreadsheet.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Integrasi Google Spreadsheet</h3>
              <p className="text-xs text-emerald-100">
                Penyimpanan Database & Sinkronisasi Cloud LMS PJOK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-sky-50 text-sky-800 border border-sky-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Connection Step */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Status Akun Google
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      token ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-800 text-sm">
                    {token ? 'Terhubung dengan Izin Spreadsheet & Drive' : 'Belum Terhubung'}
                  </span>
                </div>
              </div>

              {token ? (
                <button
                  onClick={handleDisconnectGoogle}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                >
                  Putuskan Akun
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl font-medium text-xs shadow-xs flex items-center gap-2 hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Masuk dengan Akun Google
                </button>
              )}
            </div>
          </div>

          {/* Active Spreadsheet Details */}
          {activeSettings.googleSpreadsheetId ? (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900 uppercase">
                    Spreadsheet Aktif
                  </span>
                </div>
                {activeSettings.spreadsheetUrl && (
                  <a
                    href={activeSettings.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    Buka Google Sheet <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="text-xs font-mono bg-white p-2.5 rounded-lg border border-emerald-100 text-slate-700 break-all select-all">
                ID: {activeSettings.googleSpreadsheetId}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Sinkronisasi Terakhir: {activeSettings.terakhirSinkron || 'Belum pernah'}</span>
                <span className="font-semibold text-emerald-700">16 Tabel Lengkap</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-center space-y-2">
              <Database className="w-8 h-8 text-sky-600 mx-auto" />
              <p className="text-sm font-semibold text-sky-900">
                Belum ada Spreadsheet PJOK yang Terhubung
              </p>
              <p className="text-xs text-sky-700 max-w-md mx-auto">
                Klik tombol di bawah untuk membuat Google Spreadsheet baru di Drive Anda yang secara otomatis
                membuat 16 sheet tabel (USERS, GURU, MURID, MATERI, NILAI, PRESENSI, dll).
              </p>
            </div>
          )}

          {/* Confirmation Modal for destructive overwrite */}
          {showConfirmSync ? (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-100">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Konfirmasi Sinkronisasi Data ke Google Spreadsheet?
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Tindakan ini akan memperbarui dan menulis seluruh data lokal LMS PJOK (Materi, Nilai,
                    Presensi, Pengguna) ke dalam Google Sheet yang terhubung. Apakah Anda yakin ingin
                    melanjutkan?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSync(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSyncToSheets}
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  {isLoading ? 'Menyinkronkan...' : 'Ya, Sinkronkan Data'}
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateNewSpreadsheet}
                disabled={isLoading || !token}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                {isLoading ? 'Memproses...' : 'Buat Spreadsheet PJOK Baru'}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmSync(true)}
                disabled={isLoading || !token || !activeSettings.googleSpreadsheetId}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Sinkronkan Data Sekarang
              </button>
            </div>
          )}

          {/* Sheets List Info */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Daftar 16 Tabel Sheet Terintegrasi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_SHEETS.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Akses aman melalui Google Workspace API
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
