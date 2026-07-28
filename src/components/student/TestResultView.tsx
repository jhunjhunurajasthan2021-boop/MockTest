import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { TestAttempt } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateResultPDF } from '../../utils/pdfGenerator';
import { CoachingBrandingHeader } from '../common/CoachingBrandingHeader';
import { FormattedText } from '../common/FormattedText';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  BarChart2,
  Download,
  Filter,
  Megaphone,
  ExternalLink,
  EyeOff,
  Lock,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { LogOut } from 'lucide-react';

interface TestResultViewProps {
  attempt: TestAttempt;
  onRetake: () => void;
  onExit?: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({ attempt, onRetake, onExit }) => {
  const { tests } = useApp();
  const test = tests.find((t) => t.id === attempt.testId);

  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');

  const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // Trigger celebration confetti if student passed!
  useEffect(() => {
    if (attempt.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.passed]);

  const questions = test?.questions || [];
  const showResults = test ? test.settings.showResultImmediately : true;

  if (!showResults) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Test Submitted Successfully!</h1>
            <p className="text-xs font-bold text-emerald-700 mt-1">
              (उत्तर सफलतापूर्वक दर्ज कर लिए गए हैं)
            </p>
            <p className="text-xs text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-800">{attempt.student.name}</strong>. Your test attempt for <strong className="text-slate-800">{attempt.testTitle}</strong> has been saved securely.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Candidate Name:</span>
              <span className="font-bold text-slate-900">{attempt.student.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Submission Time:</span>
              <span className="font-bold text-slate-900">{new Date(attempt.submittedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Duration Spent:</span>
              <span className="font-bold text-slate-900">
                {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-500">Result & Answers:</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                Hidden by Teacher
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 text-left">
            <p className="font-bold mb-1">ℹ️ Result Visibility Note (परिणाम गोपनीयता):</p>
            <p className="leading-relaxed">
              The teacher has configured this test to hide instant marks and answer solutions upon submission. Your evaluation and scorecard will be shared by your teacher or institute directly.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const accuracy =
    attempt.correctCount + attempt.incorrectCount > 0
      ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.incorrectCount)) * 100)
      : 0;

  const pieData = [
    { name: 'Correct', value: attempt.correctCount, color: '#10B981' },
    { name: 'Incorrect', value: attempt.incorrectCount, color: '#EF4444' },
    { name: 'Unattempted', value: attempt.unattemptedCount, color: '#94A3B8' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Coaching Institute Branding Banner */}
      <CoachingBrandingHeader test={test} variant="hero" />

      {/* Scorecard Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xs relative overflow-hidden border ${
          attempt.passed
            ? 'border-emerald-200 border-l-8 border-l-emerald-600'
            : 'border-rose-200 border-l-8 border-l-rose-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase mb-3 ${
                attempt.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {attempt.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              {attempt.passed ? 'PASSED EXAM' : 'NEEDS IMPROVEMENT'}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{attempt.testTitle}</h1>
            <p className="text-xs text-slate-600 mt-1.5 font-medium">
              Candidate: <span className="font-bold text-slate-900">{attempt.student.name}</span> • Completed {new Date(attempt.submittedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="text-center bg-slate-50 p-5 rounded-xl border border-slate-200/90 shrink-0 min-w-[150px]">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Score</span>
            <span className="text-3xl font-black text-slate-900">{attempt.score}</span>
            <span className="text-xs text-slate-500 block font-semibold">/ {attempt.totalMarks} Marks</span>
            <span className="text-xs font-black text-blue-700 mt-1 block bg-blue-50 py-0.5 px-2 rounded-md border border-blue-100">{attempt.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateResultPDF(attempt)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" /> Download PDF Report Card
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition border border-slate-300"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" /> Retake Test
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              <LogOut className="w-4 h-4" /> Exit Examination (सत्र समाप्त)
            </button>
          )}
        </div>
      </div>

      {/* Promotional Course Ad Banner on Test Result / Submission Page */}
      {test?.resultAd?.enabled && (test.resultAd.title || test.resultAd.imageUrl) && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-0.5 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-[15px] overflow-hidden p-6 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="space-y-3 z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5 text-amber-600" /> Next Step Course Recommendation (कोर्स विज्ञापन)
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {test.resultAd.title || 'Recommended Course for Your Further Studies'}
              </h2>
              {test.resultAd.description && (
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
                  {test.resultAd.description}
                </p>
              )}

              {test.resultAd.courseUrl && (
                <a
                  href={formatExternalUrl(test.resultAd.courseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {test.resultAd.buttonText || '👉 Explore Recommended Course'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Banner Image Preview / Clickable Thumbnail */}
            {test.resultAd.imageUrl && (
              <a
                href={formatExternalUrl(test.resultAd.courseUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative shrink-0 w-full md:w-64 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl hover:border-amber-300 transition"
              >
                <img
                  src={test.resultAd.imageUrl}
                  alt="Promotional Banner"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
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

      {/* Metrics Grid & Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Accuracy Rate</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{accuracy}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Correct vs attempted questions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Time Taken</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Duration spent in exam</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Correct Answers</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{attempt.correctCount}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">+{attempt.correctCount * 4} Marks gained</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Incorrect Answers</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{attempt.incorrectCount}</p>
            <p className="text-[11px] text-rose-700 mt-0.5">-{attempt.incorrectCount * 1} Penalty marks</p>
          </div>
        </div>

        {/* Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Question Breakdown</h3>
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-[10px] font-bold">
            <span className="text-emerald-600">● {attempt.correctCount} Correct</span>
            <span className="text-rose-600">● {attempt.incorrectCount} Incorrect</span>
            <span className="text-slate-500">● {attempt.unattemptedCount} Skipped</span>
          </div>
        </div>
      </div>

      {/* Section Performance Breakdown Table for Full Mock Tests */}
      {attempt.sectionBreakdown && attempt.sectionBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-600" /> Section-wise Performance Summary
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {attempt.sectionBreakdown.length} Sections Evaluated
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs font-medium text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Section Name</th>
                  <th className="p-3 text-center">Correct</th>
                  <th className="p-3 text-center">Incorrect</th>
                  <th className="p-3 text-center">Unattempted</th>
                  <th className="p-3 text-center">Score / Total Marks</th>
                  <th className="p-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempt.sectionBreakdown.map((sec) => (
                  <tr key={sec.sectionId} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{sec.sectionName}</td>
                    <td className="p-3 text-center font-bold text-emerald-600">+{sec.correctCount}</td>
                    <td className="p-3 text-center font-bold text-rose-600">-{sec.incorrectCount}</td>
                    <td className="p-3 text-center font-medium text-slate-500">{sec.unattemptedCount}</td>
                    <td className="p-3 text-center font-extrabold text-slate-900">
                      {sec.score} / {sec.totalMarks}
                    </td>
                    <td className="p-3 text-right font-black text-purple-700">
                      {sec.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Solutions Key Section */}
      {(() => {
        const showSolutions = test ? test.settings.showSolutionsToStudent !== false : true;

        if (!showSolutions) {
          return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <EyeOff className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Detailed Solutions Hidden by Teacher (विस्तृत उत्तर उपलब्ध नहीं हैं)
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The teacher has configured this test to hide question solutions and detailed explanations after submission. Please contact your instructor for review or solution keys.
              </p>
            </div>
          );
        }

        return (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Detailed Answer Solutions Key</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review your responses against official explanations and correct answers.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl">
                {(['all', 'correct', 'incorrect', 'unattempted'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSolutionFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      solutionFilter === f ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-200 p-6 space-y-6">
              {questions
                .filter((q) => {
                  const ans = attempt.answers[q.id];
                  const hasAnswer =
                    ans &&
                    ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                      (ans.textAnswer && ans.textAnswer.trim().length > 0));

                  if (solutionFilter === 'unattempted') return !hasAnswer;

                  let isCorrect = false;
                  if (hasAnswer) {
                    if (q.type === 'mcq_single' || q.type === 'true_false') {
                      const correctOpt = q.options.find((o) => o.isCorrect);
                      if (ans.selectedOptionIds?.[0] === correctOpt?.id) isCorrect = true;
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
                      if ((ans.textAnswer || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase()) {
                        isCorrect = true;
                      }
                    }
                  }

                  if (solutionFilter === 'correct') return isCorrect;
                  if (solutionFilter === 'incorrect') return hasAnswer && !isCorrect;
                  return true; // all
                })
                .map((q, idx) => {
                  const ans = attempt.answers[q.id];
                  const hasAnswer =
                    ans &&
                    ((ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                      (ans.textAnswer && ans.textAnswer.trim().length > 0));

                  let isCorrect = false;
                  if (hasAnswer) {
                    if (q.type === 'mcq_single' || q.type === 'true_false') {
                      const correctOpt = q.options.find((o) => o.isCorrect);
                      if (ans.selectedOptionIds?.[0] === correctOpt?.id) isCorrect = true;
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
                      if ((ans.textAnswer || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase()) {
                        isCorrect = true;
                      }
                    }
                  }

                  return (
                    <div key={q.id} className="pt-6 first:pt-0 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-bold text-slate-900 text-sm flex-1">
                          <span className="mr-1">Question {idx + 1}.</span>
                          <FormattedText content={q.text} className="inline-block align-top" />
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                            !hasAnswer
                              ? 'bg-slate-100 text-slate-600'
                              : isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {!hasAnswer ? 'UNATTEMPTED' : isCorrect ? `CORRECT (+${q.positiveMarks || 1})` : `INCORRECT (-${q.negativeMarks || 0})`}
                        </span>
                      </div>

                      {/* Question Image if Present */}
                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt="Question Illustration"
                          className="max-h-64 rounded-xl border border-slate-200 object-contain"
                        />
                      )}

                      {/* Options Comparison */}
                      {q.type === 'integer' || q.type === 'fill_blanks' ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <p>
                            Your Answer:{' '}
                            <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {ans?.textAnswer || 'None (Unattempted)'}
                            </span>
                          </p>
                          <p>
                            Correct Answer: <span className="font-bold text-emerald-700">{q.correctAnswer}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isUserSelected = ans?.selectedOptionIds?.includes(opt.id);
                            const isOptCorrect = opt.isCorrect;

                            let style = 'bg-slate-50 border-slate-200 text-slate-700';
                            if (isOptCorrect) {
                              style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                            } else if (isUserSelected && !isOptCorrect) {
                              style = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="font-bold shrink-0">{letter}.</span>
                                  <FormattedText content={opt.text} className="flex-1" />
                                </div>
                                {isOptCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                                {isUserSelected && !isOptCorrect && <X className="w-4 h-4 text-rose-600 shrink-0 ml-2" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Official Detailed Explanation / Solution Box */}
                      {(() => {
                        const correctOptionsList = q.options
                          .map((opt, oIdx) => (opt.isCorrect ? `Option ${String.fromCharCode(65 + oIdx)}` : null))
                          .filter(Boolean);

                        return (
                          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/90 text-xs text-blue-950 space-y-2">
                            <div className="flex items-center justify-between gap-2 border-b border-blue-200/70 pb-2">
                              <span className="font-black text-blue-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                                Detailed Solution & Official Answer (विस्तृत उत्तर एवं व्याख्या)
                              </span>
                              {q.type !== 'integer' && q.type !== 'fill_blanks' && correctOptionsList.length > 0 && (
                                <span className="font-bold text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Correct: {correctOptionsList.join(', ')}
                                </span>
                              )}
                              {(q.type === 'integer' || q.type === 'fill_blanks') && q.correctAnswer && (
                                <span className="font-bold text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                                  Correct Answer: {q.correctAnswer}
                                </span>
                              )}
                            </div>

                            {q.explanation && q.explanation.trim() ? (
                              <FormattedText content={q.explanation} className="text-slate-800 text-xs font-medium pt-1" />
                            ) : (
                              <div className="text-slate-600 italic text-[11px] pt-0.5">
                                Correct Answer: {correctOptionsList.length > 0 ? correctOptionsList.join(' | ') : q.correctAnswer || 'Not specified'}.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
