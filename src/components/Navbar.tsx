import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminLoginModal } from './admin/AdminLoginModal';
import {
  GraduationCap,
  User,
  ShieldAlert,
  LogOut,
  Key,
} from 'lucide-react';

export const Navbar: React.FC<{
  onOpenCreateWizard: () => void;
}> = () => {
  const { mode, setMode, setActiveTestId, currentUser, logout } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTestId(null);
                setMode('admin');
              }}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition duration-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  MockTest<span className="text-blue-400">Pro</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">
                  Test Series Platform
                </span>
              </div>
            </button>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3">
            {mode === 'admin' ? (
              <>
                {/* Teacher / Admin Account Menu */}
                <div className="relative">
                  {currentUser ? (
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700/80 transition shadow-xs"
                    >
                      <div className="w-7 h-7 bg-blue-600/30 text-blue-400 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/30">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-100 max-w-[120px] truncate">
                            {currentUser.name}
                          </span>
                          {!currentUser.isSuperAdmin && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-1.5 py-0.2 rounded">
                              {currentUser.accessDaysRemaining}d Left
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] font-semibold text-slate-400 -mt-0.5 max-w-[130px] truncate">
                          {currentUser.instituteName || 'Coaching Institute'}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <Key className="w-3.5 h-3.5" /> Teacher Login
                    </button>
                  )}

                  {showProfileMenu && currentUser && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                      <div className="pb-3 border-b border-slate-800 mb-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${currentUser.isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                            {currentUser.isSuperAdmin ? 'Super Admin' : 'Teacher License Active'}
                          </span>
                          {!currentUser.isSuperAdmin && (
                            <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                              ⏱️ {currentUser.accessDaysRemaining} Days Left
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-100 leading-tight">
                            {currentUser.name}
                          </p>
                          <p className="text-xs font-bold text-blue-400 mt-0.5">
                            🏫 {currentUser.instituteName || 'Coaching Institute'}
                          </p>
                        </div>

                        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 text-[11px] space-y-1 text-slate-300">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Teacher Email:</span>
                            <span className="font-mono font-bold text-slate-200 max-w-[150px] truncate">{currentUser.email}</span>
                          </p>
                          {!currentUser.isSuperAdmin && currentUser.expiryDate && (
                            <p className="flex justify-between">
                              <span className="text-slate-400">Valid Until:</span>
                              <span className="font-bold text-emerald-400">{new Date(currentUser.expiryDate).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-center px-3 py-2.5 rounded-xl text-xs font-extrabold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Teacher Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Student Mode Header Actions */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTestId(null);
                    setMode('admin');
                  }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Exit Student Examination View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};
