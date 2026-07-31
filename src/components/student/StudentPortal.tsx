import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MockTest, StudentInfo } from '../../types';
import { TestRunner } from './TestRunner';
import { TestResultView } from './TestResultView';
import { StudentExitScreen } from './StudentExitScreen';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
import { MockTestProLogo } from '../common/MockTestProLogo';
import { cleanTestId } from '../../utils/cleanTestId';
import {
  GraduationCap,
  Clock,
  ShieldCheck,
  AlertCircle,
  User,
  Mail,
  Phone,
  ArrowRight,
  FileText,
  Search,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  Megaphone,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    tests,
    activeTest,
    activeTestId,
    isFetchingActiveTest,
    setActiveTestId,
    activeAttempt,
    setActiveAttempt,
    submitTestAttempt,
    teachers,
    currentUser,
  } = useApp();

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
  });

  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string; name?: string }>({});

  const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  if (isFetchingActiveTest) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-extrabold text-slate-900">Loading Requested Mock Test...</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Please wait a moment while we retrieve the examination questions from the server.
        </p>
      </div>
    );
  }

  // Filter tests: if real teacher tests exist, remove sample demo tests
  const sampleIds = ['test-jee-physics-01', 'test-cs-aptitude-02'];
  const realTeacherTests = tests.filter((t) => !sampleIds.includes(t.id));
  const baseTests = realTeacherTests.length > 0 ? realTeacherTests : tests;

  // If no test is selected:
  if (!activeTest) {
    const publishedTests = baseTests.filter((t) => Boolean(t.isPublished));

    // If a direct test link was shared, restrict display to matched test if available
    let displayTests = publishedTests;
    const validTargetId = cleanTestId(activeTestId);

    if (validTargetId) {
      const targeted = publishedTests.filter((t) => {
        if (!t || !t.id) return false;
        const cId = cleanTestId(t.id);
        return (
          t.id === validTargetId ||
          cId === validTargetId ||
          (Boolean(cId) && cId === validTargetId) ||
          t.id.toLowerCase() === validTargetId.toLowerCase()
        );
      });
      if (targeted.length > 0) {
        displayTests = targeted;
      }
    }

    const subjects = ['All', ...Array.from(new Set(displayTests.map((t) => t.subject).filter(Boolean)))];

    const filteredTests = displayTests.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });

    const isInvalidLink = Boolean(validTargetId && !activeTest);

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-300">
        {/* Invalid Link Alert Banner */}
        {isInvalidLink && (
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800 shadow-sm mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                  Mock Test Link Not Found (<code className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono text-xs">#test/{validTargetId}</code>)
                </span>
                <span className="text-xs text-slate-600">
                  This test link may have expired or been removed. Explore all live mock tests available below.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTestId(null)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              Clear Invalid Hash
            </button>
          </div>
        )}
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 rounded-3xl border border-slate-800 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <GraduationCap className="w-4 h-4" /> Student Examination & Practice Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Available Online Mock Tests</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Select a mock test below to begin your timed examination attempt. Instant detailed analysis & PDF scorecard provided upon submission.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shrink-0">
            <BookOpen className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Total Active Tests</span>
              <span className="text-xl font-extrabold text-white">{displayTests.length} Mock Tests</span>
            </div>
          </div>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title, subject..."
              className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition duration-200 ${
                  selectedSubject === subj
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Test List Cards Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Mock Tests Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or subject filters to locate your test.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTests.map((test) => {
              const isExpired = test.expiryDate && new Date(test.expiryDate).getTime() < Date.now();
              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                        {test.subject || 'General Subject'}
                      </span>
                      {isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{test.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{test.description}</p>
                  </div>

                  {/* Metadata Bar */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl mb-4">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Items</span>
                        <span className="text-xs font-bold text-slate-800">{test.questions.length} Qs</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Duration</span>
                        <span className="text-xs font-bold text-slate-800">{test.durationMinutes} Mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Marks</span>
                        <span className="text-xs font-bold text-blue-600">{test.totalMarks} Marks</span>
                      </div>
                    </div>

                    <button
                      disabled={Boolean(isExpired)}
                      onClick={() => setActiveTestId(test.id)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition duration-200 ${
                        isExpired
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {isExpired ? 'Test Expired' : 'Attempt Mock Test'}
                      {!isExpired && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (isExited) {
    return (
      <StudentExitScreen
        test={activeTest}
        studentInfo={studentInfo}
        onReturnHome={() => {
          setIsExited(false);
          setActiveAttempt(null);
          setActiveTestId(null);
        }}
      />
    );
  }

  // Check Expiry
  const isExpired = activeTest.expiryDate && new Date(activeTest.expiryDate).getTime() < Date.now();

  if (activeAttempt) {
    return (
      <TestResultView
        attempt={activeAttempt}
        onRetake={() => setActiveAttempt(null)}
        onExit={() => setIsExited(true)}
      />
    );
  }

  if (isExpired) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Test Link Expired</h2>
        <p className="text-xs text-slate-500">
          This test link expired on {new Date(activeTest.expiryDate!).toLocaleString()}. Please contact your teacher for an updated link.
        </p>
        <button
          onClick={() => setActiveTestId(null)}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition duration-200"
        >
          ← Return to All Mock Tests
        </button>
      </div>
    );
  }

  const handlePhoneChange = (val: string) => {
    // Only allow numeric digits, max 10
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setStudentInfo((prev) => ({ ...prev, phone: digitsOnly }));

    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setFormErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 numeric digits.' }));
    } else {
      setFormErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleEmailChange = (val: string) => {
    setStudentInfo((prev) => ({ ...prev, email: val }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.trim() && !emailRegex.test(val.trim())) {
      setFormErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = studentInfo.name.trim();
    const emailTrim = studentInfo.email.trim();
    const phoneTrim = studentInfo.phone.trim();

    const newErrors: { email?: string; phone?: string; name?: string } = {};

    if (!nameTrim) {
      newErrors.name = 'Full Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      newErrors.email = 'Please enter a valid email address (e.g. student@gmail.com).';
    }

    if (!phoneTrim || phoneTrim.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 numeric digits.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});
    setIsTestStarted(true);
  };

  if (isTestStarted) {
    return (
      <TestRunner
        test={activeTest}
        student={studentInfo}
        onComplete={(attempt) => {
          submitTestAttempt(attempt);
          setIsTestStarted(false);
        }}
      />
    );
  }

  // Resolve matching teacher branding or custom test branding for top bar header
  const matchingTeacher = activeTest
    ? teachers.find(
        (t) =>
          t.id === activeTest.teacherId ||
          t.email.toLowerCase() === activeTest.teacherId.toLowerCase()
      )
    : null;

  const coachingLogo =
    activeTest.coachingLogoUrl ||
    matchingTeacher?.coachingLogoUrl ||
    currentUser?.coachingLogoUrl ||
    '';

  const coachingName =
    activeTest.coachingName ||
    matchingTeacher?.instituteName ||
    currentUser?.instituteName ||
    'MockTest Pro';

  const coachingTagline =
    activeTest.coachingTagline ||
    matchingTeacher?.coachingTagline ||
    currentUser?.coachingTagline ||
    'Official Online Examination Series';

  return (
    <div className="min-h-screen bg-slate-100/70 pb-12 animate-in fade-in duration-300">
      {/* SUB-HEADER STRIP (TEST METADATA: QUESTIONS, MARKS, TIME, EXPIRY) */}
      <div className="bg-white border-b border-slate-200 shadow-xs py-3 px-4 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Metadata Cards: Questions, Marks, Time Limit, Marking Scheme */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-1">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Total Questions</span>
                <span className="font-extrabold text-slate-900 text-xs">{activeTest.questions.length} Items</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Total Marks</span>
                <span className="font-extrabold text-indigo-700 text-xs">{activeTest.totalMarks} Marks</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Time Limit</span>
                <span className="font-extrabold text-emerald-700 text-xs">{activeTest.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Marking Scheme</span>
                <span className="font-extrabold text-purple-700 text-xs">
                  +{activeTest.questions[0]?.positiveMarks ?? 1} / -{activeTest.questions[0]?.negativeMarks ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Far Right: Link Expiry Date & Time */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase block leading-none">Link Expiry</span>
              <span className="font-extrabold text-xs text-amber-950">
                {activeTest.expiryDate
                  ? new Date(activeTest.expiryDate).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Active (No Expiry)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT: LEFT SIDEBAR AD, CENTER VERIFICATION FORM, RIGHT SIDEBAR AD */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setIsExited(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" /> Exit Test View (निकास)
          </button>
        </div>

        {/* Featured Top Promo Course Ad Banner (If configured by teacher) */}
        {activeTest.startAd?.enabled && (activeTest.startAd.title || activeTest.startAd.imageUrl) && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-0.5 rounded-2xl shadow-xs animate-in fade-in duration-300">
            <div className="bg-white rounded-[15px] overflow-hidden p-4 sm:p-6 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" /> Featured Course Offer (कोर्स सूचना)
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {activeTest.startAd.title || 'Special Online Course Offer'}
                </h2>
                {activeTest.startAd.description && (
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {activeTest.startAd.description}
                  </p>
                )}
                {activeTest.startAd.courseUrl && (
                  <a
                    href={formatExternalUrl(activeTest.startAd.courseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                  >
                    {activeTest.startAd.buttonText || '👉 Enroll in Course Now'}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              {activeTest.startAd.imageUrl && (
                <a
                  href={formatExternalUrl(activeTest.startAd.courseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative shrink-0 w-full md:w-56 h-32 rounded-xl overflow-hidden border border-amber-300 shadow-md hover:border-amber-400 transition"
                >
                  <img
                    src={activeTest.startAd.imageUrl}
                    alt="Promotional Banner"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR AD BANNER */}
          <div className="lg:col-span-3 space-y-4">
            {activeTest.leftAd?.enabled && (activeTest.leftAd.imageUrl || activeTest.leftAd.title) ? (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2 sticky top-20">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wider">
                    Sponsored Ad / विज्ञापन
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">300×600 Banner</span>
                </div>

                <a
                  href={formatExternalUrl(activeTest.leftAd.courseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-1"
                >
                  {activeTest.leftAd.imageUrl && (
                    <img
                      src={activeTest.leftAd.imageUrl}
                      alt={activeTest.leftAd.title || 'Left Ad Banner'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Hide image if it fails to load, showing the stylized fallback banner beneath
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-auto max-h-[480px] object-cover rounded-lg group-hover:scale-102 transition duration-200"
                    />
                  )}

                  <div className="p-3 text-left space-y-2">
                    {activeTest.leftAd.title && (
                      <p className="text-xs font-black text-white leading-snug group-hover:text-amber-300 transition">
                        {activeTest.leftAd.title}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                      Explore Course Link <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="hidden lg:block sticky top-20">
                <MockTestProLogo
                  logoUrl={coachingLogo}
                  name={coachingName}
                  tagline={coachingTagline || 'Official Online Mock Test Portal'}
                  variant="hero"
                />
              </div>
            )}
          </div>

          {/* CENTER COLUMN: STUDENT VERIFICATION FORM */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-4 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold mb-2">
                  <GraduationCap className="w-4 h-4" /> Student Exam Registration
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Student Verification Details</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your verification information to start your timed examination attempt.
                </p>
              </div>

              <form onSubmit={handleStart} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (पूरा नाम) *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs font-semibold pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (ईमेल आईडी) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={studentInfo.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. rahul.sharma@gmail.com"
                      className={`w-full text-xs font-semibold pl-10 pr-3 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        formErrors.email
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {formErrors.email ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Scorecard report link will be sent to this email.</p>
                  )}
                </div>

                {/* Indian 10-Digit Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (10 डिजिट मोबाइल नंबर) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 border-r border-slate-300 pr-2">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={studentInfo.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="9876543210"
                      className={`w-full text-xs font-bold tracking-wider pl-14 pr-3 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        formErrors.phone
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {formErrors.phone ? (
                    <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter 10 numeric digits only (e.g. 9876543210).
                    </p>
                  )}
                </div>

                {/* Submit / Start Test Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition transform active:scale-98 flex items-center justify-center gap-2"
                >
                  Start Timed Test Now <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDEBAR AD BANNER */}
          <div className="lg:col-span-3 space-y-4">
            {activeTest.rightAd?.enabled && (activeTest.rightAd.imageUrl || activeTest.rightAd.title) ? (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2 sticky top-20">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                    Sponsored Ad / विज्ञापन
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">300×600 Banner</span>
                </div>

                <a
                  href={formatExternalUrl(activeTest.rightAd.courseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md transition relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-1"
                >
                  {activeTest.rightAd.imageUrl && (
                    <img
                      src={activeTest.rightAd.imageUrl}
                      alt={activeTest.rightAd.title || 'Right Ad Banner'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-auto max-h-[480px] object-cover rounded-lg group-hover:scale-102 transition duration-200"
                    />
                  )}

                  <div className="p-3 text-left space-y-2">
                    {activeTest.rightAd.title && (
                      <p className="text-xs font-black text-white leading-snug group-hover:text-amber-300 transition">
                        {activeTest.rightAd.title}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                      Explore Course Link <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 sticky top-20">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Exam Rules
                </h3>
                <ul className="text-xs text-slate-600 space-y-2.5 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span><strong>Live Timer:</strong> Test auto-submits when time reaches 00:00.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span><strong>Question Palette:</strong> Status colors update based on response status.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span><strong>Scorecard:</strong> Instant marks breakdown and rank report on submission.</span>
                  </li>
                </ul>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-extrabold text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Proctoring Enabled
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    Switching browser tabs or windows during test will be flagged as violation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

