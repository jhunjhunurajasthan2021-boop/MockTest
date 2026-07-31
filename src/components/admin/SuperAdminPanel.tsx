import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherAccount } from '../../types';
import { ADMIN_WHATSAPP_NUMBER, SUPER_ADMIN_EMAIL } from '../../services/storage';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Key,
  Calendar,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Building,
  Phone,
  Mail,
  Lock,
  RefreshCw,
  Award,
  Edit3,
  Plus,
  Minus,
  ExternalLink,
  Zap,
  Bot,
  Upload,
} from 'lucide-react';
import { AIAgentPanel } from './AIAgentPanel';

export const SuperAdminPanel: React.FC = () => {
  const {
    teachers,
    grantOrUpdateTeacherAccess,
    revokeTeacherAccess,
    deleteTeacherAccount,
    loginAsTeacher,
    tests,
    attempts,
    platformConfig,
    updatePlatformConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'teachers' | 'landing_config' | 'ai_agent'>('teachers');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherAccount | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Platform Config Local Form State
  const [localConfig, setLocalConfig] = useState(platformConfig);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Testimonial Form State
  const [newTestim, setNewTestim] = useState({
    name: '',
    roleOrInstitute: '',
    rating: 5,
    quote: '',
  });
  const [showAddTestimModal, setShowAddTestimModal] = useState(false);


  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    instituteName: '',
    accessDays: 30, // Default 30 days
    customDaysInput: '30',
    notes: '',
  });

  // Edit Teacher Days State
  const [editDaysInput, setEditDaysInput] = useState<number>(30);

  const [createdTeacherInfo, setCreatedTeacherInfo] = useState<TeacherAccount | null>(null);

  const activeTeachersCount = teachers.filter((t) => t.status === 'active' && new Date(t.expiryDate) > new Date()).length;
  const expiredTeachersCount = teachers.filter((t) => t.status === 'expired' || new Date(t.expiryDate) <= new Date()).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const daysToGrant = parseInt(formData.customDaysInput || '30', 10);
    const validDays = isNaN(daysToGrant) || daysToGrant <= 0 ? 30 : daysToGrant;

    const newTeacher = grantOrUpdateTeacherAccess({
      name: formData.name,
      email: formData.email,
      password: formData.password || '123456',
      phone: formData.phone,
      instituteName: formData.instituteName,
      accessDays: validDays,
      notes: formData.notes,
    });

    setCreatedTeacherInfo(newTeacher);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      instituteName: '',
      accessDays: 30,
      customDaysInput: '30',
      notes: '',
    });
  };

  const handleOpenEditModal = (t: TeacherAccount) => {
    const now = new Date();
    const expiry = new Date(t.expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    setEditingTeacher(t);
    setEditDaysInput(t.accessDays >= 90000 ? 99999 : remainingDays || 30);
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const validDays = isNaN(editDaysInput) || editDaysInput <= 0 ? 1 : editDaysInput;

    grantOrUpdateTeacherAccess({
      id: editingTeacher.id,
      name: editingTeacher.name,
      email: editingTeacher.email,
      password: editingTeacher.password || '123456',
      phone: editingTeacher.phone,
      instituteName: editingTeacher.instituteName,
      coachingLogoUrl: editingTeacher.coachingLogoUrl,
      coachingTagline: editingTeacher.coachingTagline,
      allowCustomBranding: editingTeacher.allowCustomBranding,
      accessDays: validDays,
      notes: editingTeacher.notes,
    });

    setEditingTeacher(null);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWhatsAppShareLink = (t: TeacherAccount) => {
    const msg = `Hello ${t.name} Sir/Madam,\n\nYour Teacher Admin Panel access for MockTest Pro has been activated!\n\n📧 Email ID: ${t.email}\n🔒 Password: ${t.password || '123456'}\n⏱️ Validity: ${t.accessDays >= 90000 ? 'Lifetime' : `${t.accessDays} Days`}\n📅 Expiry Date: ${new Date(t.expiryDate).toLocaleDateString()}\n\nLogin portal link: ${window.location.origin}\n\nFor support, contact Main Admin: ${ADMIN_WHATSAPP_NUMBER}`;
    return `https://wa.me/91${t.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Super Admin Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-full">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Main Super Admin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Teacher License & Access Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Main Admin Email: <strong className="text-blue-300 font-semibold">{SUPER_ADMIN_EMAIL}</strong> | WhatsApp: <strong className="text-emerald-400 font-semibold">+{ADMIN_WHATSAPP_NUMBER}</strong>
            </p>
          </div>

          <button
            onClick={() => {
              setCreatedTeacherInfo(null);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition shrink-0"
          >
            <UserPlus className="w-5 h-5" /> Grant Teacher Access
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400">Total Teachers</span>
            <p className="text-2xl font-black text-white mt-0.5">{teachers.length}</p>
          </div>
          <div className="bg-emerald-950/40 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-800/50">
            <span className="text-[11px] font-semibold text-emerald-400">Active Teachers</span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">{activeTeachersCount}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400">Total Test Series</span>
            <p className="text-2xl font-black text-blue-400 mt-0.5">{tests.length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400">Student Attempts</span>
            <p className="text-2xl font-black text-purple-400 mt-0.5">{attempts.length}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl w-fit text-xs font-bold border border-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          Teacher Directory & Licenses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('landing_config')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'landing_config'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Front Page Pricing & Testimonials Config
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_agent')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'ai_agent'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
          🤖 AI Agent & Diagnostics
        </button>
      </div>

      {activeTab === 'ai_agent' ? (
        <AIAgentPanel />
      ) : activeTab === 'teachers' ? (
        /* Teachers Directory */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Teacher Access Directory & Licenses (शिक्षक एक्सेस सूची)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Control which teachers have access to create tests, view student answers, and export Excel reports.
              </p>
            </div>
          </div>


        {teachers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No Teacher Accounts Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click "Grant Teacher Access" above to issue a license to a teacher.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => {
              const now = new Date();
              const expiry = new Date(t.expiryDate);
              const isExpired = expiry <= now || t.status === 'expired';
              const isBlocked = t.status === 'blocked';
              const diffMs = expiry.getTime() - now.getTime();
              const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                    isBlocked
                      ? 'bg-rose-50/40 border-rose-200'
                      : isExpired
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : isExpired
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isBlocked ? 'BLOCKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                      </div>
                      {t.instituteName && (
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" /> {t.instituteName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info & Validity */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                      </span>
                      <strong className="text-slate-900 font-semibold">{t.email}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400" /> Password:
                      </span>
                      <strong className="text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{t.password || '123456'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile:
                      </span>
                      <strong className="text-slate-900 font-semibold">{t.phone}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Access Days:
                      </span>
                      <span className="font-bold text-blue-700">
                        {t.accessDays >= 90000 ? 'Lifetime' : `${daysRemaining} Days Left`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* View Teacher's Isolated Panel */}
                    <button
                      type="button"
                      onClick={() => {
                        loginAsTeacher(t.email, t.password || '123456');
                      }}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition shadow-xs"
                      title="Open this teacher's isolated panel"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> View Panel
                    </button>

                    {/* Send WhatsApp Access Info */}
                    <a
                      href={getWhatsAppShareLink(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Send Login Info
                    </a>

                    {/* Edit Teacher & Branding */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(t)}
                      className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-xs"
                      title="Edit Teacher details, Coaching Name, Logo & Access Days"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Teacher & Branding
                    </button>

                    {/* Block or Unblock */}
                    {isBlocked ? (
                      <button
                        type="button"
                        onClick={() =>
                          grantOrUpdateTeacherAccess({
                            id: t.id,
                            name: t.name,
                            email: t.email,
                            phone: t.phone,
                            instituteName: t.instituteName,
                            accessDays: 30,
                            notes: t.notes,
                          })
                        }
                        className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl transition"
                        title="Unblock Teacher"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => revokeTeacherAccess(t.id)}
                        className="p-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl transition"
                        title="Block Access"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Account */}
                    <button
                      type="button"
                      onClick={() => setTeacherToDelete(t)}
                      className="p-2 bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition shadow-xs"
                      title="Delete Teacher Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      ) : (
        /* Front Page Landing & Pricing Configurator */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-8">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Front Page, Prices & Teacher Testimonials Config
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize headlines, teacher pricing plans, WhatsApp contact number, and teacher testimonials displayed on the main landing page.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updatePlatformConfig(localConfig);
                setConfigSuccessMsg('Front Page & Pricing Config saved successfully!');
                setTimeout(() => setConfigSuccessMsg(''), 3000);
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" /> Save All Front Page Changes
            </button>
          </div>

          {configSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{configSuccessMsg}</span>
            </div>
          )}

          {/* Pricing & WhatsApp Config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-black text-slate-800">
                Monthly Plan Price (मासिक प्लान मूल्य) ₹ *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-500">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={localConfig.monthlyPrice}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, monthlyPrice: parseInt(e.target.value || '0', 10) })
                  }
                  className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">Default: ₹199 per month</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-black text-slate-800">
                Yearly Plan Price (वार्षिक प्लान मूल्य) ₹ *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-500">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={localConfig.yearlyPrice}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, yearlyPrice: parseInt(e.target.value || '0', 10) })
                  }
                  className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">Default: ₹1800 per year</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-black text-slate-800">
                Super Admin WhatsApp Number *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  required
                  value={localConfig.whatsappNumber}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, whatsappNumber: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full text-xs pl-12 pr-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">Main Admin contact for teacher approvals</p>
            </div>
          </div>

          {/* Headline & Subtitle Texts */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Main Front Headline (मुख्य शीर्षक) *
              </label>
              <input
                type="text"
                required
                value={localConfig.headlineText}
                onChange={(e) => setLocalConfig({ ...localConfig, headlineText: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Front Subtitle / Tagline Description *
              </label>
              <textarea
                rows={2}
                required
                value={localConfig.subtitleText}
                onChange={(e) => setLocalConfig({ ...localConfig, subtitleText: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Plan Features Configurator (Monthly & Yearly Features) */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Teacher Plan Features Management (मासिक और वार्षिक प्लान फीचर्स का नियंत्रण)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Plan Features */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Monthly Plan Features (₹{localConfig.monthlyPrice})
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalConfig({
                        ...localConfig,
                        monthlyPlanFeatures: [...localConfig.monthlyPlanFeatures, 'New Teacher Feature'],
                      });
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {localConfig.monthlyPlanFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-4">{index + 1}.</span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...localConfig.monthlyPlanFeatures];
                          updated[index] = e.target.value;
                          setLocalConfig({ ...localConfig, monthlyPlanFeatures: updated });
                        }}
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-xl font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = localConfig.monthlyPlanFeatures.filter((_, i) => i !== index);
                          setLocalConfig({ ...localConfig, monthlyPlanFeatures: updated });
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yearly Plan Features */}
              <div className="p-5 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <h5 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Yearly Plan Features (₹{localConfig.yearlyPrice})
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalConfig({
                        ...localConfig,
                        yearlyPlanFeatures: [...localConfig.yearlyPlanFeatures, 'New Yearly Feature'],
                      });
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {localConfig.yearlyPlanFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-4">{index + 1}.</span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...localConfig.yearlyPlanFeatures];
                          updated[index] = e.target.value;
                          setLocalConfig({ ...localConfig, yearlyPlanFeatures: updated });
                        }}
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-700 rounded-xl font-semibold bg-slate-950 text-white focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = localConfig.yearlyPlanFeatures.filter((_, i) => i !== index);
                          setLocalConfig({ ...localConfig, yearlyPlanFeatures: updated });
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-950/80 rounded-lg transition"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Control Section */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Teacher Testimonials ({localConfig.testimonials.length})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add or edit reviews shown on the front landing page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTestimModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Teacher Testimonial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localConfig.testimonials.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{t.name}</h5>
                      <p className="text-[11px] font-semibold text-slate-500">{t.roleOrInstitute}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const filtered = localConfig.testimonials.filter((item) => item.id !== t.id);
                        setLocalConfig({ ...localConfig, testimonials: filtered });
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs italic text-slate-700 font-medium">"{t.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Testimonial Modal */}
      {showAddTestimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Add New Teacher Testimonial</h3>
              <button
                type="button"
                onClick={() => setShowAddTestimModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Teacher Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Sir"
                  value={newTestim.name}
                  onChange={(e) => setNewTestim({ ...newTestim, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Institute / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Director, Science Academy"
                  value={newTestim.roleOrInstitute}
                  onChange={(e) => setNewTestim({ ...newTestim, roleOrInstitute: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Teacher Review Quote *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Testing platform is fast and students love live rank updates."
                  value={newTestim.quote}
                  onChange={(e) => setNewTestim({ ...newTestim, quote: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddTestimModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!newTestim.name || !newTestim.quote) return;
                  const item = {
                    id: `testim-${Date.now()}`,
                    ...newTestim,
                  };
                  setLocalConfig({
                    ...localConfig,
                    testimonials: [item, ...localConfig.testimonials],
                  });
                  setNewTestim({ name: '', roleOrInstitute: '', rating: 5, quote: '' });
                  setShowAddTestimModal(false);
                }}
                className="px-5 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Add Testimonial
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Edit Teacher Days & Details Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Edit Teacher & Coaching Branding</h3>
                  <p className="text-[11px] text-slate-400">{editingTeacher.name} ({editingTeacher.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Coaching / Institute Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jhunjhunu Career Academy"
                  value={editingTeacher.instituteName || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, instituteName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Coaching Logo (Upload File or Enter URL)</label>
                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        if (dataUrl) {
                          setEditingTeacher((prev) => prev ? { ...prev, coachingLogoUrl: dataUrl } : null);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="https://logo-url.png"
                    value={editingTeacher.coachingLogoUrl || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, coachingLogoUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Coaching Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Official Test Portal"
                    value={editingTeacher.coachingTagline || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, coachingTagline: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Set Exact Validity Days */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-900">
                  Set Custom Days (कम या ज्यादा दिन सेट करें) *
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditDaysInput((prev) => Math.max(1, prev - 10))}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" /> -10 Days
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="99999"
                    required
                    value={editDaysInput}
                    onChange={(e) => setEditDaysInput(parseInt(e.target.value || '1', 10))}
                    className="w-full text-center font-extrabold text-base px-3 py-2 border-2 border-blue-500 rounded-xl bg-white text-blue-900 shadow-inner"
                  />

                  <button
                    type="button"
                    onClick={() => setEditDaysInput((prev) => prev + 10)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> +10 Days
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  Type any exact number of days (e.g. 15, 45, 90, 180, 365, 99999 for Lifetime).
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                  {[7, 15, 30, 60, 90, 180, 365, 99999].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditDaysInput(d)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                        editDaysInput === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {d === 99999 ? 'Lifetime' : `${d}d`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Save Validity Days
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Teacher Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Issue Teacher Access License</h3>
                  <p className="text-[11px] text-slate-400">Set custom validity days & account credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {createdTeacherInfo ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Teacher Access Granted!</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Share these credentials with <strong>{createdTeacherInfo.name}</strong> on WhatsApp.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Teacher Email:</span>
                      <span className="font-bold text-slate-900">{createdTeacherInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Access Validity:</span>
                      <span className="font-bold text-blue-600">
                        {createdTeacherInfo.accessDays >= 90000 ? 'Lifetime' : `${createdTeacherInfo.accessDays} Days`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={getWhatsAppShareLink(createdTeacherInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" /> Send Credentials via WhatsApp
                    </a>
                    <button
                      onClick={() => setCreatedTeacherInfo(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                    >
                      Add Another Teacher
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teacher Name (शिक्षक का नाम) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma Sir"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teacher Email ID *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="teacher@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Set Login Password (पासवर्ड)
                      </label>
                      <input
                        type="text"
                        placeholder="Default: 123456"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Mobile No *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      School / Coaching Institute Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jhunjhunu Career Academy"
                      value={formData.instituteName}
                      onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Manual Days Input & Preset Buttons */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Access Validity Duration in Days (कम या ज्यादा दिन दर्ज करें) *
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="99999"
                        required
                        placeholder="Enter days (e.g. 15, 45, 100)"
                        value={formData.customDaysInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            customDaysInput: val,
                            accessDays: parseInt(val || '30', 10),
                          });
                        }}
                        className="w-full text-xs font-bold px-3.5 py-2.5 border-2 border-blue-500 rounded-xl bg-blue-50/30 text-blue-900 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">Days</span>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                      {[7, 15, 30, 60, 90, 365, 99999].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setFormData({ ...formData, accessDays: days, customDaysInput: days.toString() })}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition ${
                            formData.customDaysInput === days.toString()
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {days === 99999 ? 'Lifetime' : `${days}d`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" /> Issue License
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Delete Teacher Account?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete the teacher account for <span className="font-bold text-slate-800">"{teacherToDelete.name}"</span> ({teacherToDelete.email})? They will lose access to the Admin panel immediately.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacherAccount(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
