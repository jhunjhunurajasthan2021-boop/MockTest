import React, { useState, useEffect } from 'react';
import { MockTest, StudentInfo, StudentAnswer, TestAttempt, SectionAttempt } from '../../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
import { FormattedText } from '../common/FormattedText';
import {
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Check,
  AlertTriangle,
  Send,
  X,
  Maximize2,
  Layers,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface TestRunnerProps {
  test: MockTest;
  student: StudentInfo;
  onComplete: (attempt: TestAttempt) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ test, student, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({ [test.questions[0]?.id]: true });
  const [startTimeMs] = useState<number>(Date.now());
  const [questionTimeTrack, setQuestionTimeTrack] = useState<Record<string, number>>({});
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('All');
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showProctorWarning, setShowProctorWarning] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Section Management States
  const [submittedSections, setSubmittedSections] = useState<Record<string, boolean>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>(
    test.sections && test.sections.length > 0 ? test.sections[0].id : 'all'
  );
  const [showSectionSubmitModal, setShowSectionSubmitModal] = useState<boolean>(false);
  const [sectionToSubmit, setSectionToSubmit] = useState<string | null>(null);

  // Extract Subjects
  const subjects = ['All', ...Array.from(new Set(test.questions.map((q) => q.subject).filter(Boolean)))];

  // Anti-Cheating Proctoring Tab Switch Listener
  useEffect(() => {
    if (!test.settings.preventTabSwitching) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowProctorWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [test.settings.preventTabSwitching]);

  // Track time spent per question
  useEffect(() => {
    const activeQ = test.questions[currentIndex];
    if (!activeQ) return;

    const interval = setInterval(() => {
      setQuestionTimeTrack((prev) => ({
        ...prev,
        [activeQ.id]: (prev[activeQ.id] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, test.questions]);

  const currentQ = test.questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;

    const existing = answers[currentQ.id] || {
      questionId: currentQ.id,
      selectedOptionIds: [],
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    };

    if (currentQ.type === 'mcq_single' || currentQ.type === 'true_false') {
      setAnswers({
        ...answers,
        [currentQ.id]: {
          ...existing,
          selectedOptionIds: [optionId],
        },
      });
    } else if (currentQ.type === 'mcq_multiple') {
      const currentSelected = existing.selectedOptionIds || [];
      const updated = currentSelected.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...currentSelected, optionId];

      setAnswers({
        ...answers,
        [currentQ.id]: {
          ...existing,
          selectedOptionIds: updated,
        },
      });
    }
  };

  const handleTextAnswerChange = (val: string) => {
    if (!currentQ) return;
    const existing = answers[currentQ.id] || {
      questionId: currentQ.id,
      textAnswer: '',
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    };

    setAnswers({
      ...answers,
      [currentQ.id]: {
        ...existing,
        textAnswer: val,
      },
    });
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    const updated = { ...answers };
    delete updated[currentQ.id];
    setAnswers(updated);
  };

  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    const existing = answers[currentQ.id] || {
      questionId: currentQ.id,
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    };

    setAnswers({
      ...answers,
      [currentQ.id]: {
        ...existing,
        isMarkedForReview: !existing.isMarkedForReview,
      },
    });
  };

  const handleNavigate = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= test.questions.length) return;
    setCurrentIndex(newIdx);
    const targetQ = test.questions[newIdx];
    if (targetQ) {
      setVisited((prev) => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Section Submission Handlers
  const handleConfirmSectionSubmit = (secId: string) => {
    setSubmittedSections((prev) => ({ ...prev, [secId]: true }));
    setShowSectionSubmitModal(false);
    setSectionToSubmit(null);

    // Switch to next unsubmitted section if available
    if (test.sections && test.sections.length > 0) {
      const nextUnsub = test.sections.find((s) => s.id !== secId && !submittedSections[s.id]);
      if (nextUnsub) {
        setActiveSectionId(nextUnsub.id);
        const firstQIdx = test.questions.findIndex((q) => q.sectionId === nextUnsub.id);
        if (firstQIdx !== -1) {
          setCurrentIndex(firstQIdx);
          setVisited((prev) => ({ ...prev, [test.questions[firstQIdx].id]: true }));
        }
      } else {
        // All sections submitted! Open final submit modal
        setShowSubmitModal(true);
      }
    }
  };

  // Evaluate final test submission
  const calculateFinalAttempt = (): TestAttempt => {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const sectionBreakdown: SectionAttempt[] = [];

    if (test.sections && test.sections.length > 0) {
      test.sections.forEach((sec) => {
        let secScore = 0;
        let secCorrect = 0;
        let secIncorrect = 0;
        let secUnattempted = 0;
        const secQs = test.questions.filter((q) => q.sectionId === sec.id);

        secQs.forEach((q) => {
          const ans = answers[q.id];
          const hasAnswer =
            ans &&
            ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
              (ans.textAnswer && ans.textAnswer.trim().length > 0));

          if (!hasAnswer) {
            secUnattempted += 1;
            return;
          }

          let isCorrect = false;

          if (q.type === 'mcq_single' || q.type === 'true_false') {
            const selectedId = ans.selectedOptionIds?.[0];
            const correctOpt = q.options.find((o) => o.isCorrect);
            if (selectedId && correctOpt && selectedId === correctOpt.id) {
              isCorrect = true;
            }
          } else if (q.type === 'mcq_multiple') {
            const correctOptIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
            const userSelected = ans.selectedOptionIds || [];
            if (
              userSelected.length === correctOptIds.length &&
              userSelected.every((id) => correctOptIds.includes(id))
            ) {
              isCorrect = true;
            }
          } else if (q.type === 'integer' || q.type === 'fill_blanks') {
            const userVal = (ans.textAnswer || '').trim().toLowerCase();
            const correctVal = (q.correctAnswer || '').trim().toLowerCase();
            if (userVal === correctVal) {
              isCorrect = true;
            }
          }

          const posMarks = q.positiveMarks ?? sec.positiveMarks ?? 1;
          const negMarks = q.negativeMarks ?? sec.negativeMarks ?? 0;

          if (isCorrect) {
            secCorrect += 1;
            secScore += posMarks;
          } else {
            secIncorrect += 1;
            if (test.settings.enableNegativeMarking) {
              secScore -= negMarks;
            }
          }
        });

        const secTotalMarks = secQs.reduce((sum, q) => sum + (q.positiveMarks ?? sec.positiveMarks ?? 1), 0) || 1;
        const secPercentage = Math.max(0, (secScore / secTotalMarks) * 100);

        sectionBreakdown.push({
          sectionId: sec.id,
          sectionName: sec.name,
          score: secScore,
          totalMarks: secTotalMarks,
          percentage: secPercentage,
          correctCount: secCorrect,
          incorrectCount: secIncorrect,
          unattemptedCount: secUnattempted,
          isSubmitted: submittedSections[sec.id] || false,
        });

        score += secScore;
        correctCount += secCorrect;
        incorrectCount += secIncorrect;
        unattemptedCount += secUnattempted;
      });
    } else {
      // Fallback for Subjective single-subject tests
      test.questions.forEach((q) => {
        const ans = answers[q.id];
        const hasAnswer =
          ans &&
          ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
            (ans.textAnswer && ans.textAnswer.trim().length > 0));

        if (!hasAnswer) {
          unattemptedCount += 1;
          return;
        }

        let isCorrect = false;

        if (q.type === 'mcq_single' || q.type === 'true_false') {
          const selectedId = ans.selectedOptionIds?.[0];
          const correctOpt = q.options.find((o) => o.isCorrect);
          if (selectedId && correctOpt && selectedId === correctOpt.id) {
            isCorrect = true;
          }
        } else if (q.type === 'mcq_multiple') {
          const correctOptIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
          const userSelected = ans.selectedOptionIds || [];
          if (
            userSelected.length === correctOptIds.length &&
            userSelected.every((id) => correctOptIds.includes(id))
          ) {
            isCorrect = true;
          }
        } else if (q.type === 'integer' || q.type === 'fill_blanks') {
          const userVal = (ans.textAnswer || '').trim().toLowerCase();
          const correctVal = (q.correctAnswer || '').trim().toLowerCase();
          if (userVal === correctVal) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          correctCount += 1;
          score += q.positiveMarks;
        } else {
          incorrectCount += 1;
          if (test.settings.enableNegativeMarking) {
            score -= q.negativeMarks;
          }
        }
      });
    }

    const totalMarks = test.totalMarks || 1;
    const percentage = Math.max(0, (score / totalMarks) * 100);
    const passed = percentage >= test.settings.passingPercentage;
    const timeTakenSeconds = Math.max(1, Math.floor((Date.now() - startTimeMs) / 1000));

    return {
      id: `attempt-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      student,
      answers,
      score,
      totalMarks,
      percentage,
      passed,
      correctCount,
      incorrectCount,
      unattemptedCount,
      startedAt: new Date(startTimeMs).toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      tabSwitchCount,
      sectionBreakdown: sectionBreakdown.length > 0 ? sectionBreakdown : undefined,
    };
  };

  const handleFinalSubmit = () => {
    const attempt = calculateFinalAttempt();
    onComplete(attempt);
  };

  // Palette Status helper
  const getQuestionStatus = (qId: string) => {
    const ans = answers[qId];
    const isAns =
      ans &&
      ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
        (ans.textAnswer && ans.textAnswer.trim().length > 0));
    const isMarked = ans?.isMarkedForReview;
    const isVis = visited[qId];

    if (isAns && isMarked) return 'ans_marked';
    if (isMarked) return 'marked';
    if (isAns) return 'answered';
    if (isVis) return 'not_answered';
    return 'not_visited';
  };

  // Summary counters for submit modal
  const answeredCount = Object.keys(answers).filter((qId) => {
    const ans = answers[qId];
    return (
      ans &&
      ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
        (ans.textAnswer && ans.textAnswer.trim().length > 0))
    );
  }).length;

  const markedCount = Object.keys(answers).filter((qId) => answers[qId]?.isMarkedForReview).length;
  const notAnsweredCount = test.questions.length - answeredCount;

  const filteredQuestions =
    activeSubjectFilter === 'All'
      ? test.questions
      : test.questions.filter((q) => q.subject === activeSubjectFilter);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Examination Sticky Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CoachingBrandingHeader test={test} variant="topbar" />
            <div className="hidden md:block h-6 w-px bg-slate-700" />
            <div className="hidden md:block">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight truncate max-w-xs text-blue-200">
                {test.title}
              </h1>
              <p className="text-[10px] text-slate-400">
                Candidate: <span className="text-slate-200 font-bold">{student.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CountdownTimer
              durationMinutes={test.durationMinutes}
              startTimeMs={startTimeMs}
              onExpire={handleFinalSubmit}
              warnAtSeconds={300}
            />

            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Proctoring Warning Toast */}
      {showProctorWarning && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-2 shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Proctoring Warning: Browser tab switch detected ({tabSwitchCount} total). Please remain on the exam tab.
            </span>
          </div>
          <button onClick={() => setShowProctorWarning(false)} className="p-1 hover:bg-amber-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Navigation Tabs for Multi-Section Full Mock Tests */}
      {test.testType === 'full' && test.sections && test.sections.length > 0 && (
        <div className="bg-purple-900 text-white px-4 py-2 border-b border-purple-800 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-purple-200 tracking-wider flex items-center gap-1 shrink-0">
                <Layers className="w-4 h-4 text-purple-400" /> Exam Sections:
              </span>
              <div className="flex items-center gap-2">
                {test.sections.map((sec) => {
                  const isSubmitted = submittedSections[sec.id];
                  const isActive = activeSectionId === sec.id;
                  const secQs = test.questions.filter((q) => q.sectionId === sec.id);
                  const answeredInSec = secQs.filter((q) => {
                    const ans = answers[q.id];
                    return ans && ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) || (ans.textAnswer && ans.textAnswer.trim().length > 0));
                  }).length;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSectionId(sec.id);
                        const firstQIdx = test.questions.findIndex((q) => q.sectionId === sec.id);
                        if (firstQIdx !== -1) {
                          setCurrentIndex(firstQIdx);
                          setVisited((prev) => ({ ...prev, [test.questions[firstQIdx].id]: true }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        isActive
                          ? 'bg-white text-purple-950 shadow-md ring-2 ring-purple-300'
                          : isSubmitted
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-700/60'
                          : 'bg-purple-800/80 hover:bg-purple-800 text-purple-100 border border-purple-700'
                      }`}
                    >
                      <span>{sec.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-purple-100 text-purple-900' : 'bg-purple-950 text-purple-200'
                        }`}
                      >
                        {answeredInSec}/{secQs.length}
                      </span>
                      {isSubmitted && <Lock className="w-3 h-3 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Current Section Action Button */}
            {activeSectionId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setSectionToSubmit(activeSectionId);
                  setShowSectionSubmitModal(true);
                }}
                disabled={submittedSections[activeSectionId]}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submittedSections[activeSectionId] ? 'Section Submitted' : 'Submit Section & Proceed'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Exam Grid Area */}
      <div className="max-w-7xl mx-auto w-full flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Question Viewing Pane */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden min-h-[70vh]">
          {/* Question Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-white font-black text-xs px-3 py-1 rounded-xl">
                Question {currentIndex + 1} of {test.questions.length}
              </span>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                +{currentQ.positiveMarks} / -{currentQ.negativeMarks} Marks
              </span>
              {currentQ.subject && (
                <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                  {currentQ.subject}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleMarkForReview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                answers[currentQ.id]?.isMarkedForReview
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {answers[currentQ.id]?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

          {/* Question Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <FormattedText
              content={currentQ.text}
              className="text-sm sm:text-base font-semibold text-slate-900"
            />

            {currentQ.imageUrl && (
              <img
                src={currentQ.imageUrl}
                alt="Question Diagram"
                className="max-h-64 rounded-xl border border-slate-200 shadow-2xs object-contain"
              />
            )}

            {/* Response Options */}
            {currentQ.type === 'integer' || currentQ.type === 'fill_blanks' ? (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Answer *</label>
                <input
                  type="text"
                  value={answers[currentQ.id]?.textAnswer || ''}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                  placeholder="Enter your numeric or short text answer..."
                  className="w-full max-w-sm p-3 border border-slate-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {currentQ.options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isSelected = answers[currentQ.id]?.selectedOptionIds?.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <FormattedText content={opt.text} className="text-xs sm:text-sm flex-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearResponse}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-white border border-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Selection
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => handleNavigate(currentIndex - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentIndex < test.questions.length - 1) {
                    handleNavigate(currentIndex + 1);
                  } else {
                    setShowSubmitModal(true);
                  }
                }}
                className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Question Palette & Legend Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
              Question Palette Grid
            </h3>

            {/* Subject Tabs if available */}
            {subjects.length > 2 && (
              <div className="flex flex-wrap gap-1">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubjectFilter(sub)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      activeSubjectFilter === sub
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Palette Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
              {filteredQuestions.map((q) => {
                const globalIdx = test.questions.findIndex((item) => item.id === q.id);
                const status = getQuestionStatus(q.id);
                const isCurrent = globalIdx === currentIndex;

                let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300'; // not visited
                if (status === 'answered') colorClasses = 'bg-emerald-600 text-white border-emerald-600';
                else if (status === 'not_answered') colorClasses = 'bg-rose-500 text-white border-rose-500';
                else if (status === 'marked') colorClasses = 'bg-purple-600 text-white border-purple-600';
                else if (status === 'ans_marked') colorClasses = 'bg-purple-700 text-white border-purple-700 ring-2 ring-emerald-400';

                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavigate(globalIdx)}
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center border transition relative ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 font-black' : ''
                    }`}
                  >
                    {globalIdx + 1}
                    {status === 'ans_marked' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Color Legend */}
            <div className="space-y-2 pt-4 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shrink-0" />
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-purple-600 shrink-0" />
                <span>Marked for Review ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-200 shrink-0" />
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Final Submit Test
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Exam Submission?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to finish and submit your test?
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Answered</span>
                <span className="text-lg font-black text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Unanswered</span>
                <span className="text-lg font-black text-rose-600">{notAnsweredCount}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Review</span>
                <span className="text-lg font-black text-purple-600">{markedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Return to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Section Submit Confirmation Modal */}
      {showSectionSubmitModal && sectionToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 max-w-md w-full p-6 text-center space-y-5">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Submit Section: {test.sections?.find((s) => s.id === sectionToSubmit)?.name}?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Once submitted, answers in this section will be locked and you will move to the next section. (अनुभाग सबमिट करने के बाद आप अगले सेक्शन में चले जाएंगे।)
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSectionSubmitModal(false);
                  setSectionToSubmit(null);
                }}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Continue Section
              </button>
              <button
                type="button"
                onClick={() => handleConfirmSectionSubmit(sectionToSubmit)}
                className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
              >
                Submit Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
