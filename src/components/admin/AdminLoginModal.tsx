import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ADMIN_WHATSAPP_NUMBER } from '../../services/storage';
import {
  MessageSquare,
  Lock,
  UserCheck,
  AlertCircle,
  X,
  CheckCircle2,
  GraduationCap,
  Gift,
  ArrowRight,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFreeTrial?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onOpenFreeTrial }) => {
  const { loginAsTeacher } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your Teacher Email ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your Password.');
      return;
    }

    const res = loginAsTeacher(email, password);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const whatsappMessage = encodeURIComponent(
    'Hello Admin, I need access to the Teacher Admin Panel for the Test Series Platform.\n\nMy Name:\nCoaching/School:\nEmail ID:'
  );
  const whatsappUrl = `https://wa.me/91${ADMIN_WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95">
        {/* Header - Fixed shrink-0 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                Teacher Panel Login
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Login with registered Email & Password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable flex-1 */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Teacher Email ID (शिक्षक ईमेल) *
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="Enter registered email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Password (पासवर्ड) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Login to Teacher Panel
            </button>
          </form>

          {/* Claim Free Trial Button if callback exists */}
          {onOpenFreeTrial && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black text-amber-950 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" /> New Teacher?
                </div>
                <p className="text-[11px] font-semibold text-amber-900/80 mt-0.5">
                  Get 3 Days Free Trial (10 Mock Tests)
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenFreeTrial}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-xl shadow-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Free Trial</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* WhatsApp Contact Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  Need Help or Teacher Account Access?
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                  Contact Main Admin on WhatsApp to activate or extend your teacher account.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Admin on WhatsApp ({ADMIN_WHATSAPP_NUMBER})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
