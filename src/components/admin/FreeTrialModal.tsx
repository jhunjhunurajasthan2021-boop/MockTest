import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ADMIN_WHATSAPP_NUMBER } from '../../services/storage';
import {
  Sparkles,
  UserCheck,
  Lock,
  Phone,
  Building2,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  Gift,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ isOpen, onClose }) => {
  const { grantOrUpdateTeacherAccess, loginAsTeacher } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [instituteName, setInstituteName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanInstitute = instituteName.trim();

    if (!cleanName) {
      setErrorMsg('कृपया अपना नाम (Teacher Name) दर्ज करें।');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('कृपया सही ईमेल आईडी (Valid Email ID) दर्ज करें।');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का बनाएं।');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('कृपया 10-अंकों का व्हाट्सएप/मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!cleanInstitute) {
      setErrorMsg('कृपया अपनी कोचिंग या स्कूल का नाम दर्ज करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Teacher account with 3 days validity & Free Trial tag
      grantOrUpdateTeacherAccess({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        instituteName: cleanInstitute,
        accessDays: 3,
        password: cleanPass,
        notes: '3-Day Free Trial (10 Mock Tests)',
      });

      // 2. Automatically log the teacher in
      const loginRes = loginAsTeacher(cleanEmail, cleanPass);

      if (loginRes.success) {
        setSuccessMsg('🎉 3 दिन का फ्री ट्रायल (10 मॉक टेस्ट) सफलतापूर्वक चालू हो गया है! Welcome to Teacher Panel.');
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(loginRes.message || 'फ्री ट्रायल अकाउंट बनाने में समस्या आई।');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Free trial registration error:', err);
      setErrorMsg('रजिस्ट्रेशन असफल रहा, कृपया पुनः प्रयास करें।');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between border-b border-blue-600/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg font-black shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-300/40 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3 fill-amber-300" /> 100% Free Trial Access
              </div>
              <h3 className="font-black text-base sm:text-lg tracking-tight text-white">
                3 Days Free Trial (10 Mock Tests)
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                शिक्षक/कोचिंग संचालक हेतु 3 दिन एवं 10 मॉक टेस्ट का मुफ़्त ट्रायल
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-blue-200 hover:text-white hover:bg-blue-600/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Top Feature Highlights */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50/30 p-3.5 rounded-2xl border border-blue-200/80 text-xs space-y-1.5">
            <p className="font-extrabold text-blue-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> 
              फ्री ट्रायल में आपको क्या मिलेगा:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>3 दिन की पूर्ण वैलिडिटी</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>10 ऑनलाइन मॉक टेस्ट बनाएं</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>व्हाट्सएप डायरेक्ट लिंक शेयर</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>लाइव स्कोरकार्ड व रैंक एनालिसिस</span>
              </li>
            </ul>
          </div>

          {/* Status Alerts */}
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

          <form onSubmit={handleTrialSubmit} className="space-y-3.5">
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Teacher / Director Name (शिक्षक का नाम) *
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                />
              </div>
            </div>

            {/* 2. Email & Password in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Email ID (ईमेल आईडी) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Create Password (पासवर्ड) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="Create 4+ digit pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. Phone & Coaching Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  WhatsApp Number (मोबाइल नं.) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Coaching Name (संस्थान का नाम) *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toppers Academy"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'प्रॉसेस हो रहा है...' : '🚀 3-दिन का फ्री ट्रायल चालू करें (Activate Free Trial)'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-[11px] text-center font-bold text-slate-500 pt-1">
            3-दिन ट्रायल के बाद आगे जारी रखने के लिए व्हाट्सएप ({ADMIN_WHATSAPP_NUMBER}) पर संपर्क करें।
          </p>
        </div>
      </div>
    </div>
  );
};
