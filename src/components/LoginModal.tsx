import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  UserCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { User, PengaturanSekolah } from '../types';
import { dataStorage } from '../services/dataStorage';
import { signInWithGoogle } from '../services/firebaseAuth';

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectUser?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
  currentUserId?: string;
  settings?: PengaturanSekolah;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onClose,
  onSelectUser,
  onLoginSuccess,
  currentUserId,
  settings,
}) => {
  if (!isOpen) return null;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  const db = dataStorage.getDatabase();
  const schoolName = settings?.namaSekolah || db.settings?.namaSekolah || 'SMAN 1 Olahraga Nusantara';

  const handleSelect = (user: User) => {
    if (onSelectUser) {
      onSelectUser(user);
    } else if (onLoginSuccess) {
      onLoginSuccess(user);
    }
    if (onClose) onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setErrorMsg('Masukkan Username, NIS, atau NIP');
      return;
    }

    // Match by username, nis, or nip
    const foundUser = db.users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        (u.nis && u.nis.toLowerCase() === cleanId) ||
        (u.nip && u.nip.replace(/\s+/g, '').toLowerCase() === cleanId.replace(/\s+/g, ''))
    );

    if (!foundUser) {
      setErrorMsg('Pengguna tidak terdaftar. Coba gunakan akun demo di bawah.');
      return;
    }

    if (foundUser.status === 'Nonaktif') {
      setErrorMsg('Akun ini dinonaktifkan oleh administrator sekolah.');
      return;
    }

    handleSelect(foundUser);
  };

  const handleQuickDemoLogin = (username: string) => {
    const user = db.users.find((u) => u.username === username);
    if (user) {
      handleSelect(user);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        const email = res.user.email?.toLowerCase() || '';
        let matched = db.users.find((u) => u.email?.toLowerCase() === email);
        if (!matched) {
          matched = db.users.find((u) => u.role === 'GURU') || db.users[0];
        }
        handleSelect(matched);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md my-8 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 text-center text-white relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 text-white shadow-lg font-black text-xl mb-2">
            PJOK
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">LMS PJOK Nusantara</h2>
          <p className="text-xs text-blue-200 mt-0.5">Pendidikan Jasmani, Olahraga, dan Kesehatan</p>
          <div className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-[11px] text-blue-100 border border-white/10">
            {schoolName}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Demo Accounts Switcher */}
          <div className="mb-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
              Pilih Akun Demo (1-Klik Langsung Masuk)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                id="demo-login-admin"
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-950 flex flex-col items-center gap-1 shadow-2xs transition-all hover:scale-102"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-slate-400">Kelola Sekolah</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('guru')}
                id="demo-login-guru"
                className="p-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-950 flex flex-col items-center gap-1 shadow-2xs transition-all hover:scale-102"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Guru PJOK</span>
                <span className="text-[9px] text-slate-400">Nilai & Jurnal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('murid')}
                id="demo-login-murid"
                className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 flex flex-col items-center gap-1 shadow-2xs transition-all hover:scale-102"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Murid</span>
                <span className="text-[9px] text-slate-400">Kelas & Tugas</span>
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 font-medium">atau masuk akun manual</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label
                htmlFor="input-identifier"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Username / NIP / NIS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="input-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin / guru / murid"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="input-password"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi akun"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              Masuk ke LMS
            </button>
          </form>

          {/* Google Sign-in Alternative */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoggingIn}
              id="btn-login-google"
              className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{isGoogleLoggingIn ? 'Menghubungkan...' : 'Sign in with Google (Google Sheets Sync)'}</span>
            </button>
          </div>

          <div className="mt-4 text-center text-slate-400 text-[11px]">
            &copy; 2026 {schoolName} • Sistem LMS PJOK
          </div>
        </div>
      </div>

      {/* Forgot Password Sub-Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-800">Lupa Password Akun?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Pengaturan ulang password akun dikelola langsung oleh Tim Administrator LMS PJOK sekolah.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
              <p className="font-semibold">Kontak Tim IT / Admin Sekolah:</p>
              <p>Email: admin.pjok@sman1olahraga.sch.id</p>
              <p>Ruang: Laboratorium Komputer & Server Lt. 2</p>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
