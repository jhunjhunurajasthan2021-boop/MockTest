import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MockTest, StudentInfo } from '../../types';
import { TestRunner } from './TestRunner';
import { TestResultView } from './TestResultView';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
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
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  Megaphone,
  ExternalLink,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { tests, activeTest, activeTestId, setActiveTestId, activeAttempt, setActiveAttempt, submitTestAttempt } = useApp();

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
  });

  const [isTestStarted, setIsTestStarted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // If no test is selected (or if requested test link was not found):
  if (!activeTest) {
    const publishedTests = tests.filter((t) => t.isPublished);
    const displayTests = publishedTests.length > 0 ? publishedTests : tests;

    const subjects = ['All', ...Array.from(new Set(displayTests.map((t) => t.subject).filter(Boolean)))];

    const filteredTests = displayTests.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });

    const isInvalidLink = Boolean(activeTestId && !activeTest);

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
                  Mock Test Link Not Found (<code className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono text-xs">#test/{activeTestId}</code>)
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

  // Check Expiry
  const isExpired = activeTest.expiryDate && new Date(activeTest.expiryDate).getTime() < Date.now();

  if (activeAttempt) {
    return <TestResultView attempt={activeAttempt} onRetake={() => setActiveAttempt(null)} />;
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

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.name.trim() || !studentInfo.email.trim() || !studentInfo.phone.trim()) {
      alert('Please fill in your Name, Email, and Phone Number.');
      return;
    }
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Coaching Institute Branding Header */}
      <CoachingBrandingHeader test={activeTest} variant="hero" className="mb-6" />

      {/* Only show Back button if no specific test link was opened */}
      {!activeTestId && (
        <button
          onClick={() => setActiveTestId(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 mb-4 transition duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Available Tests
        </button>
      )}

      {/* Test Hero Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-slate-900 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3">
          <GraduationCap className="w-4 h-4" /> Official Online Examination Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{activeTest.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words">{activeTest.description}</p>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Questions</span>
            <span className="font-black text-slate-900 text-sm">{activeTest.questions.length} Items</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Total Marks</span>
            <span className="font-black text-blue-700 text-sm">{activeTest.totalMarks} Marks</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Time Limit</span>
            <span className="font-black text-emerald-700 text-sm">{activeTest.durationMinutes} Minutes</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Marking Scheme</span>
            <span className="font-black text-purple-700 text-sm">+{activeTest.questions[0]?.positiveMarks || 1} / -{activeTest.questions[0]?.negativeMarks || 0}</span>
          </div>
        </div>
      </div>

      {/* Promotional Course Ad Banner (If Enabled by Teacher) */}
      {activeTest.startAd?.enabled && (activeTest.startAd.title || activeTest.startAd.imageUrl) && (
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 p-0.5 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-[15px] overflow-hidden p-6 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5 text-amber-600" /> Featured Course Offer (प्रायोजित कोर्स संदेश)
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {activeTest.startAd.title || 'Special Online Course Offer'}
              </h2>
              {activeTest.startAd.description && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {activeTest.startAd.description}
                </p>
              )}

              {activeTest.startAd.courseUrl && (
                <a
                  href={activeTest.startAd.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {activeTest.startAd.buttonText || '👉 Enroll in Course Now'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Banner Image Preview / Clickable Thumbnail */}
            {activeTest.startAd.imageUrl && (
              <a
                href={activeTest.startAd.courseUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative shrink-0 w-full md:w-64 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl hover:border-amber-300 transition"
              >
                <img
                  src={activeTest.startAd.imageUrl}
                  alt="Promotional Banner"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition flex items-center justify-center">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    Click to Open Course <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Registration Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Verification Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              No login required. Enter your contact info to receive your scorecard report card.
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={studentInfo.name}
                  onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={studentInfo.email}
                  onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                  placeholder="alex.johnson@student.edu"
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  value={studentInfo.phone}
                  onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                  placeholder="+1 (555) 000-1234"
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2"
            >
              Start Timed Test Now <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Exam Guidelines Side Card */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Exam Rules
          </h3>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>
                <strong>Live Timer:</strong> Test auto-submits when time reaches 00:00.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>
                <strong>Question Palette:</strong> Palette color changes automatically based on response status.
              </span>
            </li>
            {activeTest.settings.preventTabSwitching && (
              <li className="flex items-start gap-2 text-amber-800 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Cheating Proctoring Enabled:</strong> Switching browser tabs will log a violation warning.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

