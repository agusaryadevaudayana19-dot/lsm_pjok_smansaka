import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  User as UserIcon,
  FileSpreadsheet,
  BookOpen,
  Award,
  Sparkles,
  Users,
} from 'lucide-react';
import { User, UserRole, PengaturanSekolah } from '../types';
import { dataStorage } from '../services/dataStorage';

interface NavbarProps {
  currentUser: User;
  onOpenSidebar?: () => void;
  onToggleSidebar?: () => void;
  onOpenLoginModal?: () => void;
  onOpenSheetsModal?: () => void;
  onOpenGoogleSheets?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onSelectMenuItem?: (menuId: string, param?: string) => void;
  settings?: PengaturanSekolah;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenSidebar,
  onToggleSidebar,
  onOpenLoginModal,
  onOpenSheetsModal,
  onOpenGoogleSheets,
  onSwitchRole,
  onSelectMenuItem,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const db = dataStorage.getDatabase();
  const unreadCount = db.notifikasi ? db.notifikasi.filter((n) => !n.dibaca).length : 0;

  const handleSidebarClick = () => {
    if (onOpenSidebar) onOpenSidebar();
    else if (onToggleSidebar) onToggleSidebar();
  };

  const handleSheetsClick = () => {
    if (onOpenSheetsModal) onOpenSheetsModal();
    else if (onOpenGoogleSheets) onOpenGoogleSheets();
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkNotifRead = (id: string) => {
    dataStorage.updateDatabase((prev) => ({
      ...prev,
      notifikasi: prev.notifikasi.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
    }));
  };

  // Search filtering
  const query = searchQuery.trim().toLowerCase();
  const filteredMateri = query
    ? db.materi.filter(
        (m) =>
          m.judul.toLowerCase().includes(query) ||
          m.kategori.toLowerCase().includes(query) ||
          m.deskripsi.toLowerCase().includes(query)
      )
    : [];
  const filteredTugas = query
    ? db.tugas.filter((t) => t.judul.toLowerCase().includes(query) || t.instruksi.toLowerCase().includes(query))
    : [];
  const filteredQuiz = query ? db.quiz.filter((q) => q.judul.toLowerCase().includes(query)) : [];
  const filteredMurid = query
    ? db.users.filter(
        (u) =>
          u.role === 'MURID' &&
          (u.name.toLowerCase().includes(query) || (u.nis && u.nis.includes(query)))
      )
    : [];
  const filteredGuru = query
    ? db.users.filter((u) => u.role === 'GURU' && u.name.toLowerCase().includes(query))
    : [];

  const hasResults =
    filteredMateri.length > 0 ||
    filteredTugas.length > 0 ||
    filteredQuiz.length > 0 ||
    filteredMurid.length > 0 ||
    filteredGuru.length > 0;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator Utama';
      case 'GURU':
        return 'Guru Pengampu PJOK';
      case 'MURID':
        return currentUser.kelasId ? `Siswa Kelas XI 1` : 'Murid PJOK';
      default:
        return 'Pengguna';
    }
  };

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'PJ';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.trim().slice(0, 2) || 'PJ').toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSidebarClick}
          id="btn-sidebar-toggle"
          aria-label="Buka Menu Sidebar"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-colors focus:outline-hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar - Professional Polish Pill Style */}
        <div ref={searchRef} className="relative w-56 sm:w-80 md:w-96">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-full border border-gray-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              id="input-global-search"
              placeholder="Cari guru, murid, materi, tugas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50 max-h-80 overflow-y-auto space-y-2 text-xs">
              {!hasResults ? (
                <div className="p-4 text-center text-slate-400">
                  Tidak ditemukan hasil untuk "{searchQuery}"
                </div>
              ) : (
                <>
                  {filteredMateri.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Materi Pembelajaran
                      </div>
                      {filteredMateri.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectMenuItem) {
                              onSelectMenuItem(currentUser.role === 'MURID' ? 'materi-saya' : 'materi', m.id);
                            }
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 rounded-lg flex items-center justify-between text-slate-700 cursor-pointer"
                        >
                          <span className="font-medium truncate">{m.judul}</span>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            {m.kategori}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTugas.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-t border-gray-100 mt-1">
                        Tugas PJOK
                      </div>
                      {filteredTugas.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectMenuItem) {
                              onSelectMenuItem(currentUser.role === 'MURID' ? 'tugas-saya' : 'tugas', t.id);
                            }
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 rounded-lg flex items-center justify-between text-slate-700 cursor-pointer"
                        >
                          <span className="font-medium truncate">{t.judul}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Tugas
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredQuiz.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-t border-gray-100 mt-1">
                        Quiz
                      </div>
                      {filteredQuiz.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectMenuItem) {
                              onSelectMenuItem(currentUser.role === 'MURID' ? 'quiz-saya' : 'quiz', q.id);
                            }
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 rounded-lg flex items-center justify-between text-slate-700 cursor-pointer"
                        >
                          <span className="font-medium truncate">{q.judul}</span>
                          <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                            Quiz
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredMurid.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-t border-gray-100 mt-1">
                        Siswa / Murid
                      </div>
                      {filteredMurid.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onSelectMenuItem) {
                              onSelectMenuItem(currentUser.role === 'ADMIN' ? 'users' : 'data-murid', s.id);
                            }
                          }}
                          className="px-3 py-1.5 hover:bg-gray-50 rounded-lg flex items-center justify-between text-slate-700 cursor-pointer"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-[10px] text-slate-400">NIS: {s.nis}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, & User Info */}
      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
        {/* Google Sheets Sync Trigger - Admin Only */}
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={handleSheetsClick}
            id="btn-google-sheets-sync"
            title="Integrasi Google Sheets Database"
            className="hidden sm:flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold rounded-lg shadow-2xs hover:bg-gray-50 text-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Google Sheets</span>
          </button>
        )}

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            id="btn-notifications"
            className="relative text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 text-xs overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="font-bold text-slate-900">Notifikasi</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {db.notifikasi && db.notifikasi.length > 0 ? (
                  db.notifikasi.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkNotifRead(item.id)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-2.5 ${
                        !item.dibaca ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.tipe === 'tugas' ? (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Award className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-[11px] truncate">{item.judul}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.waktu}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{item.pesan}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">Belum ada notifikasi</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Widget - Professional Polish Style */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            id="btn-user-profile-menu"
            className="flex items-center space-x-3 border-l pl-3 sm:pl-5 border-gray-200 focus:outline-hidden text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-slate-900 truncate max-w-[140px]">
                {currentUser.name}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {getRoleLabel(currentUser.role)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-2xs flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(currentUser.name)}</span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 text-xs divide-y divide-gray-100">
              <div className="px-3 py-2.5">
                <p className="font-bold text-slate-900 text-sm">{currentUser.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser.email || currentUser.username}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>

              {currentUser.role === 'ADMIN' && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleSheetsClick();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Kelola Google Sheets</span>
                  </button>
                </div>
              )}

              {onOpenLoginModal && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenLoginModal();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
