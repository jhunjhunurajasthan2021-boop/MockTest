import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { FreeTrialModal } from './admin/FreeTrialModal';
import {
  GraduationCap,
  User,
  ShieldAlert,
  LogOut,
  Key,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  X,
  Mail,
  MapPin,
  Gift,
} from 'lucide-react';
import { MockTestProLogo } from './common/MockTestProLogo';

export const Navbar: React.FC<{
  onOpenCreateWizard: () => void;
}> = () => {
  const { mode, setMode, setActiveTestId, currentUser, logout, activeTest, teachers } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const matchingTeacher = activeTest
    ? teachers.find(
        (t) =>
          t.id === activeTest.teacherId ||
          t.email.toLowerCase() === activeTest.teacherId.toLowerCase()
      )
    : null;

  const coachingLogo =
    activeTest?.coachingLogoUrl ||
    matchingTeacher?.coachingLogoUrl ||
    currentUser?.coachingLogoUrl ||
    '';

  const coachingName =
    activeTest?.coachingName ||
    matchingTeacher?.instituteName ||
    currentUser?.instituteName ||
    'MockTest Pro';

  const coachingTagline =
    activeTest?.coachingTagline ||
    matchingTeacher?.coachingTagline ||
    currentUser?.coachingTagline ||
    '';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-2 gap-4">
          {/* Left Side: Logo (Coaching or Default Platform Logo) */}
          <div className="flex items-center gap-3.5 shrink-0">
            {mode === 'student' && activeTest ? (
              <MockTestProLogo
                logoUrl={coachingLogo}
                name={coachingName}
                tagline={coachingTagline}
                variant="navbar"
                theme="light"
              />
            ) : (
              <MockTestProLogo
                logoUrl={coachingLogo}
                name={coachingName}
                tagline={coachingTagline}
                variant="navbar"
                theme="light"
                onClick={() => {
                  setActiveTestId(null);
                  setMode('admin');
                }}
              />
            )}
          </div>

          {/* Center Context (Active Test title when taking a test) */}
          {mode === 'student' && activeTest && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs max-w-xs lg:max-w-md">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                Live Test
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                {activeTest.title}
              </h1>
            </div>
          )}

          {/* Right Action: Login or Account Profile */}
          <div className="flex items-center gap-3">
            {mode === 'admin' ? (
              <div className="relative">
                {currentUser ? (
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-3.5 py-2 rounded-xl border border-slate-300/80 transition shadow-2xs cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 max-w-[120px] truncate">
                          {currentUser.name}
                        </span>
                        {!currentUser.isSuperAdmin && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-1.5 py-0.2 rounded">
                            {currentUser.accessDaysRemaining}d
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] font-semibold text-slate-500 -mt-0.5 max-w-[130px] truncate">
                        {currentUser.instituteName || 'Coaching Institute'}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFreeTrialModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-sm transition-transform duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Gift className="w-4 h-4 text-slate-950" />
                      <span className="hidden sm:inline">🎁 3 Days Free Trial</span>
                      <span className="sm:hidden">Free Trial</span>
                    </button>

                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-transform duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Key className="w-4 h-4" /> Teacher Login
                    </button>
                  </div>
                )}

                {showProfileMenu && currentUser && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 text-slate-800">
                    <div className="pb-3 border-b border-slate-100 mb-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${currentUser.isSuperAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
                          {currentUser.isSuperAdmin ? 'Super Admin' : 'Teacher License'}
                        </span>
                        {!currentUser.isSuperAdmin && (
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            ⏱️ {currentUser.accessDaysRemaining} Days Left
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">
                          {currentUser.name}
                        </p>
                        <p className="text-xs font-bold text-blue-600 mt-0.5">
                          🏫 {currentUser.instituteName || 'Coaching Institute'}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1 text-slate-600">
                        <p className="flex justify-between">
                          <span className="text-slate-500">Teacher Email:</span>
                          <span className="font-mono font-bold text-slate-800 max-w-[150px] truncate">{currentUser.email}</span>
                        </p>
                        {!currentUser.isSuperAdmin && currentUser.expiryDate && (
                          <p className="flex justify-between">
                            <span className="text-slate-500">Valid Until:</span>
                            <span className="font-bold text-emerald-600">{new Date(currentUser.expiryDate).toLocaleDateString()}</span>
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
                        className="w-full text-center px-3 py-2.5 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Teacher Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Student Mode Header Actions */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTestId(null);
                    setMode('admin');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-transform duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Teacher Portal / Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center font-black">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Contact Institute Support</h3>
              <p className="text-xs text-slate-500 font-medium">
                Reach out for exam help, batch details, or registration support.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Support Email</span>
                  <span className="font-bold text-slate-800">support@mocktestpro.in</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Helpline Number</span>
                  <span className="font-bold text-slate-800">+91 98765 43210</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Portal Partner</span>
                  <span className="font-bold text-slate-800">{coachingName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Login & Free Trial Modals */}
      {showLoginModal && (
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onOpenFreeTrial={() => {
            setShowLoginModal(false);
            setShowFreeTrialModal(true);
          }}
        />
      )}

      {showFreeTrialModal && (
        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={() => setShowFreeTrialModal(false)}
        />
      )}
    </header>
  );
};

