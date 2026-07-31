import React, { useState, useEffect } from 'react';
import { useApp, checkIsFreeTrial } from '../../context/AppContext';
import { MockTest } from '../../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { QRCodeModal } from '../common/QRCodeModal';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
import { SuperAdminPanel } from './SuperAdminPanel';
import { AdminLoginModal } from './AdminLoginModal';
import { ADMIN_WHATSAPP_NUMBER, SUPER_ADMIN_EMAIL } from '../../services/storage';
import { cleanTestId } from '../../utils/cleanTestId';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Users,
  Award,
  Link,
  Plus,
  Share2,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  Copy as CopyIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Key,
  UserPlus,
  UserCheck,
  LogOut,
  Image as ImageIcon,
  Building2,
  Upload,
} from 'lucide-react';

export const Dashboard: React.FC<{
  onOpenCreateWizard: () => void;
  onEditTest: (test: MockTest) => void;
  onViewAnalytics: (test: MockTest) => void;
}> = ({ onOpenCreateWizard, onEditTest, onViewAnalytics }) => {
  const { tests, attempts, teachers, deleteTest, cloneTest, setActiveTestId, setMode, currentUser, logout, updateTeacherBranding } = useApp();

  const [activeTab, setActiveTab] = useState<'tests' | 'superadmin'>(
    currentUser?.isSuperAdmin ? 'superadmin' : 'tests'
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQrTest, setSelectedQrTest] = useState<MockTest | null>(null);
  const [testToDelete, setTestToDelete] = useState<MockTest | null>(null);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [brandingForm, setBrandingForm] = useState({
    instituteName: currentUser?.instituteName || '',
    coachingLogoUrl: currentUser?.coachingLogoUrl || '',
    coachingTagline: currentUser?.coachingTagline || '',
  });

  useEffect(() => {
    if (currentUser) {
      setBrandingForm({
        instituteName: currentUser.instituteName || '',
        coachingLogoUrl: currentUser.coachingLogoUrl || '',
        coachingTagline: currentUser.coachingTagline || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.isSuperAdmin && activeTab === 'superadmin') {
      setActiveTab('tests');
    }
  }, [currentUser]);

  const handleCreateTestClick = () => {
    if (checkIsFreeTrial(currentUser) && displayTests.length >= 10) {
      alert(
        `आपकी 3-दिन फ्री ट्रायल सीमा (10 मॉक टेस्ट) पूर्ण हो चुकी है!\n\nअनलिमिटेड मॉक टेस्ट बनाने के लिए एडमिन से व्हाट्सएप (${ADMIN_WHATSAPP_NUMBER}) पर संपर्क करके प्लान अपग्रेड करें।`
      );
      window.open(
        `https://wa.me/91${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hello Admin, I have reached my 10 Mock Tests limit on 3-Day Free Trial (${currentUser?.email}). Please upgrade my account to Unlimited Plan.`
        )}`,
        '_blank'
      );
      return;
    }
    onOpenCreateWizard();
  };
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (PNG, JPG, SVG, WEBP) फाइल चुनें!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setBrandingForm((prev) => ({ ...prev, coachingLogoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Compute isolated teacher tests
  const displayTests = tests.filter((t) => {
    if (currentUser?.isSuperAdmin) {
      if (selectedTeacherFilter === 'all') return true;
      return t.teacherId?.toLowerCase() === selectedTeacherFilter.toLowerCase();
    }
    if (!currentUser) return true;
    const userEmail = (currentUser.email || '').toLowerCase();
    const userPasscode = (currentUser.accessPasscode || '').toLowerCase();
    const testTeacher = (t.teacherId || '').toLowerCase();

    return (
      testTeacher === userEmail ||
      testTeacher === userPasscode ||
      (!t.teacherId && userEmail === 'teacher@school.edu') ||
      testTeacher === 'teacher-admin-01'
    );
  });

  const displayTestIds = new Set(displayTests.map((t) => t.id));
  const displayAttempts = attempts.filter((a) => displayTestIds.has(a.testId));

  // Compute stats based on isolated teacher data
  const totalTests = displayTests.length;
  const totalAttempts = displayAttempts.length;
  const avgScorePercent =
    totalAttempts > 0
      ? Math.round(displayAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttempts)
      : 0;

  const activeLinksCount = displayTests.filter((t) => {
    if (!t.isPublished) return false;
    if (t.expiryDate && new Date(t.expiryDate).getTime() < Date.now()) return false;
    return true;
  }).length;

  const expiringSoonTests = displayTests.filter((t) => {
    if (!t.expiryDate || !t.isPublished) return false;
    const diffHours = (new Date(t.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48; // Expiring within 48 hours
  });

  // Chart 1: Subject-wise Attempt Performance
  const subjectMap: Record<string, { total: number; sumPercent: number; count: number }> = {};
  displayAttempts.forEach((att) => {
    const test = displayTests.find((t) => t.id === att.testId);
    const subj = test?.subject || 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { total: 0, sumPercent: 0, count: 0 };
    }
    subjectMap[subj].sumPercent += att.percentage;
    subjectMap[subj].count += 1;
  });

  const subjectChartData = Object.keys(subjectMap).map((subj) => ({
    subject: subj,
    avgScore: Math.round(subjectMap[subj].sumPercent / subjectMap[subj].count),
    attempts: subjectMap[subj].count,
  }));

  if (subjectChartData.length === 0) {
    subjectChartData.push(
      { subject: 'Physics', avgScore: 78, attempts: 14 },
      { subject: 'Chemistry', avgScore: 65, attempts: 18 },
      { subject: 'Computer Science', avgScore: 82, attempts: 22 }
    );
  }

  // Chart 2: Pass vs Fail Ratio
  const passedCount = displayAttempts.filter((a) => a.passed).length;
  const failedCount = totalAttempts - passedCount;
  const passFailData = [
    { name: 'Passed', value: totalAttempts > 0 ? passedCount : 18, color: '#10B981' },
    { name: 'Needs Improvement', value: totalAttempts > 0 ? failedCount : 6, color: '#EF4444' },
  ];

  const getShareUrl = (testId: string) => {
    const cleaned = cleanTestId(testId) || testId;
    return `${window.location.origin}${window.location.pathname}?test=${cleaned}#test/${cleaned}`;
  };

  const handleCopyLink = (testId: string) => {
    const url = getShareUrl(testId);
    navigator.clipboard.writeText(url);
    setCopiedId(testId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    'Hello Admin, I need access to the Teacher Admin Panel for the Test Series Platform.\n\nMy Email ID:'
  );
  const whatsappUrl = `https://wa.me/91${ADMIN_WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Super Admin / View Selector Tabs (Only when Super Admin is logged in or for navigation) */}
      {currentUser?.isSuperAdmin && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'tests'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Tests & Analytics Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('superadmin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'superadmin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Teacher Directory & License Control Center
            </button>
          </div>
        </div>
      )}

      {activeTab === 'superadmin' ? (
        <SuperAdminPanel />
      ) : (
        <>
          {/* Welcome & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 text-slate-900 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Teacher Analytics & Management Control Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Mock Test Series Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Create tests, bulk import questions from Word/Excel, share links, and track student results.
              </p>
            </div>

            <button
              onClick={handleCreateTestClick}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-xs transition duration-200 shrink-0 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create New Mock Test
            </button>
          </div>

          {/* Teacher Free Trial Active Banner */}
          {checkIsFreeTrial(currentUser) && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shrink-0 font-black text-base shadow-xs">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      3-Day Free Trial Account Active
                    </h4>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                      ⏱️ {currentUser?.accessDaysRemaining || 0} Days Left
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Trial Limit: <strong className="text-slate-900 font-bold">{displayTests.length} / 10 Mock Tests Created</strong>
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/91${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello Admin, I am using the 3-Day Free Trial (${currentUser?.email}). I want to upgrade to Unlimited Monthly/Yearly Teacher Plan.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                Upgrade on WhatsApp ({ADMIN_WHATSAPP_NUMBER})
              </a>
            </div>
          )}

          {/* Super Admin Teacher Filter or Teacher Account Status Banner */}
          {currentUser?.isSuperAdmin ? (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">Super Admin Mode: Multi-Teacher Inspection</p>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    Filter dashboard metrics and test series by specific teacher account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter Teacher:</span>
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                >
                  <option value="all">🌐 All Teachers ({tests.length} Tests)</option>
                  {teachers.map((tch, tchIdx) => {
                    const tchTestCount = tests.filter(
                      (t) =>
                        t.teacherId?.toLowerCase() === tch.email.toLowerCase() ||
                        t.teacherId?.toLowerCase() === tch.accessPasscode.toLowerCase()
                    ).length;
                    return (
                      <option key={tch.id || tch.email || `tch-${tchIdx}`} value={tch.email}>
                        👨‍🏫 {tch.name} ({tch.email}) - {tchTestCount} tests
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : null}



          {/* Expiring Soon Banner */}
          {expiringSoonTests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Upcoming Test Expiries Alert</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {expiringSoonTests.length} test link(s) will expire within 48 hours. Extend link expiry in Test Settings if needed.
                  </p>
                </div>
              </div>
            </div>
          )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Mock Tests</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalTests}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for student access</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Attempts</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalAttempts}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Completed student tests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Class Average Score</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{avgScorePercent}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all test submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Test Links</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Link className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeLinksCount}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Active shareable URLs</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subject Performance Analysis</h3>
              <p className="text-xs text-slate-500">Average student score (%) by subject</p>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                  formatter={(val: any) => [`${val}%`, 'Avg Score']}
                />
                <Bar dataKey="avgScore" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Pass vs Needs Review</h3>
            <p className="text-xs text-slate-500 mb-2">Percentage of passed vs failed test attempts</p>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">
                  {displayAttempts.length > 0 ? displayAttempts.length : 24}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Attempts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100">
            {passFailData.map((d, dIdx) => (
              <div key={d.name || `pf-${dIdx}`} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-semibold text-slate-700">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tests Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Mock Test Series</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage test settings, preview questions, copy share links, or view student submissions.
            </p>
          </div>

          <button
            onClick={onOpenCreateWizard}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Test
          </button>
        </div>

        {displayTests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No mock tests created for this teacher panel yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first test or import questions from Word/Excel documents to get started.
            </p>
            <button
              onClick={onOpenCreateWizard}
              className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs hover:bg-blue-700 transition"
            >
              Create Test Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Test Title & Subject</th>
                  <th className="py-3.5 px-4">Questions & Marks</th>
                  <th className="py-3.5 px-4">Duration & Expiry</th>
                  <th className="py-3.5 px-4">Attempts</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {displayTests.map((test, tIdx) => {
                  const testAttempts = attempts.filter((a) => a.testId === test.id);
                  const isExpired =
                    test.expiryDate && new Date(test.expiryDate).getTime() < Date.now();

                  return (
                    <tr key={test.id || `test-${tIdx}`} className="hover:bg-slate-50/60 transition group">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{test.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {test.subject}
                          </span>
                          {!test.isPublished && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700">
                        <div>{test.questions.length} Questions</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{test.totalMarks} Total Marks</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{test.durationMinutes} mins</div>
                        <div className="mt-1">
                          {test.expiryDate ? (
                            <CountdownTimer targetDateISO={test.expiryDate} compact />
                          ) : (
                            <span className="text-[11px] text-slate-400">No Expiry</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => onViewAnalytics(test)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {testAttempts.length} Submissions
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Share Link Button */}
                          <button
                            onClick={() => handleCopyLink(test.id)}
                            title="Copy Share Link"
                            className={`p-2 rounded-xl border transition ${
                              copiedId === test.id
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                            }`}
                          >
                            {copiedId === test.id ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => setSelectedQrTest(test)}
                            title="Show QR Code"
                            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Take Test View / Open Link */}
                          <a
                            href={getShareUrl(test.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                                e.preventDefault();
                                setActiveTestId(test.id);
                                setMode('student');
                              }
                            }}
                            title="Try Test as Student (Click) or Open in New Tab"
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-2xs inline-flex items-center justify-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Clone Test */}
                          <button
                            onClick={() => cloneTest(test.id)}
                            title="Duplicate Test"
                            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>

                          {/* Edit Test */}
                          <button
                            onClick={() => onEditTest(test)}
                            title="Edit Test Settings & Questions"
                            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Delete Test */}
                          <button
                            onClick={() => setTestToDelete(test)}
                            title="Delete Test"
                            className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQrTest && (
        <QRCodeModal
          testTitle={selectedQrTest.title}
          shareUrl={getShareUrl(selectedQrTest.id)}
          isOpen={Boolean(selectedQrTest)}
          onClose={() => setSelectedQrTest(null)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {testToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Delete Test Series?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{testToDelete.title}"</span>? All questions and student attempt data associated with this test will be permanently removed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTestToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTest(testToDelete.id);
                  setTestToDelete(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}


        </>
      )}
      {/* Admin Login Modal */}
      <AdminLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

