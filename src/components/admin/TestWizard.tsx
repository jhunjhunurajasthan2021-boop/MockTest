import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MockTest, Question, TestSettings, PromoAdConfig, TestType, TestSection } from '../../types';
import { ManualQuestionForm } from './ManualQuestionForm';
import { WordImportModal } from './WordImportModal';
import { ExcelImportModal } from './ExcelImportModal';
import { FormattedText } from '../common/FormattedText';
import { downloadSampleDocxFile } from '../../utils/sampleDocxGenerator';
import { CountdownTimer } from '../common/CountdownTimer';
import { QRCodeModal } from '../common/QRCodeModal';
import {
  FileText,
  Clock,
  Settings,
  Plus,
  FileSpreadsheet,
  FileText as WordIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Sparkles,
  Download,
  Megaphone,
  ExternalLink,
  Image,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface TestWizardProps {
  initialTest?: MockTest | null;
  onClose: () => void;
}

export const TestWizard: React.FC<TestWizardProps> = ({ initialTest, onClose }) => {
  const { createOrUpdateTest, currentUser, setActiveTestId, setMode } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form States
  const [testType, setTestType] = useState<TestType>(initialTest?.testType || 'subjective');
  const [sections, setSections] = useState<TestSection[]>(
    initialTest?.sections || []
  );
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDuration, setNewSectionDuration] = useState<number>(20);
  const [newSectionPosMarks, setNewSectionPosMarks] = useState<number>(1);
  const [newSectionNegMarks, setNewSectionNegMarks] = useState<number>(0.25);

  const [title, setTitle] = useState(initialTest?.title || '');
  const [description, setDescription] = useState(initialTest?.description || '');
  const [subject, setSubject] = useState(initialTest?.subject || 'Physics & Chemistry');
  const [durationMinutes, setDurationMinutes] = useState(initialTest?.durationMinutes || 30);
  const [expiryDate, setExpiryDate] = useState(
    initialTest?.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [isPublished, setIsPublished] = useState(initialTest?.isPublished ?? true);

  const [settings, setSettings] = useState<TestSettings>(
    initialTest?.settings || {
      shuffleQuestions: true,
      shuffleOptions: false,
      showResultImmediately: true,
      allowMultipleAttempts: true,
      enableNegativeMarking: true,
      preventTabSwitching: true,
      passingPercentage: 40,
      showSolutionsToStudent: true,
    }
  );

  // Course Promotional Ad Banner States
  const [startAd, setStartAd] = useState<PromoAdConfig>(
    initialTest?.startAd || {
      enabled: false,
      title: '🚀 Special Course Offer: Complete Master Class Batch',
      description: 'Enroll now to get full video lectures, PDF notes & 50+ mock test series.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      courseUrl: 'https://jhunjhunucoaching.com/courses',
      buttonText: '👉 Join Course Now',
    }
  );

  const [resultAd, setResultAd] = useState<PromoAdConfig>(
    initialTest?.resultAd || {
      enabled: false,
      title: '🎓 Recommended Next Step: Advanced Exam Crash Course',
      description: 'Strengthen your weak topics with 1-on-1 doubt resolution & daily practice sets.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      courseUrl: 'https://jhunjhunucoaching.com/crash-course',
      buttonText: '👉 Explore Course Details',
    }
  );

  // Step 2 Questions State
  const [questions, setQuestions] = useState<Question[]>(initialTest?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');

  // Section Management Handlers
  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      alert('Please enter section / subject name.');
      return;
    }
    const newSec: TestSection = {
      id: `sec-${Date.now()}`,
      name: newSectionName.trim(),
      durationMinutes: newSectionDuration || 0,
      positiveMarks: newSectionPosMarks || 1,
      negativeMarks: newSectionNegMarks || 0,
    };
    setSections([...sections, newSec]);
    setNewSectionName('');
  };

  const handleDeleteSection = (secId: string) => {
    setSections(sections.filter((s) => s.id !== secId));
  };

  const handleApplyPresetTemplate = (preset: 'banking' | 'ssc' | 'jee') => {
    if (preset === 'banking') {
      setSections([
        { id: `sec-b1-${Date.now()}`, name: 'Reasoning Ability', durationMinutes: 20, positiveMarks: 1, negativeMarks: 0.25 },
        { id: `sec-b2-${Date.now()}`, name: 'Quantitative Aptitude', durationMinutes: 20, positiveMarks: 1, negativeMarks: 0.25 },
        { id: `sec-b3-${Date.now()}`, name: 'English Language', durationMinutes: 20, positiveMarks: 1, negativeMarks: 0.25 },
      ]);
      setDurationMinutes(60);
      setSubject('Banking Prelims Full Length');
    } else if (preset === 'ssc') {
      setSections([
        { id: `sec-s1-${Date.now()}`, name: 'General Intelligence & Reasoning', durationMinutes: 15, positiveMarks: 2, negativeMarks: 0.5 },
        { id: `sec-s2-${Date.now()}`, name: 'Quantitative Aptitude', durationMinutes: 15, positiveMarks: 2, negativeMarks: 0.5 },
        { id: `sec-s3-${Date.now()}`, name: 'English Comprehension', durationMinutes: 15, positiveMarks: 2, negativeMarks: 0.5 },
        { id: `sec-s4-${Date.now()}`, name: 'General Awareness', durationMinutes: 15, positiveMarks: 2, negativeMarks: 0.5 },
      ]);
      setDurationMinutes(60);
      setSubject('SSC CGL Full Mock');
    } else if (preset === 'jee') {
      setSections([
        { id: `sec-j1-${Date.now()}`, name: 'Physics', durationMinutes: 60, positiveMarks: 4, negativeMarks: 1 },
        { id: `sec-j2-${Date.now()}`, name: 'Chemistry', durationMinutes: 60, positiveMarks: 4, negativeMarks: 1 },
        { id: `sec-j3-${Date.now()}`, name: 'Mathematics', durationMinutes: 60, positiveMarks: 4, negativeMarks: 1 },
      ]);
      setDurationMinutes(180);
      setSubject('JEE Main Full Length');
    }
  };

  // Bulk Range Section Assignment States & Handlers
  const [rangeInputs, setRangeInputs] = useState<Record<string, { from: number; to: number }>>({});

  const handleAssignRangeToSection = (targetSecId: string, fromNum: number, toNum: number) => {
    if (questions.length === 0) return;
    if (fromNum < 1 || toNum < fromNum || fromNum > questions.length) {
      alert(`Invalid range! Please enter valid question numbers between 1 and ${questions.length}.`);
      return;
    }
    const endNum = Math.min(toNum, questions.length);
    const targetSec = sections.find((s) => s.id === targetSecId);
    if (!targetSec) return;

    const updated = questions.map((q, idx) => {
      const qNum = idx + 1;
      if (qNum >= fromNum && qNum <= endNum) {
        return {
          ...q,
          sectionId: targetSec.id,
          subject: targetSec.name,
          positiveMarks: targetSec.positiveMarks,
          negativeMarks: targetSec.negativeMarks,
        };
      }
      return q;
    });

    setQuestions(updated);
  };

  const handleAutoDistributeQuestions = () => {
    if (questions.length === 0 || sections.length === 0) {
      alert('Please add sections and questions first.');
      return;
    }
    const perSec = Math.floor(questions.length / sections.length);
    const remainder = questions.length % sections.length;

    let currentIndex = 0;
    const newQuestions = [...questions];
    const newRangeInputs: Record<string, { from: number; to: number }> = {};

    sections.forEach((sec, sIdx) => {
      const countForThisSec = perSec + (sIdx < remainder ? 1 : 0);
      const startNum = currentIndex + 1;
      const endNum = currentIndex + countForThisSec;

      newRangeInputs[sec.id] = { from: startNum, to: endNum };

      for (let i = currentIndex; i < endNum && i < newQuestions.length; i++) {
        newQuestions[i] = {
          ...newQuestions[i],
          sectionId: sec.id,
          subject: sec.name,
          positiveMarks: sec.positiveMarks,
          negativeMarks: sec.negativeMarks,
        };
      }

      currentIndex = endNum;
    });

    setQuestions(newQuestions);
    setRangeInputs(newRangeInputs);
  };

  const handleApplyAllSectionRanges = () => {
    if (questions.length === 0 || sections.length === 0) return;

    const newQuestions = [...questions];

    sections.forEach((sec) => {
      const range = rangeInputs[sec.id];
      if (range) {
        const fromNum = Math.max(1, range.from);
        const toNum = Math.min(questions.length, range.to);

        for (let idx = 0; idx < newQuestions.length; idx++) {
          const qNum = idx + 1;
          if (qNum >= fromNum && qNum <= toNum) {
            newQuestions[idx] = {
              ...newQuestions[idx],
              sectionId: sec.id,
              subject: sec.name,
              positiveMarks: sec.positiveMarks,
              negativeMarks: sec.negativeMarks,
            };
          }
        }
      }
    });

    setQuestions(newQuestions);
  };

  // Step 3 Share States
  const [savedTestId, setSavedTestId] = useState<string | null>(initialTest?.id || null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Calculate Total Marks
  const calculatedTotalMarks = questions.reduce((sum, q) => sum + q.positiveMarks, 0);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a test title.');
      return;
    }
    if (testType === 'full' && sections.length === 0) {
      alert('Please add at least 1 section for Full Mock Test, or use a template.');
      return;
    }
    setStep(2);
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      setQuestions(questions.map((item) => (item.id === q.id ? q : item)));
      setEditingQuestion(null);
    } else {
      setQuestions([...questions, q]);
    }
    setShowManualForm(false);
  };

  const handleBulkImport = (imported: Omit<Question, 'id'>[]) => {
    const formatted: Question[] = imported.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
    }));
    setQuestions([...questions, ...formatted]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handlePublishTest = () => {
    if (questions.length === 0) {
      alert('Please add at least 1 question before publishing test.');
      return;
    }

    const testId = savedTestId || `test-${Date.now()}`;

    // Auto-compute test duration if sections have durations
    const computedDuration =
      testType === 'full' && sections.length > 0 && sections.some((s) => s.durationMinutes > 0)
        ? sections.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
        : durationMinutes;

    const newTest: MockTest = {
      id: testId,
      title: title.trim(),
      description: description.trim(),
      subject: testType === 'full' ? 'Full Length Exam' : subject.trim(),
      testType,
      sections: testType === 'full' ? sections : undefined,
      totalMarks: calculatedTotalMarks || 10,
      durationMinutes: computedDuration,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      settings,
      startAd: startAd.enabled ? startAd : { enabled: false },
      resultAd: resultAd.enabled ? resultAd : { enabled: false },
      coachingLogoUrl: initialTest?.coachingLogoUrl || currentUser?.coachingLogoUrl,
      coachingName: initialTest?.coachingName || currentUser?.instituteName,
      coachingTagline: initialTest?.coachingTagline || currentUser?.coachingTagline,
      questions,
      createdAt: initialTest?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teacherId: initialTest?.teacherId || currentUser?.email || currentUser?.accessPasscode || 'teacher-admin-01',
      isPublished,
    };

    createOrUpdateTest(newTest);
    setSavedTestId(testId);
    setStep(3);
  };

  const shareUrl = savedTestId
    ? `${window.location.origin}${window.location.pathname}#test/${savedTestId}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestLinkAsStudent = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!savedTestId) return;
    setActiveTestId(savedTestId);
    setMode('student');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Wizard Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-2xl text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {initialTest ? 'Edit Mock Test Series' : 'Create New Mock Test Series'}
              </h2>
              <p className="text-xs text-slate-400">
                Step {step} of 3: {step === 1 ? 'Test Setup & Timing' : step === 2 ? 'Add / Import Questions' : 'Publish & Share Link'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>1</span>
            1. Test Settings
          </div>
          <div className="h-0.5 w-12 bg-slate-300 hidden sm:block" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>2</span>
            2. Questions ({questions.length})
          </div>
          <div className="h-0.5 w-12 bg-slate-300 hidden sm:block" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>3</span>
            3. Share Link
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <form id="step-1-form" onSubmit={handleStep1Next} className="space-y-6">
              {/* Test Category / Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> Choose Test Type (मॉक टेस्ट का प्रकार चुनें) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subjective Mock Option */}
                  <div
                    onClick={() => setTestType('subjective')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                      testType === 'subjective'
                        ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${testType === 'subjective' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        Subjective / Single Subject Mock
                        {testType === 'subjective' && <CheckCircle2 className="w-4 h-4 text-blue-600 inline" />}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        विषयवार टेस्ट (Single subject or topic, e.g. Reasoning, Physics). Standard common timing and marking.
                      </p>
                    </div>
                  </div>

                  {/* Full Mock Option */}
                  <div
                    onClick={() => {
                      setTestType('full');
                      if (sections.length === 0) {
                        handleApplyPresetTemplate('banking');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                      testType === 'full'
                        ? 'bg-purple-50/80 border-purple-600 shadow-sm ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${testType === 'full' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        Full Mock Test (Multi-Section)
                        {testType === 'full' && <CheckCircle2 className="w-4 h-4 text-purple-600 inline" />}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        पूर्ण मॉक टेस्ट (Multi-subject, e.g. SBI PO, SSC CGL, JEE). Configure individual section timing, +ve & -ve marks per subject!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Section Configurator for Full Mock Tests */}
              {testType === 'full' && (
                <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-600" /> Test Sections & Subject Timings
                      </h4>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Add subjects, set custom section timers and positive/negative marks for each subject.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-purple-700">Quick Templates:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('banking')}
                        className="text-[10px] font-bold px-2.5 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-2xs"
                      >
                        🏦 Banking (3 Sec)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('ssc')}
                        className="text-[10px] font-bold px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-2xs"
                      >
                        🏛️ SSC CGL (4 Sec)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetTemplate('jee')}
                        className="text-[10px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-2xs"
                      >
                        ⚡ JEE (3 Sec)
                      </button>
                    </div>
                  </div>

                  {/* Section List Table */}
                  {sections.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-purple-900 px-3 py-1 bg-purple-100/70 rounded-lg">
                        <div className="col-span-4">Section / Subject</div>
                        <div className="col-span-3 text-center">Timer (Mins)</div>
                        <div className="col-span-2 text-center">+ Marks</div>
                        <div className="col-span-2 text-center">- Marks</div>
                        <div className="col-span-1 text-center">Action</div>
                      </div>

                      {sections.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <div className="col-span-4 font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{sec.name}</span>
                          </div>

                          <div className="col-span-3 text-center text-purple-900 font-mono font-bold text-[11px]">
                            {sec.durationMinutes ? `${sec.durationMinutes} mins` : 'Shared'}
                          </div>

                          <div className="col-span-2 text-center text-emerald-700 font-mono font-bold text-[11px]">
                            +{sec.positiveMarks}
                          </div>

                          <div className="col-span-2 text-center text-rose-700 font-mono font-bold text-[11px]">
                            -{sec.negativeMarks}
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-purple-800 italic">No sections added yet. Click a template above or create custom section below.</p>
                  )}

                  {/* Add New Section Inline Form */}
                  <div className="bg-white p-3 rounded-xl border border-purple-300 space-y-2">
                    <label className="block text-[11px] font-extrabold text-purple-900">Add Custom Subject / Section (नया अनुभाग जोड़ें)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="e.g. General Awareness"
                        className="sm:col-span-4 text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="sm:col-span-3 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">Time:</span>
                        <input
                          type="number"
                          min="0"
                          value={newSectionDuration}
                          onChange={(e) => setNewSectionDuration(parseInt(e.target.value) || 0)}
                          placeholder="Mins"
                          className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0">+</span>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={newSectionPosMarks}
                          onChange={(e) => setNewSectionPosMarks(parseFloat(e.target.value) || 0)}
                          className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-rose-600 shrink-0">-</span>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={newSectionNegMarks}
                          onChange={(e) => setNewSectionNegMarks(parseFloat(e.target.value) || 0)}
                          className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="sm:col-span-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs p-2 rounded-lg flex items-center justify-center transition"
                        title="Add Section"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Test Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. JEE Main Full Physics & Chemistry Mock Test #4"
                    className="w-full text-xs font-semibold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Stream *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics, Mathematics, GATE"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Test Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                    className="w-full text-xs font-bold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Test Instructions / Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide test instructions, marking scheme info, or guidelines for students..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Link Expiry & Passing Criteria */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" /> Link Expiry & Passing Criteria
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shareable Link Expiry Date & Time</label>
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setExpiryDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16))}
                        className="text-[10px] font-semibold px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        +24 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpiryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16))}
                        className="text-[10px] font-semibold px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Score Percentage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.passingPercentage}
                      onChange={(e) => setSettings({ ...settings, passingPercentage: parseInt(e.target.value) || 40 })}
                      className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Test Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" /> Exam Rules & Anti-Cheating Settings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50">
                    <span>Shuffle Questions Order</span>
                    <input
                      type="checkbox"
                      checked={settings.shuffleQuestions}
                      onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50">
                    <span>Shuffle Answer Options</span>
                    <input
                      type="checkbox"
                      checked={settings.shuffleOptions}
                      onChange={(e) => setSettings({ ...settings, shuffleOptions: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50">
                    <div>
                      <span className="block font-bold">Show Complete Scorecard to Student</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        If unchecked, student only sees submission confirmation and overall marks remain hidden.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showResultImmediately}
                      onChange={(e) => setSettings({ ...settings, showResultImmediately: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md shrink-0 ml-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50">
                    <div>
                      <span className="block font-bold">Show Detailed Solutions & Explanations (विस्तृत उत्तर दिखाएं)</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        If checked, students can review correct answer keys and step-by-step explanations after submitting.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showSolutionsToStudent !== false}
                      onChange={(e) => setSettings({ ...settings, showSolutionsToStudent: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md shrink-0 ml-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50">
                    <span>Prevent Tab Switching (Proctoring Alert)</span>
                    <input
                      type="checkbox"
                      checked={settings.preventTabSwitching}
                      onChange={(e) => setSettings({ ...settings, preventTabSwitching: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md"
                    />
                  </label>
                </div>
              </div>

              {/* Course Advertisement Banners Section */}
              <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Megaphone className="w-4 h-4 text-amber-600" /> Course Promotion Banners (विज्ञापन व कोर्स लिंक्स)
                  </div>
                  <span className="text-[10px] bg-amber-200/80 text-amber-950 font-black px-2 py-0.5 rounded-full">
                    BOOST ENROLLMENTS
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
                  Add custom promotional course banners with target links. Students clicking on the banner image will be redirected directly to your course page!
                </p>

                {/* Start Page Ad Settings */}
                <div className="bg-white/95 p-4 rounded-xl border border-amber-200/80 space-y-3 shadow-xs">
                  <label className="flex items-center justify-between text-xs font-extrabold text-slate-900 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-amber-600" /> Show Banner Ad on Student Test Start Page (टेस्ट शुरू पेज पर विज्ञापन)
                    </span>
                    <input
                      type="checkbox"
                      checked={startAd.enabled}
                      onChange={(e) => setStartAd({ ...startAd, enabled: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>

                  {startAd.enabled && (
                    <div className="space-y-3 pt-3 border-t border-amber-100 text-xs animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Banner Title / Headline *</label>
                        <input
                          type="text"
                          value={startAd.title || ''}
                          onChange={(e) => setStartAd({ ...startAd, title: e.target.value })}
                          placeholder="e.g. 🚀 Special 50% Off: Complete JEE Main Live Batch 2026"
                          className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Banner Image URL (इमेज लिंक) *</label>
                        <input
                          type="url"
                          value={startAd.imageUrl || ''}
                          onChange={(e) => setStartAd({ ...startAd, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-1523240795612-9a054b0db644..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Course Redirect Target Link *</label>
                          <input
                            type="url"
                            value={startAd.courseUrl || ''}
                            onChange={(e) => setStartAd({ ...startAd, courseUrl: e.target.value })}
                            placeholder="https://yourinstitute.com/course/jee-main"
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Button Text Label</label>
                          <input
                            type="text"
                            value={startAd.buttonText || ''}
                            onChange={(e) => setStartAd({ ...startAd, buttonText: e.target.value })}
                            placeholder="e.g. 👉 Enroll in Course Now"
                            className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description / Offer Info</label>
                        <input
                          type="text"
                          value={startAd.description || ''}
                          onChange={(e) => setStartAd({ ...startAd, description: e.target.value })}
                          placeholder="e.g. Get full video lectures, PDF notes & 50+ topic-wise test series."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Submission Page Ad Settings */}
                <div className="bg-white/95 p-4 rounded-xl border border-amber-200/80 space-y-3 shadow-xs">
                  <label className="flex items-center justify-between text-xs font-extrabold text-slate-900 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-amber-600" /> Show Banner Ad on Test Submission / Scorecard Page (रिजल्ट पेज पर विज्ञापन)
                    </span>
                    <input
                      type="checkbox"
                      checked={resultAd.enabled}
                      onChange={(e) => setResultAd({ ...resultAd, enabled: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>

                  {resultAd.enabled && (
                    <div className="space-y-3 pt-3 border-t border-amber-100 text-xs animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad Banner Title / Headline *</label>
                        <input
                          type="text"
                          value={resultAd.title || ''}
                          onChange={(e) => setResultAd({ ...resultAd, title: e.target.value })}
                          placeholder="e.g. 🎓 Recommended Next Step: Advanced Crash Course Batch"
                          className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Banner Image URL (इमेज लिंक) *</label>
                        <input
                          type="url"
                          value={resultAd.imageUrl || ''}
                          onChange={(e) => setResultAd({ ...resultAd, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-1516321318423-f06f85e504b3..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Course Redirect Target Link *</label>
                          <input
                            type="url"
                            value={resultAd.courseUrl || ''}
                            onChange={(e) => setResultAd({ ...resultAd, courseUrl: e.target.value })}
                            placeholder="https://yourinstitute.com/course/crash-course"
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Button Text Label</label>
                          <input
                            type="text"
                            value={resultAd.buttonText || ''}
                            onChange={(e) => setResultAd({ ...resultAd, buttonText: e.target.value })}
                            placeholder="e.g. 👉 Explore Course Details"
                            className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description / Offer Info</label>
                        <input
                          type="text"
                          value={resultAd.description || ''}
                          onChange={(e) => setResultAd({ ...resultAd, description: e.target.value })}
                          placeholder="e.g. Strengthen your weak topics with 1-on-1 doubt resolution & daily practice sets."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Section Tabs if Multi-Section Test */}
              {testType === 'full' && sections.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 space-y-2">
                  <div className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" /> Filter Questions by Section / Subject
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveSectionFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                        activeSectionFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      All Questions ({questions.length})
                    </button>

                    {sections.map((sec) => {
                      const qCount = questions.filter((q) => q.sectionId === sec.id).length;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setActiveSectionFilter(sec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                            activeSectionFilter === sec.id
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          <span>{sec.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              activeSectionFilter === sec.id ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {qCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bulk Question Range Splitter Box */}
              {testType === 'full' && sections.length > 0 && questions.length > 0 && (
                <div className="bg-purple-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-purple-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-300" /> Bulk Range Section Splitter (बल्क में प्रश्न अनुभाग असाइन करें)
                      </h4>
                      <p className="text-[11px] text-purple-200 mt-0.5">
                        कुल {questions.length} प्रश्नों में से कौन से प्रश्न किस अनुभाग/विषय के हैं (जैसे Q1 से Q40 Reasoning, Q41 से Q80 Quant, Q81 से Q105 English):
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoDistributeQuestions}
                      className="text-[11px] font-bold px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-purple-100 border border-purple-500 rounded-xl transition shadow-2xs shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Auto Equal Split ({Math.floor(questions.length / sections.length)} Qs/Sec)
                    </button>
                  </div>

                  {/* Section Range Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sections.map((sec, sIdx) => {
                      const assignedQs = questions.filter((q) => q.sectionId === sec.id);

                      // Compute smart defaults if rangeInputs not explicitly set
                      const perSec = Math.floor(questions.length / sections.length);
                      const remainder = questions.length % sections.length;
                      let defaultStart = 1;
                      for (let i = 0; i < sIdx; i++) {
                        defaultStart += perSec + (i < remainder ? 1 : 0);
                      }
                      let defaultEnd = defaultStart + (perSec + (sIdx < remainder ? 1 : 0)) - 1;
                      defaultEnd = Math.min(defaultEnd, questions.length);

                      const currentFrom = rangeInputs[sec.id]?.from ?? defaultStart;
                      const currentTo = rangeInputs[sec.id]?.to ?? defaultEnd;

                      return (
                        <div key={sec.id} className="bg-purple-950/80 p-3.5 rounded-xl border border-purple-700/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-purple-100">
                            <span className="truncate">{sec.name}</span>
                            <span className="text-[10px] bg-purple-800 px-2 py-0.5 rounded-full text-purple-200 font-mono">
                              {assignedQs.length} Qs assigned
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1">
                              <span className="text-[10px] font-semibold text-purple-300 block mb-0.5">From Q#</span>
                              <input
                                type="number"
                                min="1"
                                max={questions.length}
                                value={currentFrom}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setRangeInputs((prev) => ({
                                    ...prev,
                                    [sec.id]: { from: val, to: prev[sec.id]?.to ?? currentTo },
                                  }));
                                }}
                                className="w-full text-xs font-bold p-1.5 rounded-lg bg-purple-900 border border-purple-700 text-white focus:ring-2 focus:ring-purple-400"
                              />
                            </div>

                            <span className="text-purple-400 mt-4 font-bold">-</span>

                            <div className="flex-1">
                              <span className="text-[10px] font-semibold text-purple-300 block mb-0.5">To Q#</span>
                              <input
                                type="number"
                                min="1"
                                max={questions.length}
                                value={currentTo}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || questions.length;
                                  setRangeInputs((prev) => ({
                                    ...prev,
                                    [sec.id]: { from: prev[sec.id]?.from ?? currentFrom, to: val },
                                  }));
                                }}
                                className="w-full text-xs font-bold p-1.5 rounded-lg bg-purple-900 border border-purple-700 text-white focus:ring-2 focus:ring-purple-400"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAssignRangeToSection(sec.id, currentFrom, currentTo)}
                              className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition"
                              title={`Assign Q${currentFrom} to Q${currentTo} to ${sec.name}`}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleApplyAllSectionRanges}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Apply All Ranges (सभी रेंज एक साथ लागू करें)
                    </button>
                  </div>
                </div>
              )}

              {/* Import Methods Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Add Questions ({activeSectionFilter === 'all' ? questions.length : questions.filter((q) => q.sectionId === activeSectionFilter).length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated Total Marks: <span className="font-bold text-blue-600">{calculatedTotalMarks}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(null);
                      setShowManualForm(true);
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Manual Entry
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWordModal(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <WordIcon className="w-3.5 h-3.5" /> Word (.docx)
                  </button>

                  <button
                    type="button"
                    onClick={downloadSampleDocxFile}
                    title="Download pre-formatted sample Word template"
                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-xl text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Sample Word (.docx)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowExcelModal(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Form Modal / Inline Editor */}
              {showManualForm && (
                <ManualQuestionForm
                  sections={sections}
                  defaultSectionId={activeSectionFilter !== 'all' ? activeSectionFilter : undefined}
                  initialQuestion={editingQuestion || undefined}
                  onSave={handleSaveQuestion}
                  onCancel={() => {
                    setShowManualForm(false);
                    setEditingQuestion(null);
                  }}
                />
              )}

              {/* Questions List Preview */}
              {questions.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No questions added to this test yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Use Manual Entry, Bulk Word import, or Excel spreadsheet import above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions
                    .filter((q) => activeSectionFilter === 'all' || q.sectionId === activeSectionFilter)
                    .map((q, idx) => {
                      const matchedSec = sections.find((s) => s.id === q.sectionId);
                      return (
                        <div
                          key={q.id}
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <FormattedText content={q.text} className="text-xs font-bold text-slate-900 flex-1" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px]">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md">
                                +{q.positiveMarks} / -{q.negativeMarks} Marks
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md uppercase">
                                {q.type.replace('_', ' ')}
                              </span>
                              {sections.length > 0 ? (
                                <select
                                  value={q.sectionId || ''}
                                  onChange={(e) => {
                                    const secId = e.target.value;
                                    const targetSec = sections.find((s) => s.id === secId);
                                    const updated = questions.map((item) =>
                                      item.id === q.id
                                        ? {
                                            ...item,
                                            sectionId: secId || undefined,
                                            subject: targetSec ? targetSec.name : item.subject,
                                            positiveMarks: targetSec ? targetSec.positiveMarks : item.positiveMarks,
                                            negativeMarks: targetSec ? targetSec.negativeMarks : item.negativeMarks,
                                          }
                                        : item
                                    );
                                    setQuestions(updated);
                                  }}
                                  className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md text-[10px] border border-purple-200 focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                >
                                  <option value="">-- Select Section --</option>
                                  {sections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                      Section: {sec.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                q.subject && (
                                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-medium rounded-md">
                                    {q.subject}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestion(q);
                                setShowManualForm(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Test Published Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your mock test series is live and ready for students. Share the link or QR code below.
                </p>
              </div>

              {/* Share URL Box */}
              <div className="max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">Shareable Test Link</label>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-300">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-transparent text-xs font-mono text-slate-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Share & QR Code */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
                >
                  <QrCode className="w-4 h-4 text-blue-400" /> Show QR Code
                </button>
                <button
                  type="button"
                  onClick={handleTestLinkAsStudent}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
                >
                  <ExternalLink className="w-4 h-4" /> Test Link as Student
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl bg-white border border-slate-300 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              form="step-1-form"
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition ml-auto"
            >
              Next: Add Questions <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handlePublishTest}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition ml-auto"
            >
              Publish Test & Get Share Link <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs ml-auto"
            >
              Done & Return to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <WordImportModal
        isOpen={showWordModal}
        sections={sections}
        defaultSectionId={activeSectionFilter !== 'all' ? activeSectionFilter : undefined}
        onClose={() => setShowWordModal(false)}
        onImportQuestions={handleBulkImport}
      />

      <ExcelImportModal
        isOpen={showExcelModal}
        sections={sections}
        defaultSectionId={activeSectionFilter !== 'all' ? activeSectionFilter : undefined}
        onClose={() => setShowExcelModal(false)}
        onImportQuestions={handleBulkImport}
      />

      {showQrModal && savedTestId && (
        <QRCodeModal
          testTitle={title}
          shareUrl={shareUrl}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
